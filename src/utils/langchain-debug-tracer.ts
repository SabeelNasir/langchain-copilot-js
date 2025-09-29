import { CallbackManager } from "@langchain/core/callbacks/manager";

export const langChainDebugTracer = CallbackManager.fromHandlers({
  handleLLMStart(llm, prompts) {
    console.log("LLM Start: ", llm ?? "uknown model - ");
  },
  handleLLMEnd(output) {
    console.log("LLM call end,  - output: ");
  },
  handleToolStart(tool, input) {
    console.log("Tool started: ", tool, " - Input: ", input);
  },
  handleToolEnd(output) {
    console.log("Tool end:  - result: ", output);
  },
});
