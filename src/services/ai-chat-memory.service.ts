import { BaseCache } from "@langchain/core/caches";
import { BaseChatMessageHistory } from "@langchain/core/chat_history";
import type { Repository } from "typeorm";
import { MongoDataSource } from "../database/mongo-datasource.js";
import { ChatMessageEntity } from "../database/entities/mongodb/chat-message.entity.js";
import {
  AIMessage,
  HumanMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import { EnvConfig } from "../config/env-config.js";

export class AIChatMemoryService extends BaseChatMessageHistory {
  lc_namespace: string[] = [];
  private sessionId: string;
  private repo: Repository<ChatMessageEntity>;
  private maxInteractionsInContext: number = EnvConfig.chatPastInteractions;

  constructor(sessionId: string) {
    super();
    this.sessionId = sessionId;
    this.repo = MongoDataSource.getRepository(ChatMessageEntity);
  }

  async getMessages(): Promise<BaseMessage[]> {
    const messages = await this.repo.find({
      where: { sessionId: this.sessionId },
      order: { createdAt: "DESC" },
      take: this.maxInteractionsInContext,
    });

    return messages.map((msg) =>
      msg.role === "ai"
        ? new AIMessage(msg.message)
        : new HumanMessage(msg.message)
    );
  }

  async clear(): Promise<void> {
    await this.repo.delete({ sessionId: this.sessionId });
  }

  async addAIChatMessage(message: string): Promise<void> {
    await this.repo.save({
      message,
      role: "ai",
      sessionId: this.sessionId,
    });
  }

  async addUserMessage(message: string): Promise<void> {
    await this.repo.save({
      message,
      role: "human",
      sessionId: this.sessionId,
    });
  }

  async addMessage(message: BaseMessage): Promise<void> {
    await this.repo.save({
      content: message.content.toString(),
      role: message.getType() === "ai" ? "ai" : "human",
      sessionId: this.sessionId,
    });
  }
}
