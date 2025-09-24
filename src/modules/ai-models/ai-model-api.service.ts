import { ChatGroq } from "@langchain/groq";
import { EnvConfig } from "../../config/env-config.js";
import {
  HumanMessage,
  SystemMessage,
  type AIMessageChunk,
} from "@langchain/core/messages";
import { AIChatMemoryService } from "./ai-chat-memory.service.js";

export class AIModelService {
  private model: ChatGroq;
  private memory: AIChatMemoryService;
  private sessionId: string;
  private maxTokensAllowed: number = EnvConfig.chatModelMaxTokens;

  constructor(sessionId: string, agentModel: string) {
    this.sessionId = sessionId;
    this.model = new ChatGroq({
      model: agentModel || EnvConfig.chatModel,
      apiKey: EnvConfig.groqApiKey,
      temperature: 0,
      maxTokens: this.maxTokensAllowed,
    });
    this.memory = new AIChatMemoryService(this.sessionId);
  }

  async invoke(
    prompt: string,
    systemMessage?: string
  ): Promise<AIMessageChunk> {
    const systemPrompt = new SystemMessage(
      systemMessage || "You are helpful AI Assistant, keep very concise."
    );
    const history = await this.memory.getMessages();

    const response: AIMessageChunk = await this.model.invoke([
      systemPrompt,
      ...history,
      new HumanMessage(prompt),
    ]);

    // save messages memory
    await this.memory.addUserMessage(prompt);
    await this.memory.addAIChatMessage(response.content.toString());

    return response;
  }
}
