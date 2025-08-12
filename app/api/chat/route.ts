import 'server-only';
import { NextRequest } from 'next/server';
import { streamText, type CoreMessage } from 'ai';
import { google } from '@ai-sdk/google';
import {
  appendMessageToSession,
  getMessagesForSession,
  setMessagesForSession,
  type ChatMessage,
} from '@/lib/memory';

export const runtime = 'edge';

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { message, sessionId } = (await req.json()) as {
      message: string;
      sessionId?: string;
    };

    if (!message || typeof message !== 'string') {
      return new Response('Invalid message', { status: 400 });
    }

    const sid = sessionId ?? 'default';

    const history = getMessagesForSession(sid);

    const model = google('gemini-2.5-flash');

    const coreMessages: CoreMessage[] = [
      { role: 'system', content: 'You are a helpful assistant.' },
      ...history.map((m) => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })),
      { role: 'user', content: message },
    ];

    const result = await streamText({
      model,
      messages: coreMessages,
      onFinish: ({ text }) => {
        appendMessageToSession(sid, { role: 'assistant', content: text ?? '' });
        const capped = getMessagesForSession(sid).slice(-30);
        setMessagesForSession(sid, capped as ChatMessage[]);
      },
    });

    appendMessageToSession(sid, { role: 'user', content: message });

    return result.toTextStreamResponse();
  } catch (err) {
    return new Response('Bad request', { status: 400 });
  }
}


