import { describe, it, expect, beforeEach, vi } from "vitest";
import { WeaponSystem, WEAPONS } from "./WeaponSystem";

describe("WeaponSystem", () => {
  let weaponSystem: WeaponSystem;

  beforeEach(() => {
    weaponSystem = new WeaponSystem("rifle");
  });

  describe("initialization", () => {
    it("should initialize with rifle by default", () => {
      expect(weaponSystem.getCurrentWeapon().id).toBe("rifle");
    });

    it("should start with full magazine", () => {
      expect(weaponSystem.getCurrentAmmo()).toBe(WEAPONS.rifle.ammoPerMag);
    });

    it("should not be reloading initially", () => {
      expect(weaponSystem.isReloadingNow()).toBe(false);
    });
  });

  describe("shooting", () => {
    it("should be able to shoot when ammo is available", () => {
      expect(weaponSystem.canShoot()).toBe(true);
    });

    it("should decrease ammo when shooting", () => {
      const initialAmmo = weaponSystem.getCurrentAmmo();
      weaponSystem.shoot();
      expect(weaponSystem.getCurrentAmmo()).toBe(initialAmmo - 1);
    });

    it("should not be able to shoot when out of ammo", () => {
      // Empty the magazine
      for (let i = 0; i < WEAPONS.rifle.ammoPerMag; i++) {
        weaponSystem.shoot();
      }
      expect(weaponSystem.canShoot()).toBe(false);
    });

    it("should not be able to shoot while reloading", () => {
      weaponSystem.reload();
      expect(weaponSystem.canShoot()).toBe(false);
    });
  });

  describe("reloading", () => {
    it("should refill ammo after reload", async () => {
      // Shoot some bullets
      for (let i = 0; i < 5; i++) {
        weaponSystem.shoot();
      }

      const ammoBeforeReload = weaponSystem.getCurrentAmmo();
      expect(ammoBeforeReload).toBe(WEAPONS.rifle.ammoPerMag - 5);

      weaponSystem.reload();
      expect(weaponSystem.isReloadingNow()).toBe(true);

      // Wait for reload to complete
      await new Promise((resolve) => setTimeout(resolve, WEAPONS.rifle.reloadTime * 1000 + 100));

      expect(weaponSystem.getCurrentAmmo()).toBe(WEAPONS.rifle.ammoPerMag);
      expect(weaponSystem.isReloadingNow()).toBe(false);
    });

    it("should not reload if already at full ammo", () => {
      const initialAmmo = weaponSystem.getCurrentAmmo();
      weaponSystem.reload();
      expect(weaponSystem.isReloadingNow()).toBe(false);
      expect(weaponSystem.getCurrentAmmo()).toBe(initialAmmo);
    });
  });

  describe("weapon switching", () => {
    it("should switch to different weapon", () => {
      weaponSystem.switchWeapon("pistol");
      expect(weaponSystem.getCurrentWeapon().id).toBe("pistol");
    });

    it("should reset ammo when switching weapons", () => {
      // Shoot with rifle
      for (let i = 0; i < 5; i++) {
        weaponSystem.shoot();
      }

      expect(weaponSystem.getCurrentAmmo()).toBe(WEAPONS.rifle.ammoPerMag - 5);

      // Switch to pistol
      weaponSystem.switchWeapon("pistol");

      expect(weaponSystem.getCurrentAmmo()).toBe(WEAPONS.pistol.ammoPerMag);
    });

    it("should have correct stats for each weapon", () => {
      const weapons = ["rifle", "pistol", "shotgun", "smg", "sniper", "melee"];

      for (const weaponId of weapons) {
        weaponSystem.switchWeapon(weaponId);
        const weapon = weaponSystem.getCurrentWeapon();

        expect(weapon.damage).toBeGreaterThan(0);
        expect(weapon.fireRate).toBeGreaterThan(0);
        expect(weapon.ammoPerMag).toBeGreaterThan(0);
        expect(weapon.reloadTime).toBeGreaterThanOrEqual(0);
        expect(weapon.range).toBeGreaterThan(0);
        expect(weapon.accuracy).toBeGreaterThan(0);
        expect(weapon.accuracy).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("weapon properties", () => {
    it("should return correct damage", () => {
      expect(weaponSystem.getDamage()).toBe(WEAPONS.rifle.damage);
    });

    it("should return correct range", () => {
      expect(weaponSystem.getRange()).toBe(WEAPONS.rifle.range);
    });

    it("should return correct bullet speed", () => {
      expect(weaponSystem.getBulletSpeed()).toBe(WEAPONS.rifle.bulletSpeed);
    });

    it("should return correct weight", () => {
      expect(weaponSystem.getWeight()).toBe(WEAPONS.rifle.weight);
    });
  });

  describe("recoil and spread", () => {
    it("should have recoil after shooting", () => {
      weaponSystem.shoot();
      const recoil = weaponSystem.getRecoil();
      expect(recoil).toBeGreaterThan(0);
    });

    it("should decay recoil over time", () => {
      weaponSystem.shoot();
      const firstRecoil = weaponSystem.getRecoil();
      const secondRecoil = weaponSystem.getRecoil();

      expect(secondRecoil).toBeLessThan(firstRecoil);
    });

    it("should return spread value", () => {
      const spread = weaponSystem.getSpread();
      expect(spread).toBeGreaterThan(0);
    });

    it("should have different spread for different weapons", () => {
      weaponSystem.switchWeapon("rifle");
      const rifleSpread = weaponSystem.getSpread();

      weaponSystem.switchWeapon("shotgun");
      const shotgunSpread = weaponSystem.getSpread();

      expect(shotgunSpread).toBeGreaterThan(rifleSpread);
    });
  });
});
