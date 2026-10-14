import { streamText } from 'ai';
import { chatModel, coachSystemPrompt } from '@/lib/ai-config';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response('API key GOOGLE_GENERATIVE_AI_API_KEY is missing on server.', {
        status: 500,
      });
    }

    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : '',
    }));

    const result = streamText({
      model: chatModel,
      system: coachSystemPrompt,
      messages: formattedMessages,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(error?.message || 'Stream processing failed', {
      status: 500,
    });
  }
}
