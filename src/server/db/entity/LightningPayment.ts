import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinTable,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import {
  StreamToken as APIStreamToken,
} from "../../../shared/types/api";
import { Livestream } from "./Livestream";

@Entity()
export class LightningPayment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  paymentRequest!: string;

  @Column()
  rHash!: string;

  @Column()
  amount!: number;

  @Column({ default: false })
  settled!: boolean;

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
}
