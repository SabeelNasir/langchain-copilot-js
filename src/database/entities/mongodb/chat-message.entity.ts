import type { ObjectId } from "mongodb";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ObjectIdColumn,
} from "typeorm";

@Entity("chat_message")
export class ChatMessageEntity {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Index("idx_sessionId")
  @Column({ type: "string" })
  sessionId!: string;

  @Column({ type: "enum", enum: ["human", "ai"] })
  role!: "human" | "ai";

  @Column({ type: "string" })
  message!: string;

  // Optional: automatically store when the document was created
  @Index("idx_createdAt")
  @CreateDateColumn({ type: "date" })
  createdAt!: Date;
}
