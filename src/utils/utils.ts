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
  return content;
};
