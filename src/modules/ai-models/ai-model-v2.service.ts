import { ChatGroq } from "@langchain/groq";
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { AIChatMemoryService } from "./ai-chat-memory.service.js";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { WeatherTool } from "../ai-tools/weather.tool.js";
import { MughalFoodCategoriesTool } from "../ai-tools/mughal-food-categories.tool.js";
import { McpToolBridge } from "../mcp-clients/mcp-db/mcp-tool-bridge.js";
import { EnvConfig } from "../../config/env-config.js";

export class AIModelV2Service {
  private model: ChatGroq;
  private memory: AIChatMemoryService;
  private sessionId: string;
  private maxTokensAllowed: number = EnvConfig.chatModelMaxTokens;
  private agent: any;
  private mcpBridge: McpToolBridge;

  constructor(sessionId: string, agentModel?: string) {
    this.sessionId = sessionId;

    this.model = new ChatGroq({
      model: agentModel || EnvConfig.chatModel,
      apiKey: EnvConfig.groqApiKey,
      temperature: 0,
      maxTokens: this.maxTokensAllowed,
    });

    this.memory = new AIChatMemoryService(this.sessionId);

    // Create MCP bridge, but don’t await here
    // this.mcpBridge = new McpToolBridge();
  }

  // Async initializer for MCP + agent
  async init() {
    const mcpBridge = new McpToolBridge();
    await mcpBridge.connect();

    const dynamicMcpTools = await mcpBridge.getLangChainTools();

    this.agent = createReactAgent({
      llm: this.model,
      // tools: [WeatherTool, MughalFoodCategoriesTool, ...dynamicMcpTools],
      tools: [...dynamicMcpTools, WeatherTool],
    });
  }

  async invoke(
    prompt: string,
    systemMessage?: string
  ): Promise<BaseMessage | undefined> {
    const systemPrompt = new SystemMessage(
      systemMessage ||
        `You are a helpful PostgreSQL Database Agent be very intelligent to prepare queries for 'execute-query' tool
         and provide replies.
        - Tool usage rules:
          • Use "execute-query" for database-related queries (read/write/update).  
            - Always assume the database is PostgreSQL when preparing SQL queries.  
            - Always return **syntactically complete SQL queries** (e.g., never omit FROM, WHERE, or LIMIT clauses when required).  
            - If no connectionId is provided, default to "mydb2".  
          • Only call tools when necessary; otherwise, answer directly.
        - Instructions: never expose your technical details to the end-user in reply
        - Tool 'execute-query' Usage instructions:
           * for queries related observium/ip/ip-core you have 'mv_alarms_ip_observium' materialized view in nucleus_bidb schema
           * for queries related transmission or txn or long-haul transmission you have 'mv_alarms_nce_txn' materialized view in nucleus_bidb schema
           * for queries related gpon/olt-alarms you have 'mv_alarms_nce_gpon' materialized view in nucleus_bidb schema  
           * for queries related trouble-tickets/complaints you have 'mv_trouble_ticket_report' materialized view in nucleus_bidb schema  
           * Use these views to get data quickly and efficiently
           * Any question other than this context, reply swiftly that it is out of your reach to access and tell shortly what you have.
        - Tools Available: 
          * Weather API
          * Database Query Executor
        - Keep responses short, clear, and user-friendly.`
    );

    const history = await this.memory.getMessages();

    // React-agent response
    const response = await this.agent.invoke({
      messages: [systemPrompt, ...history, new HumanMessage(prompt)],
    });

    // Find the last AI message
    const lastAI = [...response.messages]
      .reverse()
      .find((m) => m.getType() === "ai");

    const content =
      typeof lastAI?.content === "string"
        ? lastAI.content
        : JSON.stringify(lastAI?.content ?? "");

    // Save to memory
    await this.memory.addUserMessage(prompt);
    await this.memory.addAIChatMessage(content);

    return lastAI;
  }
}
