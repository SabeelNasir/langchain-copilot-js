import { ChatGroq } from "@langchain/groq";
import { EnvConfig } from "../../config/env-config.js";
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
  type AIMessageChunk,
} from "@langchain/core/messages";
import { AIChatMemoryService } from "./ai-chat-memory.service.js";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { WeatherTool } from "../ai-tools/weather.tool.js";
import { MughalFoodCategoriesTool } from "../ai-tools/mughal-food-categories.tool.js";

export class AIModelV2Service {
  private model: ChatGroq;
  private memory: AIChatMemoryService;
  private sessionId: string;
  private maxTokensAllowed: number = EnvConfig.chatModelMaxTokens;
  private agent;

  constructor(sessionId: string, agentModel?: string) {
    this.sessionId = sessionId;
    this.model = new ChatGroq({
      model: agentModel || EnvConfig.chatModel,
      apiKey: EnvConfig.groqApiKey,
      temperature: 0,
      maxTokens: this.maxTokensAllowed,
    });
    this.memory = new AIChatMemoryService(this.sessionId);

    // using langgrah to create react-agent
    this.agent = createReactAgent({
      llm: this.model,
      tools: [WeatherTool, MughalFoodCategoriesTool],
    });
  }

  async invoke(prompt: string, systemMessage?: string): Promise<BaseMessage> {
    const systemPrompt = new SystemMessage(
      systemMessage ||
        `You are helpful AI Assistant. 
         - Welcome them and also tell them they can ask you about available tools too along with other general knowledge questions. 
         - Instructions If user ask anything related weather then use tool 'get_weather'
         - If a user ask to provide food categries menu then use tool 'get_food_categories'`
    );
    const history = await this.memory.getMessages();

    // const response: AIMessageChunk = await this.model.invoke([
    //   systemPrompt,
    //   ...history,
    //   new HumanMessage(prompt),
    // ]);

    // // save messages memory
    // await this.memory.addUserMessage(prompt);
    // await this.memory.addAIChatMessage(response));

    // React-agent based response
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
