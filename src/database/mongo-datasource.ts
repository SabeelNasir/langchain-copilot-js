import "reflect-metadata";
import { DataSource } from "typeorm";
import { EnvConfig } from "../config/env-config.js";
import { ChatMessageEntity } from "./entities/mongodb/chat-message.entity.js";
import { AIAgentsEntity } from "./entities/mongodb/ai-agents.entity.js";

export const MongoDataSource = new DataSource({
  url: EnvConfig.mongoDB.uri,
  database: EnvConfig.mongoDB.db,
  type: "mongodb",
  synchronize: true,
  logging: false,
  entities: [ChatMessageEntity, AIAgentsEntity],
});
