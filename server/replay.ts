import { storagePut } from "./storage";
import { createReplay } from "./db";
import { notifyOwner } from "./_core/notification";

export interface ReplayFrame {
  timestamp: number;
  players: Array<{
    id: number;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number };
    health: number;
    ammo: number;
    isAlive: boolean;
  }>;
  events: Array<{
    type: "shot" | "damage" | "kill" | "death";
    shooterId?: number;
    victimId?: number;
    damage?: number;
    position?: { x: number; y: number; z: number };
  }>;
}

export class ReplayRecorder {
  private matchId: number;
  private frames: ReplayFrame[] = [];
  private startTime: number = Date.now();
  private isRecording: boolean = false;

  constructor(matchId: number) {
    this.matchId = matchId;
  }

  public startRecording(): void {
    this.isRecording = true;
    this.frames = [];
    this.startTime = Date.now();
  }

  public stopRecording(): void {
    this.isRecording = false;
  }

  public recordFrame(frame: ReplayFrame): void {
    if (!this.isRecording) return;

    this.frames.push({
      ...frame,
      timestamp: Date.now() - this.startTime,
    });
  }

  public async uploadReplay(uploadedById: number): Promise<{ url: string; key: string } | null> {
    if (this.frames.length === 0) {
      console.warn("[Replay] No frames to upload");
      return null;
    }

    try {
      // Serialize replay data
      const replayData = {
        matchId: this.matchId,
        duration: this.frames[this.frames.length - 1].timestamp / 1000,
        frames: this.frames,
      };

      const replayJson = JSON.stringify(replayData);
      const replayBuffer = Buffer.from(replayJson, "utf-8");

      // Generate S3 key
      const timestamp = Date.now();
      const s3Key = `replays/${this.matchId}/${uploadedById}/${timestamp}.json`;

      // Upload to S3
      const result = await storagePut(s3Key, replayBuffer, "application/json");

      if (!result) {
        throw new Error("Failed to upload replay to S3");
      }

      // Save replay metadata to database
      await createReplay(
        this.matchId,
        uploadedById,
        s3Key,
        result.url,
        replayBuffer.length,
        Math.floor(replayData.duration)
      );

      // Notify owner
      await notifyOwner({
        title: "Replay salvo",
        content: `Replay da partida ${this.matchId} foi salvo com sucesso`,
      });

      console.log(`[Replay] Uploaded replay for match ${this.matchId} to ${s3Key}`);

      return {
        url: result.url,
        key: s3Key,
      };
    } catch (error) {
      console.error("[Replay] Error uploading replay:", error);

      await notifyOwner({
        title: "Erro ao salvar replay",
        content: `Erro ao salvar replay da partida ${this.matchId}: ${error instanceof Error ? error.message : "Unknown error"}`,
      });

      return null;
    }
  }

  public getFrameCount(): number {
    return this.frames.length;
  }

  public getDuration(): number {
    if (this.frames.length === 0) return 0;
    return this.frames[this.frames.length - 1].timestamp / 1000;
  }
}

// Replay player for client-side playback
export class ReplayPlayer {
  private frames: ReplayFrame[] = [];
  private currentFrameIndex: number = 0;
  private isPlaying: boolean = false;
  private playbackSpeed: number = 1;
  private onFrameUpdate: ((frame: ReplayFrame) => void) | null = null;

  public loadReplay(replayData: any): void {
    if (replayData.frames && Array.isArray(replayData.frames)) {
      this.frames = replayData.frames;
      this.currentFrameIndex = 0;
    }
  }

  public play(): void {
    this.isPlaying = true;
  }

  public pause(): void {
    this.isPlaying = false;
  }

  public stop(): void {
    this.isPlaying = false;
    this.currentFrameIndex = 0;
  }

  public setPlaybackSpeed(speed: number): void {
    this.playbackSpeed = Math.max(0.1, Math.min(2, speed));
  }

  public seek(timestamp: number): void {
    // Find frame closest to timestamp
    this.currentFrameIndex = this.frames.findIndex((f) => f.timestamp >= timestamp);
    if (this.currentFrameIndex === -1) {
      this.currentFrameIndex = this.frames.length - 1;
    }
  }

  public update(deltaTime: number): void {
    if (!this.isPlaying || this.frames.length === 0) return;

    // Advance frame based on playback speed
    const nextFrameIndex = Math.min(
      this.currentFrameIndex + Math.ceil(this.playbackSpeed),
      this.frames.length - 1
    );

    if (nextFrameIndex !== this.currentFrameIndex) {
      this.currentFrameIndex = nextFrameIndex;

      if (this.onFrameUpdate) {
        this.onFrameUpdate(this.frames[this.currentFrameIndex]);
      }
    }

    // Stop at end
    if (this.currentFrameIndex === this.frames.length - 1) {
      this.isPlaying = false;
    }
  }

  public setOnFrameUpdate(callback: (frame: ReplayFrame) => void): void {
    this.onFrameUpdate = callback;
  }

  public getCurrentFrame(): ReplayFrame | null {
    return this.frames[this.currentFrameIndex] || null;
  }

  public getTotalFrames(): number {
    return this.frames.length;
  }

  public getCurrentFrameIndex(): number {
    return this.currentFrameIndex;
  }

  public isPlayingNow(): boolean {
    return this.isPlaying;
  }
}
