import { BaseMessage } from "@langchain/core/messages";

export const extractLastAIMessage: (
  messages: BaseMessage[]
) => string | null = (messages) => {
  const lastAI: BaseMessage | undefined = [...messages]
    .reverse()
    .find((m) => m.getType() === "ai");

  const content =
    typeof lastAI?.content === "string"
      ? lastAI.content
      : JSON.stringify(lastAI?.content ?? "");

  return stripThinkTags(content);
};

export function extractJson(content: string): string {
  // Remove <think>...</think> blocks
  const cleaned = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

  // Extract JSON portion only (first {...} found)
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("No JSON object found in model output");
  }
  return match[0];
}

export function stripThinkTags(content: string): string {
  return content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}
