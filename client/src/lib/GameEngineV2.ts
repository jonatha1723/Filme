import * as THREE from "three";
import { GameInput } from "@/hooks/useGameInput";

export interface GamePlayer {
  id: number;
  name: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  velocity: THREE.Vector3;
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  isAlive: boolean;
  mesh?: THREE.Mesh;
  camera?: THREE.PerspectiveCamera;
}

export interface GameProjectile {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  damage: number;
  shooterId: number;
  mesh?: THREE.Mesh;
  lifetime: number;
}

export interface Obstacle {
  position: THREE.Vector3;
  size: THREE.Vector3;
  mesh: THREE.Mesh;
}

export class GameEngineV2 {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;

  private localPlayer: GamePlayer | null = null;
  private projectiles: GameProjectile[] = [];
  private obstacles: Obstacle[] = [];

  // Physics constants
  private gravity = 25;
  private moveSpeed = 12;
  private sprintSpeed = 18;
  private jumpForce = 10;
  private playerRadius = 0.4;
  private playerHeight = 1.8;
  private friction = 0.85;

  constructor(container: HTMLDivElement) {
    // Initialize Three.js
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.Fog(0x1a1a2e, 300, 800);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.6, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    // Setup lighting
    this.setupLighting();

    // Setup environment
    this.setupEnvironment();

    // Handle window resize
    window.addEventListener("resize", () => this.onWindowResize());
  }

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(100, 150, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.bias = -0.0001;
    this.scene.add(directionalLight);

    // Add some point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0xff6b6b, 0.5, 100);
    pointLight1.position.set(-50, 30, -50);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4ecdc4, 0.5, 100);
    pointLight2.position.set(50, 30, 50);
    this.scene.add(pointLight2);
  }

  private setupEnvironment() {
    // Ground with better material
    const groundGeometry = new THREE.PlaneGeometry(600, 600);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a3e,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.userData = { isGround: true };
    this.scene.add(ground);

    // Create obstacles with better layout
    this.createObstacles();
  }

  private createObstacles() {
    const obstacleConfigs = [
      { x: -60, z: -60, w: 15, h: 12, d: 15 },
      { x: 60, z: -60, w: 15, h: 12, d: 15 },
      { x: -60, z: 60, w: 15, h: 12, d: 15 },
      { x: 60, z: 60, w: 15, h: 12, d: 15 },
      { x: 0, z: 0, w: 20, h: 15, d: 20 },
      { x: -80, z: 0, w: 12, h: 10, d: 12 },
      { x: 80, z: 0, w: 12, h: 10, d: 12 },
      { x: 0, z: -80, w: 12, h: 10, d: 12 },
      { x: 0, z: 80, w: 12, h: 10, d: 12 },
    ];

    obstacleConfigs.forEach((config) => {
      const geometry = new THREE.BoxGeometry(config.w, config.h, config.d);
      const material = new THREE.MeshStandardMaterial({
        color: 0x44546a,
        roughness: 0.7,
        metalness: 0.2,
      });
      const obstacle = new THREE.Mesh(geometry, material);
      obstacle.position.set(config.x, config.h / 2, config.z);
      obstacle.castShadow = true;
      obstacle.receiveShadow = true;
      obstacle.userData = { isObstacle: true };
      this.scene.add(obstacle);

      this.obstacles.push({
        position: obstacle.position.clone(),
        size: new THREE.Vector3(config.w, config.h, config.d),
        mesh: obstacle,
      });
    });
  }

  public initializeLocalPlayer(id: number, name: string, position: THREE.Vector3) {
    this.localPlayer = {
      id,
      name,
      position: position.clone(),
      rotation: new THREE.Euler(0, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      health: 100,
      maxHealth: 100,
      ammo: 30,
      maxAmmo: 30,
      isAlive: true,
    };

    this.camera.position.copy(this.localPlayer.position);
  }

  public update(input: GameInput, deltaTime: number) {
    if (!this.localPlayer) return;

    // Update local player movement
    this.updatePlayerMovement(this.localPlayer, input, deltaTime);

    // Update camera
    this.updateCamera(input);

    // Update projectiles
    this.updateProjectiles(deltaTime);

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  private updatePlayerMovement(player: GamePlayer, input: GameInput, deltaTime: number) {
    // Calculate movement direction
    const moveDirection = new THREE.Vector3();

    if (input.moveForward) moveDirection.z -= 1;
    if (input.moveBackward) moveDirection.z += 1;
    if (input.moveLeft) moveDirection.x -= 1;
    if (input.moveRight) moveDirection.x += 1;

    if (moveDirection.length() > 0) {
      moveDirection.normalize();
    }

    // Apply rotation to movement
    const speed = input.sprint ? this.sprintSpeed : this.moveSpeed;
    const moveVector = new THREE.Vector3();
    moveVector.copy(moveDirection);
    moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
    moveVector.multiplyScalar(speed * deltaTime);

    // Check collision and update position
    const newPos = player.position.clone().add(moveVector);
    if (this.canMoveTo(newPos, this.playerRadius)) {
      player.position.copy(newPos);
    } else {
      // Slide along obstacles
      const slideX = player.position.clone();
      slideX.x += moveVector.x;
      if (this.canMoveTo(slideX, this.playerRadius)) {
        player.position.x = slideX.x;
      }

      const slideZ = player.position.clone();
      slideZ.z += moveVector.z;
      if (this.canMoveTo(slideZ, this.playerRadius)) {
        player.position.z = slideZ.z;
      }
    }

    // Apply gravity
    player.velocity.y -= this.gravity * deltaTime;

    // Check ground collision
    const groundY = this.getGroundHeight(player.position);
    if (player.position.y <= groundY + this.playerRadius) {
      player.position.y = groundY + this.playerRadius;
      player.velocity.y = 0;

      // Jump
      if (input.jump) {
        player.velocity.y = this.jumpForce;
      }
    } else {
      player.position.y += player.velocity.y * deltaTime;
    }

    // Apply friction
    player.velocity.x *= this.friction;
    player.velocity.z *= this.friction;
  }

  private updateCamera(input: GameInput) {
    if (!this.localPlayer) return;

    // Update rotation based on mouse movement
    const sensitivity = 0.004;
    this.localPlayer.rotation.y -= input.mouseDeltaX * sensitivity;
    this.localPlayer.rotation.x -= input.mouseDeltaY * sensitivity;

    // Clamp pitch
    this.localPlayer.rotation.x = Math.max(
      -Math.PI / 2.5,
      Math.min(Math.PI / 2.5, this.localPlayer.rotation.x)
    );

    // Update camera position and rotation
    this.camera.position.copy(this.localPlayer.position);
    this.camera.position.y += this.playerHeight;
    this.camera.rotation.order = "YXZ";
    this.camera.rotation.y = this.localPlayer.rotation.y;
    this.camera.rotation.x = this.localPlayer.rotation.x;
  }

  private updateProjectiles(deltaTime: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];

      // Update position
      projectile.position.addScaledVector(projectile.velocity, deltaTime);
      projectile.lifetime -= deltaTime;

      // Check collisions
      if (this.checkProjectileCollision(projectile) || projectile.lifetime <= 0) {
        this.projectiles.splice(i, 1);
        if (projectile.mesh) {
          this.scene.remove(projectile.mesh);
        }
      }
    }
  }

  private canMoveTo(position: THREE.Vector3, radius: number): boolean {
    // Check boundaries
    if (Math.abs(position.x) > 300 || Math.abs(position.z) > 300) {
      return false;
    }

    // Check obstacles
    for (const obstacle of this.obstacles) {
      const dx = Math.max(
        Math.abs(position.x - obstacle.position.x) - obstacle.size.x / 2 - radius,
        0
      );
      const dy = Math.max(
        Math.abs(position.y - obstacle.position.y) - obstacle.size.y / 2,
        0
      );
      const dz = Math.max(
        Math.abs(position.z - obstacle.position.z) - obstacle.size.z / 2 - radius,
        0
      );

      if (dx * dx + dy * dy + dz * dz < 0.01) {
        return false;
      }
    }

    return true;
  }

  private getGroundHeight(position: THREE.Vector3): number {
    return 0;
  }

  private checkProjectileCollision(projectile: GameProjectile): boolean {
    for (const obstacle of this.obstacles) {
      const dx = Math.max(
        Math.abs(projectile.position.x - obstacle.position.x) - obstacle.size.x / 2,
        0
      );
      const dy = Math.max(
        Math.abs(projectile.position.y - obstacle.position.y) - obstacle.size.y / 2,
        0
      );
      const dz = Math.max(
        Math.abs(projectile.position.z - obstacle.position.z) - obstacle.size.z / 2,
        0
      );

      if (dx * dx + dy * dy + dz * dz < 1) {
        return true;
      }
    }

    return false;
  }

  public shoot(position: THREE.Vector3, direction: THREE.Vector3, damage: number): void {
    const projectile: GameProjectile = {
      position: position.clone(),
      velocity: direction.clone().multiplyScalar(150),
      damage,
      shooterId: this.localPlayer?.id || 0,
      lifetime: 10,
    };

    this.projectiles.push(projectile);
  }

  public takeDamage(damage: number): void {
    if (!this.localPlayer) return;

    this.localPlayer.health -= damage;
    if (this.localPlayer.health <= 0) {
      this.localPlayer.isAlive = false;
    }
  }

  public getLocalPlayer(): GamePlayer | null {
    return this.localPlayer;
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public dispose(): void {
    this.renderer.dispose();
  }

  private onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
