import { streamText } from 'ai';
import { chatModel, coachSystemPrompt } from '@/lib/ai-config';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Map incoming messages to CoreMessage format
    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content:
        typeof m.content === 'string'
          ? m.content
          : m.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') || '',
    }));

    const result = streamText({
      model: chatModel,
      system: coachSystemPrompt,
      messages: formattedMessages,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Stream error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
