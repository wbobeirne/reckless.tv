import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  OneToMany,
  CreateDateColumn,
  getRepository,
  getManager,
  JoinTable,
} from "typeorm";
import { compare, hash } from "bcryptjs";
import { Livestream } from "./Livestream";
import { User as APIUser, SelfUser as APISelfUser } from "../../../shared/types/api";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: false })
  username!: string;

  @Column({ nullable: false })
  password!: string;

  @Column({ nullable: true })
  pubkey!: string;

  @Column({ nullable: true })
  nodeType!: "lnd";

  @Column({ nullable: true })
  grpcUrl!: string;

  @Column({ nullable: true })
  macaroon!: string;

  @Column({ nullable: true })
  cert!: string;

  @CreateDateColumn()
  createdDate!: Date;

  @OneToMany(
    type => Livestream,
    stream => stream.user,
  )
  @JoinTable()
  livestreams!: Promise<Livestream[]>;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }

  /**
   * Compare an unhashed password to the hashed password in the database.
   * This method isn't timing safe, so when used over an API you should
   * make sure compare time is constant.
   */
  async comparePassword(password: string) {
    return await compare(password, this.password);
  }

  /**
   * Get a Livestream belonging to the user that's currently live.
   */
  async getLiveLivestream() {
    return getManager()
      .createQueryBuilder()
      .from(Livestream, "livestream")
      .leftJoinAndSelect("livestream.user", "user")
      .where("user.id = :id", { id: this.id })
      .getOne();
  }

  /**
   * Serialize the user for public API consumption.
   */
  serialize(): APIUser {
    const { id, username } = this;
    return { id, username };
  }

  /**
   * Serialize the user for private API consumption.
   */
  serializeSelf(): APISelfUser {
    const { id, username, pubkey, nodeType, grpcUrl } = this;
    return { id, username, pubkey, nodeType, grpcUrl };
  }
}
