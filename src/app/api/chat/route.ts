import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText } from "ai";

export const maxDuration = 30;

const systemPrompt = `
You are PandaBot, the official AI assistant for FundingPanda.
FundingPanda is a crowdfunding platform that bridges the gap between academic research and industry sponsors.

Key Information you should know:
- Students can create thesis projects, submit them for review, and post timeline updates.
- Sponsors can fund projects using Stripe, leave 5-star reviews on completed projects, and list hardware/software in the Resource Hub.
- If a user asks how to donate, tell them to browse the 'Explore Ideas' page and click 'Back this Idea'.
- If a user asks how to claim hardware, tell them to visit the 'Resource Hub' in their dashboard.

Rules:
- Be helpful, concise, and professional.
- DO NOT answer questions unrelated to FundingPanda, academia, or hardware/software development. Gently redirect them.
- Use short paragraphs and bullet points for readability.
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch {
    return new Response("Invalid request payload.", { status: 400 });
  }
}
