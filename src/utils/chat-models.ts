import { ChatOpenAI } from "@langchain/openai";
import { ActiveLLMCompany } from "../config/enum";
import { EnvConfig } from "../config/env-config";
import { ChatGroq } from "@langchain/groq";

/**
 *  Initiate and return chat model instance based on active LLM company configuration.
 * @returns
 */
export const initiateChatModels = () => {
  if (EnvConfig.activeLLMCompany === ActiveLLMCompany.GROQ) {
    return new ChatGroq({
      apiKey: EnvConfig.groqApiKey,
      model: EnvConfig.chatModel,
      temperature: 0.7,
    });
  } else if (EnvConfig.activeLLMCompany === ActiveLLMCompany.OPENAI) {
    return new ChatOpenAI({
      apiKey: EnvConfig.openApiKey,
      model: "gpt-5-2025-08-07",
      temperature: 1,
    });
  }
};
