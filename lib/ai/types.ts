/**
 * Model-agnostic AI provider contract. No file outside lib/ai may import a
 * vendor SDK directly — every consumer (content-intelligence today, more
 * later) only talks to this interface. Previously lived inside
 * lib/content-intelligence/types.ts as a single-method
 * `complete(prompt: string): Promise<string>` — too limited to represent
 * structured output, tool calling, multi-turn context, or usage
 * accounting, so it's redesigned here and content-intelligence now
 * imports it instead of owning it.
 */
export type AIRole = "system" | "user" | "assistant";

export type AIMessage = {
  role: AIRole;
  content: string;
};

export type AIToolDefinition = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type AIUsage = {
  inputTokens: number;
  outputTokens: number;
};

export type AICompletionRequest = {
  messages: AIMessage[];
  /** JSON-schema-like shape the provider should constrain its output to, when supported. */
  responseSchema?: Record<string, unknown>;
  /** Not called in this phase — represented so a future tool-calling provider doesn't need an interface change. */
  tools?: AIToolDefinition[];
  /** Not implemented in this phase — represented so a future streaming provider doesn't need an interface change. */
  stream?: boolean;
};

export type AICompletionResult = {
  content: string;
  structuredOutput: unknown | null;
  usage: AIUsage | null;
  metadata: Record<string, unknown>;
};

export type AIProviderStatus = "not_configured" | "ready" | "error";

export type AIProvider = {
  id: string;
  status: AIProviderStatus;
  complete: (request: AICompletionRequest) => Promise<AICompletionResult>;
};
