import * as THREE from 'three';

export interface Player {
  id: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  health: number;
  mesh?: THREE.Mesh;
}

export type QualityLevel = 'low' | 'medium' | 'high';

export class Mobile3DEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private players: Map<string, Player> = new Map();
  private playerMesh: THREE.Mesh | null = null;
  private cameraController: CameraController;
  private lights: THREE.Light[] = [];
  private qualityLevel: QualityLevel = 'medium';

  constructor(canvas: HTMLCanvasElement) {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.Fog(0x0f172a, 100, 500);

    // Camera setup - First person perspective
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.6, 0); // Eye level height

    // Detect device capability and set quality
    this.qualityLevel = this.detectQualityLevel();

    // Renderer setup - Optimized for mobile
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: this.qualityLevel === 'high', // Only enable on high quality
      powerPreference: this.qualityLevel === 'low' ? 'low-power' : 'default',
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(this.getPixelRatio());
    this.renderer.shadowMap.enabled = this.qualityLevel !== 'low';
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    // Camera controller
    this.cameraController = new CameraController(this.camera);

    // Setup lighting
    this.setupLights();

    // Create environment
    this.createEnvironment();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    this.scene.add(directionalLight);
    this.lights.push(directionalLight);
  }

  private createEnvironment() {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Sky
    const skyGeometry = new THREE.SphereGeometry(400, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: 0x1e3a5f,
      side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(sky);

    // Buildings/obstacles
    this.createBuildings();
  }

  private createBuildings() {
    const buildingPositions = [
      { x: 50, z: 50, w: 30, h: 40, d: 30 },
      { x: -50, z: 50, w: 25, h: 35, d: 25 },
      { x: 50, z: -50, w: 35, h: 45, d: 35 },
      { x: -50, z: -50, w: 30, h: 40, d: 30 },
      { x: 0, z: 100, w: 40, h: 50, d: 20 },
      { x: 0, z: -100, w: 40, h: 50, d: 20 },
    ];

    buildingPositions.forEach((pos) => {
      const geometry = new THREE.BoxGeometry(pos.w, pos.h, pos.d);
      const material = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.7,
        metalness: 0.1,
      });
      const building = new THREE.Mesh(geometry, material);
      building.position.set(pos.x, pos.h / 2, pos.z);
      building.castShadow = true;
      building.receiveShadow = true;
      this.scene.add(building);
    });
  }

  public addPlayer(id: string, position: THREE.Vector3, isLocalPlayer: boolean = false) {
    const geometry = new THREE.CapsuleGeometry(0.3, 1.8, 4, 8);
    const material = new THREE.MeshStandardMaterial({
      color: isLocalPlayer ? 0x3b82f6 : 0xef4444,
      roughness: 0.5,
      metalness: 0.3,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const player: Player = {
      id,
      position: position.clone(),
      rotation: new THREE.Euler(),
      health: 100,
      mesh,
    };

    this.players.set(id, player);
    this.scene.add(mesh);
  }

  public updatePlayerPosition(id: string, position: THREE.Vector3, rotation: THREE.Euler) {
    const player = this.players.get(id);
    if (player && player.mesh) {
      player.position.copy(position);
      player.rotation.copy(rotation);
      player.mesh.position.copy(position);
      player.mesh.rotation.copy(rotation);
    }
  }

  public removePlayer(id: string) {
    const player = this.players.get(id);
    if (player && player.mesh) {
      this.scene.remove(player.mesh);
    }
    this.players.delete(id);
  }

  public updateCameraRotation(deltaX: number, deltaY: number) {
    this.cameraController.update(deltaX, deltaY);
  }

  public moveCamera(direction: THREE.Vector3, speed: number = 0.1) {
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);

    this.camera.position.addScaledVector(forward, direction.z * speed);
    this.camera.position.addScaledVector(right, direction.x * speed);
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    this.renderer.dispose();
    window.removeEventListener('resize', () => this.onWindowResize());
  }

  private onWindowResize() {
    const width = this.renderer.domElement.clientWidth;
    const height = this.renderer.domElement.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private detectQualityLevel(): QualityLevel {
    // Check device memory (if available)
    const memory = (navigator as any).deviceMemory;
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    
    // High-end device: 6GB+ RAM and 6+ cores
    if (memory >= 6 && hardwareConcurrency >= 6) {
      return 'high';
    }
    
    // Low-end device: <4GB RAM or <4 cores
    if (memory < 4 || hardwareConcurrency < 4) {
      return 'low';
    }
    
    // Default to medium
    return 'medium';
  }

  private getPixelRatio(): number {
    const dpr = window.devicePixelRatio || 1;
    
    switch (this.qualityLevel) {
      case 'low':
        return Math.min(dpr, 1);
      case 'medium':
        return Math.min(dpr, 1.5);
      case 'high':
        return Math.min(dpr, 2);
      default:
        return 1;
    }
  }

  public setQualityLevel(level: QualityLevel) {
    this.qualityLevel = level;
    this.renderer.setPixelRatio(this.getPixelRatio());
    this.renderer.shadowMap.enabled = level !== 'low';
  }

  public getQualityLevel(): QualityLevel {
    return this.qualityLevel;
  }
}

class CameraController {
  private camera: THREE.Camera;
  private euler: THREE.Euler;
  private quaternion: THREE.Quaternion;
  private PI_2 = Math.PI / 2;

  constructor(camera: THREE.Camera) {
    this.camera = camera;
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.quaternion = new THREE.Quaternion();
  }

  public update(deltaX: number, deltaY: number) {
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= deltaX * 0.005;
    this.euler.x -= deltaY * 0.005;

    // Clamp pitch
    this.euler.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.euler.x));

    this.camera.quaternion.setFromEuler(this.euler);
  }
}
