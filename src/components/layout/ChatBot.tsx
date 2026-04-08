"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Bot, HelpCircle, MessageCircle, Send, User, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const { messages, sendMessage, status, error } = useChat({
        onError: (err) => {
            console.error("Chat UI Error:", err);
        },
    });
    const scrollRef = useRef<HTMLDivElement>(null);
    const isLoading = status === "submitted" || status === "streaming";

    const faqs = ["How do I fund a project?", "How do I claim hardware?", "Can I review a student?"];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const value = input.trim();
        if (!value || isLoading) return;

        setInput("");
        await sendMessage({ text: value });
    };

    const getMessageText = (message: (typeof messages)[number]) => {
        if (!Array.isArray(message.parts)) return "";

        return message.parts
            .map((part) => {
                if (part.type === "text") return part.text;
                return "";
            })
            .join("")
            .trim();
    };

    const handleFaqClick = async (question: string) => {
        if (isLoading) return;
        await sendMessage({ text: question });
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="fixed bottom-3 right-3 z-50 sm:bottom-6 sm:right-6">
            {isOpen && (
                <Card className="mb-3 flex h-[min(560px,calc(100dvh-7.5rem))] w-[calc(100vw-1.5rem)] max-w-100 flex-col overflow-hidden rounded-2xl border border-emerald-200/70 bg-white/95 shadow-[0_24px_48px_-20px_rgba(5,150,105,0.45)] backdrop-blur-sm animate-in slide-in-from-bottom-5 sm:w-[calc(100vw-2rem)]">
                    <CardHeader className="relative flex flex-row items-center justify-between border-b border-emerald-300/40 bg-linear-to-br from-emerald-600 via-emerald-500 to-teal-500 py-3 text-white">
                        <div className="absolute -left-6 -top-10 h-24 w-24 rounded-full bg-white/15 blur-xl" />
                        <div className="absolute -right-8 -bottom-10 h-24 w-24 rounded-full bg-lime-200/20 blur-xl" />
                        <CardTitle className="relative z-10 flex items-center gap-2 text-md">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                                <Bot className="h-4 w-4" />
                            </span>
                            PandaBot Guide
                            <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide">
                                ONLINE
                            </span>
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative z-10 h-8 w-8 text-white hover:bg-white/20 hover:text-white"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-hidden bg-linear-to-b from-white via-emerald-50/20 to-white p-0">
                        <ScrollArea className="h-full px-4 py-5">
                            {messages.length === 0 ? (
                                <div className="mt-6 flex h-full flex-col items-center justify-center space-y-6 text-center">
                                    <div className="rounded-full bg-linear-to-br from-emerald-100 to-teal-100 p-4 shadow-sm ring-1 ring-emerald-200/70">
                                        <Bot className="h-10 w-10 text-emerald-700" />
                                    </div>
                                    <p className="px-4 text-sm leading-relaxed text-neutral-600">
                                        Hi! I am your FundingPanda assistant. How can I help you navigate the platform today?
                                    </p>
                                    <p className="-mt-3 px-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                        If you are lost, reach me.
                                    </p>

                                    <div className="flex w-full flex-col gap-2 px-2">
                                        {faqs.map((faq) => (
                                            <Button
                                                key={faq}
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-start rounded-lg border-emerald-200/90 bg-white text-xs text-neutral-700 shadow-xs hover:bg-emerald-50 hover:text-emerald-700"
                                                onClick={() => handleFaqClick(faq)}
                                            >
                                                <HelpCircle className="mr-2 h-3 w-3" /> {faq}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((m) => (
                                        <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                            <div
                                                className={`flex max-w-[85%] gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                                            >
                                                <div
                                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-xs ring-1 ${m.role === "user"
                                                        ? "bg-linear-to-br from-emerald-600 to-teal-500 text-white ring-emerald-300/60"
                                                        : "border bg-white text-emerald-600 ring-emerald-200/80"
                                                        }`}
                                                >
                                                    {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                                </div>
                                                <div
                                                    className={`rounded-xl p-3 text-sm ${m.role === "user"
                                                        ? "rounded-tr-none bg-linear-to-br from-emerald-600 to-teal-500 text-white shadow-sm"
                                                        : "rounded-tl-none border border-emerald-100 bg-white text-neutral-800 whitespace-pre-wrap shadow-xs"
                                                        }`}
                                                >
                                                    {getMessageText(m)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="rounded-xl rounded-tl-none border border-emerald-100 bg-white p-3 text-sm text-neutral-500 animate-pulse shadow-xs">
                                                Thinking...
                                            </div>
                                        </div>
                                    )}
                                    {error && (
                                        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive shadow-xs">
                                            {error.message || "Chat error occurred. Check browser and server logs."}
                                        </div>
                                    )}
                                    <div ref={scrollRef} />
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="rounded-b-2xl border-t border-emerald-100 bg-white p-3">
                        <form onSubmit={handleSubmit} className="flex w-full gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 rounded-xl border-transparent bg-neutral-100 focus-visible:bg-white focus-visible:ring-emerald-500"
                                disabled={isLoading}
                            />
                            <Button type="submit" size="icon" className="shrink-0 rounded-full bg-linear-to-br from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-500" disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}

            {!isOpen && (
                <div className="flex flex-col items-end gap-2">
                    <p className="rounded-full border border-emerald-200/70 bg-card px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm dark:border-emerald-900/60 dark:text-emerald-400">
                        If you are lost, reach me.
                    </p>
                    <Button
                        onClick={() => setIsOpen(true)}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-emerald-600 to-teal-500 shadow-[0_14px_28px_-10px_rgba(5,150,105,0.7)] transition-all duration-300 hover:scale-105 hover:from-emerald-500 hover:to-teal-500"
                    >
                        <MessageCircle className="h-6 w-6" />
                    </Button>
                </div>
            )}
        </div>
    );
}
