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

        const modelMessages = await convertToModelMessages(messages);
        const configuredModel = process.env.GOOGLE_GEMINI_MODEL?.trim();
        const modelCandidates = [
            configuredModel,
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
        ].filter((model): model is string => Boolean(model));

        let lastModelError: unknown;

        for (const modelName of modelCandidates) {
            try {
                const result = await streamText({
                    model: google(modelName),
                    system: systemPrompt,
                    messages: modelMessages,
                    temperature: 0.7,
                });

                return result.toUIMessageStreamResponse();
            } catch (modelError) {
                const errorMessage = modelError instanceof Error ? modelError.message : String(modelError);
                const isUnsupportedModelError = /not found|not supported|listmodels/i.test(errorMessage);

                if (!isUnsupportedModelError) {
                    throw modelError;
                }

                lastModelError = modelError;
                console.warn(`PandaBot model fallback: ${modelName} unavailable, trying next model.`);
            }
        }

        throw lastModelError ?? new Error("No compatible Gemini model is available for this API key.");
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate response";
        console.error("PandaBot API Error:", error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
