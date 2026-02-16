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

export interface GameWeapon {
  name: string;
  damage: number;
  fireRate: number; // shots per second
  ammoPerMag: number;
  reloadTime: number; // seconds
  range: number;
  accuracy: number; // 0-1
}

export interface GameProjectile {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  damage: number;
  shooterId: number;
  mesh?: THREE.Mesh;
}

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;

  private localPlayer: GamePlayer | null = null;
  private remotePlayers: Map<number, GamePlayer> = new Map();
  private projectiles: GameProjectile[] = [];
  private obstacles: THREE.Mesh[] = [];

  private gravity = 20;
  private moveSpeed = 10;
  private sprintSpeed = 15;
  private jumpForce = 8;

  private currentWeapon: GameWeapon = {
    name: "Rifle",
    damage: 25,
    fireRate: 10,
    ammoPerMag: 30,
    reloadTime: 2,
    range: 100,
    accuracy: 0.95,
  };

  private lastShotTime = 0;
  private isReloading = false;

  constructor(container: HTMLDivElement) {
    // Initialize Three.js
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 200, 500);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.6, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    this.scene.add(directionalLight);
  }

  private setupEnvironment() {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x228b22,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.userData = { isGround: true };
    this.scene.add(ground);

    // Create obstacles
    this.createObstacles();
  }

  private createObstacles() {
    const positions = [
      { x: -30, z: -30 },
      { x: 30, z: -30 },
      { x: -30, z: 30 },
      { x: 30, z: 30 },
      { x: 0, z: 0 },
      { x: -50, z: 0 },
      { x: 50, z: 0 },
    ];

    positions.forEach((pos) => {
      const geometry = new THREE.BoxGeometry(8, 8, 8);
      const material = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const obstacle = new THREE.Mesh(geometry, material);
      obstacle.position.set(pos.x, 4, pos.z);
      obstacle.castShadow = true;
      obstacle.receiveShadow = true;
      obstacle.userData = { isObstacle: true };
      this.scene.add(obstacle);
      this.obstacles.push(obstacle);
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

  private updatePlayerMovement(
    player: GamePlayer,
    input: GameInput,
    deltaTime: number
  ) {
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
    if (this.canMoveTo(newPos)) {
      player.position.copy(newPos);
    }

    // Apply gravity
    player.velocity.y -= this.gravity * deltaTime;

    // Check ground collision
    const groundY = this.getGroundHeight(player.position);
    if (player.position.y <= groundY) {
      player.position.y = groundY;
      player.velocity.y = 0;

      // Jump
      if (input.jump) {
        player.velocity.y = this.jumpForce;
      }
    } else {
      player.position.y += player.velocity.y * deltaTime;
    }
  }

  private updateCamera(input: GameInput) {
    if (!this.localPlayer) return;

    // Update rotation based on mouse movement
    const sensitivity = 0.005;
    this.localPlayer.rotation.y -= input.mouseDeltaX * sensitivity;
    this.localPlayer.rotation.x -= input.mouseDeltaY * sensitivity;

    // Clamp pitch
    this.localPlayer.rotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, this.localPlayer.rotation.x)
    );

    // Update camera position and rotation
    this.camera.position.copy(this.localPlayer.position);
    this.camera.position.y += 1.6; // Eye height
    this.camera.rotation.order = "YXZ";
    this.camera.rotation.y = this.localPlayer.rotation.y;
    this.camera.rotation.x = this.localPlayer.rotation.x;
  }

  private updateProjectiles(deltaTime: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];

      // Update position
      projectile.position.addScaledVector(projectile.velocity, deltaTime);

      // Check collisions
      if (this.checkProjectileCollision(projectile)) {
        this.projectiles.splice(i, 1);
        if (projectile.mesh) {
          this.scene.remove(projectile.mesh);
        }
      }

      // Remove if out of range
      if (projectile.position.length() > 500) {
        this.projectiles.splice(i, 1);
        if (projectile.mesh) {
          this.scene.remove(projectile.mesh);
        }
      }
    }
  }

  private canMoveTo(position: THREE.Vector3): boolean {
    const playerRadius = 0.3;

    for (const obstacle of this.obstacles) {
      const distance = position.distanceTo(obstacle.position);
      if (distance < playerRadius + 4) {
        return false;
      }
    }

    return true;
  }

  private getGroundHeight(position: THREE.Vector3): number {
    // Simple ground height calculation
    return 0;
  }

  private checkProjectileCollision(projectile: GameProjectile): boolean {
    for (const obstacle of this.obstacles) {
      const distance = projectile.position.distanceTo(obstacle.position);
      if (distance < 4) {
        return true;
      }
    }

    return false;
  }

  public shoot(): void {
    if (!this.localPlayer || !this.localPlayer.isAlive) return;
    if (this.isReloading) return;
    if (this.localPlayer.ammo <= 0) return;

    const now = Date.now();
    const timeSinceLastShot = (now - this.lastShotTime) / 1000;
    const fireInterval = 1 / this.currentWeapon.fireRate;

    if (timeSinceLastShot < fireInterval) return;

    this.lastShotTime = now;
    this.localPlayer.ammo--;

    // Create projectile
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyEuler(this.localPlayer.rotation);

    const projectile: GameProjectile = {
      position: this.camera.position.clone().add(direction.multiplyScalar(1)),
      velocity: direction.multiplyScalar(100),
      damage: this.currentWeapon.damage,
      shooterId: this.localPlayer.id,
    };

    this.projectiles.push(projectile);
  }

  public reload(): void {
    if (!this.localPlayer || this.isReloading) return;

    this.isReloading = true;
    setTimeout(() => {
      if (this.localPlayer) {
        this.localPlayer.ammo = this.currentWeapon.ammoPerMag;
      }
      this.isReloading = false;
    }, this.currentWeapon.reloadTime * 1000);
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
