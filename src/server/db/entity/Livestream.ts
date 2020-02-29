import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm"
import { User } from "./User";
import { Livestream as APILivestream } from "../../../shared/types/api";

export enum LivestreamStatus {
  live,
  offline,
}

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

  @CreateDateColumn()
  createdDate!: Date;

  @ManyToOne(type => User, user => user.livestreams)
  user!: User;
  
  serialize() {
    const { id, status, title, description, createdDate, user } = this;
    return {
      id,
      status,
      title,
      description,
      createdDate,
      user: user.serialize(),
    }
  }
}
