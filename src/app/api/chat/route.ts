import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText } from "ai";
import { NextResponse } from "next/server";

export const maxDuration = 30;

const systemPrompt = `
You are PandaBot, the official, highly professional, yet friendly AI assistant for FundingPanda.
FundingPanda is an elite crowdfunding platform bridging academic research and industry sponsors.

CRITICAL KNOWLEDGE:
- Students: Can create thesis projects, submit drafts, post timeline milestones, and claim hardware.
- Sponsors: Can browse projects, fund them via Stripe, leave 5-star reviews only when a project is COMPLETED, and donate hardware/software to the Resource Hub.
- Payments: Minimum donation is $5. Processed securely via Stripe.
- Messaging: Real-time socket chat is available between sponsors and students on project pages.

YOUR PERSONALITY AND RULES:
1. Be concise, encouraging, and authoritative.
2. If asked how to do something, provide a short step-by-step guide and point to the correct dashboard tab.
3. Use markdown with short paragraphs. Keep responses easy to scan.
4. If a question is unrelated to FundingPanda, academia, funding, or software/hardware development, politely decline and guide the user back.
5. Never say "if you are unsure, reach me". Instead, give a concrete next step such as: open Help/FAQ, go to Contact page, or check the relevant dashboard tab.
`;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const messages = Array.isArray(body?.messages) ? body.messages : [];

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY in environment variables.");
        }

        if (messages.length === 0) {
            return NextResponse.json({ error: "No messages provided." }, { status: 400 });
        }

        const latestMessage = messages[messages.length - 1] as { role?: string; content?: unknown; parts?: Array<{ type?: string; text?: string }> };
        const latestText = typeof latestMessage?.content === "string"
            ? latestMessage.content
            : Array.isArray(latestMessage?.parts)
                ? latestMessage.parts
                    .map((part) => (part?.type === "text" ? part.text || "" : ""))
                    .join("")
                : "";

        const backendApiBase = process.env.BACKEND_API_URL;
        if (backendApiBase && latestMessage?.role === "user" && latestText.trim()) {
            fetch(`${backendApiBase.replace(/\/$/, "")}/analytics/bot`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ query: latestText.trim() }),
            }).catch((analyticsError) => {
                console.warn("PandaBot analytics ping failed:", analyticsError);
            });
        }

        const result = await streamText({
            model: google("gemini-2.5-flash"),
            system: systemPrompt,
            messages: await convertToModelMessages(messages),
            temperature: 0.7,
        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate response";
        console.error("PandaBot API Error:", error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
