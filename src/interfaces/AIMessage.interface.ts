export interface IAIMessage {
  content: string;
  additional_kwargs: Record<string, unknown>;
  response_metadata: {
    tokenUsage: {
      completionTokens: number;
      promptTokens: number;
      totalTokens: number;
    };
    finish_reason: string;
    id: string;
    object: string;
    created: number;
    model: string;
    usage: {
      queue_time: number;
      prompt_tokens: number;
      prompt_time: number;
      completion_tokens: number;
      completion_time: number;
      total_tokens: number;
      total_time: number;
    };
    usage_breakdown: unknown | null;
    system_fingerprint: string;
    x_groq: {
      id: string;
    };
    service_tier: string;
  };
  tool_calls: unknown[];
  invalid_tool_calls: unknown[];
  usage_metadata: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}
