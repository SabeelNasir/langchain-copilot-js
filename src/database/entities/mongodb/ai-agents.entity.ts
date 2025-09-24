import type { ObjectId } from "mongodb";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ObjectIdColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("ai_agents")
export class AIAgentsEntity {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column({ type: "string" })
  name!: string;

  @Column({ type: "string" })
  description?: string;

  @Column({ type: "string" })
  model!: string;

  @Column({ type: "string" })
  systemMessage?: string;

  @Index("idx_createdAt")
  @CreateDateColumn({ type: "date" })
  createdAt!: Date;

  @Index("idx_updatedAt")
  @UpdateDateColumn({ type: "date" })
  updatedAt!: Date;
}
