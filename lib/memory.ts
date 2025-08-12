export type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
};

// In-memory store only (clears on server restart)
const sessionIdToMessages: Record<string, ChatMessage[]> = {};

export function getMessagesForSession(sessionId: string): ChatMessage[] {
  return sessionIdToMessages[sessionId] ?? [];
}

export function setMessagesForSession(
  sessionId: string,
  messages: ChatMessage[],
): void {
  sessionIdToMessages[sessionId] = messages;
}

export function appendMessageToSession(
  sessionId: string,
  message: ChatMessage,
): void {
  if (!sessionIdToMessages[sessionId]) {
    sessionIdToMessages[sessionId] = [];
  }
  sessionIdToMessages[sessionId].push(message);
}


