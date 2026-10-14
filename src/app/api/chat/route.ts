import { streamText } from 'ai';
import { chatModel, coachSystemPrompt } from '@/lib/ai-config';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: chatModel,
      system: coachSystemPrompt,
      messages,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process AI chat stream.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
