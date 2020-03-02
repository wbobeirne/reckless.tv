import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinTable,
  UpdateDateColumn,
  getRepository,
} from "typeorm";
import { User } from "./User";
import { StreamToken as APIStreamToken } from "../../../shared/types/api";
import { Livestream } from "./Livestream";
import { MuxLivestreams } from "../../lib/mux";

@Entity()
export class StreamToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  token!: string;

  @Column()
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(
    type => User,
    user => user.tokens,
  )
  @JoinTable()
  user!: Promise<User>;

  @ManyToOne(
    type => Livestream,
    ls => ls.tokens,
  )
  @JoinTable()
  livestream!: Promise<Livestream>;

  serialize(): APIStreamToken {
    const { id, token, expiresAt, createdAt } = this;
    return {
      id,
      token,
      expiresAt: expiresAt.toISOString(),
      createdAt: createdAt.toISOString(),
    };
  }

  static async createOrExtendToken(user: User, livestream: Livestream, duration: number) {
    const tokenRepo = getRepository(StreamToken);
    const token = await tokenRepo.findOne({ where: { user, livestream } });
    if (token) {
      token.expiresAt = new Date(token.expiresAt.getTime() + duration);
      return tokenRepo.save(token);
    } else {
      const muxToken = await MuxLivestreams.createPlaybackId(livestream.muxStreamId, {
        policy: "public",
      });
      const newToken = new StreamToken();
      newToken.token = muxToken.id;
      newToken.expiresAt = new Date(Date.now() + duration);
      newToken.user = Promise.resolve(user);
      newToken.livestream = Promise.resolve(livestream);
      return tokenRepo.save(newToken);
    }
  }
}
