import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";
import { EnvConfig } from "../../config/env-config";
import {
  NucleusCriticalAlarmsStats,
  NucleusTicketStatsTool,
} from "../ai-tools/demo-nucleus-stats.tool";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { mongoClient } from "../../database/mongo-datasource";
import { HumanMessage } from "@langchain/core/messages";
import { extractLastAIMessage } from "../../utils/utils";
import { initiateChatModels } from "../../utils/chat-models";
import { langChainDebugTracer } from "../../utils/langchain-debug-tracer";

const handler = new ConsoleCallbackHandler();

export class MonitoringSystemAIAgent {
  // Implementation for Monitoring System AI Agent
  private sessionId: string;
  private chatModel;
  private checkPoinerSaver;
  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.chatModel = initiateChatModels();
  }
  async init() {
    const client = await mongoClient.connect();
    this.checkPoinerSaver = new MongoDBSaver({
      client,
      dbName: EnvConfig.mongoDB.db,
    });
  }

  public async invoke(prompt: string) {
    const agent = createReactAgent({
      llm: this.chatModel,
      tools: [NucleusTicketStatsTool, NucleusCriticalAlarmsStats],
      checkpointSaver: true,
      checkpointer: this.checkPoinerSaver,
    });

    const systemPrompt = `
    You are a helpful AI Assistant for Nucleus Statistics chatbot. 
    Be very concise and to the point.
    And offer your capabilities. Utilize tools provided to you to answer user queries.
    Never expose technical tool names or internal system details to the user.
    - Keep responses short, clear, and user-friendly.
    - In case of stats results, always return tabular markdown.`;
    const agentResponse = await agent.invoke(
      { messages: [systemPrompt, new HumanMessage(prompt)] },
      {
        configurable: { thread_id: this.sessionId },
        callbacks: [new ConsoleCallbackHandler()],
      }
    );
    return extractLastAIMessage(agentResponse.messages) || undefined;
  }
}
