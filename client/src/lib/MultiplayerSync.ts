import { createClient } from "@supabase/supabase-js";
import * as THREE from "three";

export interface PlayerState {
  id: number;
  name: string;
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  health: number;
  ammo: number;
  isAlive: boolean;
}

export interface ShotEvent {
  shooterId: number;
  x: number;
  y: number;
  z: number;
  dirX: number;
  dirY: number;
  dirZ: number;
  damage: number;
}

export interface DamageEvent {
  victimId: number;
  shooterId: number;
  damage: number;
}

export class MultiplayerSync {
  private supabase: any;
  private channel: any;
  private matchId: number;
  private userId: number;
  private userName: string;

  private onPlayerUpdate: ((state: PlayerState) => void) | null = null;
  private onPlayerJoin: ((state: PlayerState) => void) | null = null;
  private onPlayerLeave: ((userId: number) => void) | null = null;
  private onShotFired: ((shot: ShotEvent) => void) | null = null;
  private onPlayerDamaged: ((damage: DamageEvent) => void) | null = null;

  private lastUpdateTime = 0;
  private updateInterval = 50; // ms

  constructor(matchId: number, userId: number, userName: string) {
    this.matchId = matchId;
    this.userId = userId;
    this.userName = userName;

    // Initialize Supabase client
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  public async connect(): Promise<void> {
    const channelName = `match:${this.matchId}`;

    this.channel = this.supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
      },
    });

    // Listen for player updates
    this.channel.on("broadcast", { event: "player_update" }, ({ payload }: any) => {
      if (this.onPlayerUpdate && payload.userId !== this.userId) {
        this.onPlayerUpdate(payload);
      }
    });

    // Listen for player join
    this.channel.on("broadcast", { event: "player_join" }, ({ payload }: any) => {
      if (this.onPlayerJoin && payload.userId !== this.userId) {
        this.onPlayerJoin(payload);
      }
    });

    // Listen for player leave
    this.channel.on("broadcast", { event: "player_leave" }, ({ payload }: any) => {
      if (this.onPlayerLeave) {
        this.onPlayerLeave(payload.userId);
      }
    });

    // Listen for shots
    this.channel.on("broadcast", { event: "shot_fired" }, ({ payload }: any) => {
      if (this.onShotFired && payload.shooterId !== this.userId) {
        this.onShotFired(payload);
      }
    });

    // Listen for damage
    this.channel.on("broadcast", { event: "player_damaged" }, ({ payload }: any) => {
      if (this.onPlayerDamaged) {
        this.onPlayerDamaged(payload);
      }
    });

    await this.channel.subscribe();

    // Announce join
    await this.broadcastPlayerJoin();
  }

  public async disconnect(): Promise<void> {
    if (this.channel) {
      await this.broadcastPlayerLeave();
      await this.channel.unsubscribe();
    }
  }

  public async broadcastPlayerState(position: THREE.Vector3, rotation: THREE.Euler, health: number, ammo: number, isAlive: boolean): Promise<void> {
    const now = Date.now();
    if (now - this.lastUpdateTime < this.updateInterval) {
      return;
    }

    this.lastUpdateTime = now;

    if (!this.channel) return;

    const state: PlayerState = {
      id: this.userId,
      name: this.userName,
      x: Math.round(position.x * 100) / 100,
      y: Math.round(position.y * 100) / 100,
      z: Math.round(position.z * 100) / 100,
      rotX: Math.round(rotation.x * 100) / 100,
      rotY: Math.round(rotation.y * 100) / 100,
      health,
      ammo,
      isAlive,
    };

    await this.channel.send({
      type: "broadcast",
      event: "player_update",
      payload: state,
    });
  }

  public async broadcastShot(position: THREE.Vector3, direction: THREE.Vector3, damage: number): Promise<void> {
    if (!this.channel) return;

    const shot: ShotEvent = {
      shooterId: this.userId,
      x: Math.round(position.x * 100) / 100,
      y: Math.round(position.y * 100) / 100,
      z: Math.round(position.z * 100) / 100,
      dirX: Math.round(direction.x * 100) / 100,
      dirY: Math.round(direction.y * 100) / 100,
      dirZ: Math.round(direction.z * 100) / 100,
      damage,
    };

    await this.channel.send({
      type: "broadcast",
      event: "shot_fired",
      payload: shot,
    });
  }

  public async broadcastDamage(victimId: number, damage: number): Promise<void> {
    if (!this.channel) return;

    const damageEvent: DamageEvent = {
      victimId,
      shooterId: this.userId,
      damage,
    };

    await this.channel.send({
      type: "broadcast",
      event: "player_damaged",
      payload: damageEvent,
    });
  }

  private async broadcastPlayerJoin(): Promise<void> {
    if (!this.channel) return;

    const state: PlayerState = {
      id: this.userId,
      name: this.userName,
      x: 0,
      y: 0,
      z: 0,
      rotX: 0,
      rotY: 0,
      health: 100,
      ammo: 30,
      isAlive: true,
    };

    await this.channel.send({
      type: "broadcast",
      event: "player_join",
      payload: state,
    });
  }

  private async broadcastPlayerLeave(): Promise<void> {
    if (!this.channel) return;

    await this.channel.send({
      type: "broadcast",
      event: "player_leave",
      payload: { userId: this.userId },
    });
  }

  public setOnPlayerUpdate(callback: (state: PlayerState) => void): void {
    this.onPlayerUpdate = callback;
  }

  public setOnPlayerJoin(callback: (state: PlayerState) => void): void {
    this.onPlayerJoin = callback;
  }

  public setOnPlayerLeave(callback: (userId: number) => void): void {
    this.onPlayerLeave = callback;
  }

  public setOnShotFired(callback: (shot: ShotEvent) => void): void {
    this.onShotFired = callback;
  }

  public setOnPlayerDamaged(callback: (damage: DamageEvent) => void): void {
    this.onPlayerDamaged = callback;
  }
}
