import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinTable,
  UpdateDateColumn,
} from "typeorm";
import { LiveStream as MuxLiveStream } from "@mux/mux-node";
import { User } from "./User";
import {
  Livestream as APILivestream,
  SelfLivestream as APISelfLivestream,
  LivestreamStatus,
} from "../../../shared/types/api";

@Entity()
export class Livestream {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  status!: LivestreamStatus;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  muxStreamId!: string;

  @Column()
  muxStreamKey!: string;

  @Column()
  muxPlaybackId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(
    type => User,
    user => user.livestreams,
    { eager: true },
  )
  @JoinTable()
  user!: User;

  serialize(): APILivestream {
    const { id, status, title, description, createdAt } = this;
    return {
      id,
      status,
      title,
      description,
      createdAt: createdAt.toISOString(),
    };
  }

  serializeSelf(): APISelfLivestream {
    return {
      ...this.serialize(),
      streamKey: this.muxStreamKey,
      playbackId: this.muxPlaybackId,
    };
  }
}
