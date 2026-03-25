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
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen && (
                <Card className="mb-4 flex h-[550px] w-[350px] flex-col border-primary/20 shadow-2xl animate-in slide-in-from-bottom-5 sm:w-[400px]">
                    <CardHeader className="flex flex-row items-center justify-between rounded-t-xl bg-primary py-3 text-primary-foreground">
                        <CardTitle className="flex items-center gap-2 text-md">
                            <Bot className="h-5 w-5" /> PandaBot Guide
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary-foreground hover:bg-primary/80"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-hidden bg-neutral-50/50 p-0">
                        <ScrollArea className="h-full p-4">
                            {messages.length === 0 ? (
                                <div className="mt-6 flex h-full flex-col items-center justify-center space-y-6 text-center">
                                    <div className="rounded-full bg-emerald-100 p-4">
                                        <Bot className="h-10 w-10 text-emerald-600" />
                                    </div>
                                    <p className="px-4 text-sm text-neutral-600">
                                        Hi! I am your FundingPanda assistant. How can I help you navigate the platform today?
                                    </p>

                                    <div className="flex w-full flex-col gap-2 px-2">
                                        {faqs.map((faq) => (
                                            <Button
                                                key={faq}
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-start border-emerald-200 text-xs text-neutral-600 hover:bg-emerald-50 hover:text-emerald-700"
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
                                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === "user"
                                                        ? "bg-primary text-primary-foreground"
                                                        : "border bg-white text-emerald-600"
                                                        }`}
                                                >
                                                    {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                                </div>
                                                <div
                                                    className={`rounded-xl p-3 text-sm ${m.role === "user"
                                                        ? "rounded-tr-none bg-primary text-primary-foreground"
                                                        : "rounded-tl-none border bg-white text-neutral-800 whitespace-pre-wrap"
                                                        }`}
                                                >
                                                    {getMessageText(m)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="rounded-xl rounded-tl-none border bg-white p-3 text-sm text-neutral-500 animate-pulse shadow-sm">
                                                Thinking...
                                            </div>
                                        </div>
                                    )}
                                    {error && (
                                        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                                            {error.message || "Chat error occurred. Check browser and server logs."}
                                        </div>
                                    )}
                                    <div ref={scrollRef} />
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="rounded-b-xl border-t bg-white p-3">
                        <form onSubmit={handleSubmit} className="flex w-full gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 border-transparent bg-neutral-100 focus-visible:bg-white focus-visible:ring-primary"
                                disabled={isLoading}
                            />
                            <Button type="submit" size="icon" className="shrink-0 rounded-full" disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}

            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-xl transition-all duration-300 hover:scale-105 hover:bg-emerald-600"
                >
                    <MessageCircle className="h-6 w-6" />
                </Button>
            )}
        </div>
    );
}
