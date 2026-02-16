export interface Weapon {
  id: string;
  name: string;
  type: "rifle" | "pistol" | "shotgun" | "smg" | "sniper" | "melee";
  damage: number;
  fireRate: number; // shots per second
  ammoPerMag: number;
  reloadTime: number; // seconds
  range: number; // meters
  accuracy: number; // 0-1
  recoil: number; // 0-1
  spread: number; // degrees
  bulletSpeed: number; // units per second
  weight: number; // affects movement speed
}

export const WEAPONS: Record<string, Weapon> = {
  rifle: {
    id: "rifle",
    name: "Rifle Assault",
    type: "rifle",
    damage: 25,
    fireRate: 10,
    ammoPerMag: 30,
    reloadTime: 2.5,
    range: 100,
    accuracy: 0.85,
    recoil: 0.4,
    spread: 2,
    bulletSpeed: 300,
    weight: 1,
  },
  pistol: {
    id: "pistol",
    name: "Pistola 9mm",
    type: "pistol",
    damage: 15,
    fireRate: 8,
    ammoPerMag: 15,
    reloadTime: 1.5,
    range: 50,
    accuracy: 0.75,
    recoil: 0.2,
    spread: 3,
    bulletSpeed: 250,
    weight: 0.5,
  },
  shotgun: {
    id: "shotgun",
    name: "Shotgun",
    type: "shotgun",
    damage: 60,
    fireRate: 1,
    ammoPerMag: 8,
    reloadTime: 3,
    range: 25,
    accuracy: 0.5,
    recoil: 0.8,
    spread: 15,
    bulletSpeed: 200,
    weight: 1.5,
  },
  smg: {
    id: "smg",
    name: "Metralhadora",
    type: "smg",
    damage: 12,
    fireRate: 20,
    ammoPerMag: 40,
    reloadTime: 2,
    range: 40,
    accuracy: 0.7,
    recoil: 0.6,
    spread: 4,
    bulletSpeed: 280,
    weight: 0.8,
  },
  sniper: {
    id: "sniper",
    name: "Sniper",
    type: "sniper",
    damage: 80,
    fireRate: 1,
    ammoPerMag: 5,
    reloadTime: 2.5,
    range: 300,
    accuracy: 0.98,
    recoil: 0.9,
    spread: 0.5,
    bulletSpeed: 400,
    weight: 2,
  },
  melee: {
    id: "melee",
    name: "Faca",
    type: "melee",
    damage: 50,
    fireRate: 2,
    ammoPerMag: 999,
    reloadTime: 0,
    range: 2,
    accuracy: 1,
    recoil: 0,
    spread: 0,
    bulletSpeed: 0,
    weight: 0.3,
  },
};

export class WeaponSystem {
  private currentWeapon: Weapon;
  private currentAmmo: number;
  private isReloading: boolean = false;
  private lastShotTime: number = 0;
  private recoilAmount: number = 0;

  constructor(weaponId: string = "rifle") {
    this.currentWeapon = WEAPONS[weaponId] || WEAPONS.rifle;
    this.currentAmmo = this.currentWeapon.ammoPerMag;
  }

  public getCurrentWeapon(): Weapon {
    return this.currentWeapon;
  }

  public getCurrentAmmo(): number {
    return this.currentAmmo;
  }

  public getMaxAmmo(): number {
    return this.currentWeapon.ammoPerMag;
  }

  public isReloadingNow(): boolean {
    return this.isReloading;
  }

  public canShoot(): boolean {
    if (this.isReloading) return false;
    if (this.currentAmmo <= 0) return false;

    const now = Date.now();
    const timeSinceLastShot = (now - this.lastShotTime) / 1000;
    const fireInterval = 1 / this.currentWeapon.fireRate;

    return timeSinceLastShot >= fireInterval;
  }

  public shoot(): boolean {
    if (!this.canShoot()) return false;

    this.lastShotTime = Date.now();
    this.currentAmmo--;

    // Apply recoil
    this.recoilAmount = this.currentWeapon.recoil;

    // Auto-reload when magazine is empty
    if (this.currentAmmo === 0) {
      this.reload();
    }

    return true;
  }

  public reload(): void {
    if (this.isReloading) return;
    if (this.currentAmmo === this.currentWeapon.ammoPerMag) return;

    this.isReloading = true;

    setTimeout(() => {
      this.currentAmmo = this.currentWeapon.ammoPerMag;
      this.isReloading = false;
    }, this.currentWeapon.reloadTime * 1000);
  }

  public switchWeapon(weaponId: string): void {
    if (WEAPONS[weaponId]) {
      this.currentWeapon = WEAPONS[weaponId];
      this.currentAmmo = this.currentWeapon.ammoPerMag;
      this.isReloading = false;
    }
  }

  public getRecoil(): number {
    const recoil = this.recoilAmount;
    this.recoilAmount *= 0.9; // Decay recoil
    return recoil;
  }

  public getSpread(): number {
    // Spread increases with fire rate and decreases with accuracy
    const baseSpread = this.currentWeapon.spread;
    const accuracyModifier = 1 - this.currentWeapon.accuracy;
    return baseSpread * (1 + accuracyModifier);
  }

  public getDamage(): number {
    return this.currentWeapon.damage;
  }

  public getRange(): number {
    return this.currentWeapon.range;
  }

  public getBulletSpeed(): number {
    return this.currentWeapon.bulletSpeed;
  }

  public getWeight(): number {
    return this.currentWeapon.weight;
  }
}
