import { BaseEntity, Column, Entity, PrimaryColumn, CreateDateColumn } from "typeorm";
import { SessionEntity } from "typeorm-store";

@Entity()
export class Session extends BaseEntity implements SessionEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  data!: string;

  @Column()
  expiresAt!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
