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
    - Context:
      * You have access to Nucleus ticketing and alarm statistics data.
    - Tools Available:
      * Nucleus Ticket Stats: Use this to get ticket stats from nucleus system
      * Nucleus Critical Alarms Stats: Use this to get critical alarms stats from nucleus system
      *     Use must tell the period and network domain to get critical alarms stats.
    - Tool usage rules:
      * Always provide a clear and concise query.
      * Do not include sensitive information in your queries.
      * Use the appropriate tool for the task at hand.
      * If the user query is unrelated to the context, politely inform them that you can only assist with queries related to Nucleus statistics.
      * For any question other than this context, reply swiftly that it is out of your reach to access and tell shortly what you have.
    - Keep responses short, clear, and user-friendly.`;
    const agentResponse = await agent.invoke(
      { messages: [systemPrompt, new HumanMessage(prompt)] },
      {
        configurable: { thread_id: this.sessionId },
        callbacks: [langChainDebugTracer],
      }
    );
    return extractLastAIMessage(agentResponse.messages) || undefined;
  }
}
