"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { socket } from "@/lib/socket";
import { getConversations, getChatHistory } from "@/services/message.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare } from "lucide-react";

interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
    clientTempId?: string | null;
}
import { useQueryClient } from '@tanstack/react-query';

export default function MessagesPage() {
    const { data: session } = useSession();
    const currentUserId = session?.user?.id;

    const [activeContact, setActiveContact] = useState<any | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const { data: contacts, isLoading: loadingContacts } = useQuery({
        queryKey: ["conversations"],
        queryFn: getConversations,
        enabled: !!currentUserId,
    });

    const queryClient = useQueryClient();

    const searchParams = useSearchParams();
    const contactParam = searchParams?.get?.("contact");

    const { isLoading: loadingHistory } = useQuery({
        queryKey: ["chatHistory", activeContact?.id],
        queryFn: async () => {
            const history = await getChatHistory(activeContact.id);
            setMessages(history);
            return history;
        },
        enabled: !!activeContact?.id,
    });

    useEffect(() => {
        if (!currentUserId) return;

        socket.connect();

        // Let the server bind this socket to the authenticated user's room
        try {
            socket.emit("join_own_room");
        } catch (err) {
            // ignore emit errors
        }

        // Listen for incoming messages (server uses snake_case events)
        const receiveHandler = (message: Message) => {
            // If this message corresponds to an optimistic pending message, replace it
            if (message.clientTempId) {
                setMessages((prev) => {
                    const idx = prev.findIndex((m) => m.id === message.clientTempId);
                    if (idx !== -1) {
                        const copy = [...prev];
                        copy[idx] = message; // replace optimistic with server message
                        return copy;
                    }
                    // not found, append if relevant
                    if (activeContact && (message.senderId === activeContact.id || message.receiverId === activeContact.id)) {
                        return [...prev, message];
                    }
                    return prev;
                });
            } else {
                if (
                    activeContact &&
                    (message.senderId === activeContact.id || message.receiverId === activeContact.id)
                ) {
                    setMessages((prev) => [...prev, message]);
                }
            }

            // Refresh conversations list so left pane shows latest message
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        };

        socket.on("receive_message", receiveHandler);

        return () => {
            socket.off("receive_message", receiveHandler);
            socket.disconnect();
        };
    }, [currentUserId, activeContact]);

    // Auto-select contact from ?contact=ID immediately (fallback when conversations empty)
    useEffect(() => {
        // Only auto-select from the URL `contact` param when we don't already have a manual selection.
        if (!contactParam) return;
        if (activeContact) return; // don't override a user-picked contact

        const found = contacts?.find?.((c: any) => c.id === contactParam);
        if (found) {
            setActiveContact(found);
            return;
        }

        // If not found in existing conversations, set a minimal placeholder so chat opens
        setActiveContact({ id: contactParam, name: 'Researcher' });
    }, [contactParam, contacts, activeContact]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeContact) return;

        const tempId = `temp-${Date.now().toString()}`;

        const messagePayload = {
            receiverId: activeContact.id,
            content: newMessage,
            tempId,
        };

        // Emit according to backend contract (includes our tempId)
        socket.emit("send_message", messagePayload);

        // Optimistic UI: use tempId as the local message id so we can replace it when server responds
        setMessages((prev) => [
            ...prev,
            {
                id: tempId,
                senderId: currentUserId!,
                receiverId: activeContact.id,
                content: newMessage,
                createdAt: new Date().toISOString(),
                clientTempId: tempId,
            },
        ]);

        setNewMessage("");
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-4 animate-in fade-in duration-500">

            <Card className="w-1/3 flex flex-col overflow-hidden border-r shadow-sm">
                <div className="p-4 border-b bg-neutral-50 font-bold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" /> Messages
                </div>
                <ScrollArea className="flex-1">
                    {loadingContacts ? (
                        <div className="p-4 text-center text-neutral-500">Loading contacts...</div>
                    ) : contacts && contacts.length > 0 ? (
                        contacts.map((contact: any) => (
                            <div
                                key={contact.id}
                                onClick={() => setActiveContact(contact)}
                                className={`flex items-center gap-3 p-4 border-b cursor-pointer transition-colors ${activeContact?.id === contact.id ? "bg-emerald-50 border-l-4 border-l-primary" : "hover:bg-neutral-50"
                                    }`}
                            >
                                <Avatar>
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                        {contact.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="overflow-hidden">
                                    <h4 className="font-semibold text-sm truncate">{contact.name}</h4>
                                    <p className="text-xs text-neutral-500 capitalize">{contact.role.toLowerCase()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-neutral-500 text-sm">
                            No active conversations. Reach out to a researcher from their project page!
                        </div>
                    )}
                </ScrollArea>
            </Card>

            <Card className="flex-1 flex flex-col overflow-hidden shadow-sm">
                {activeContact ? (
                    <>
                        <div className="p-4 border-b bg-white flex items-center gap-3 shadow-sm z-10">
                            <Avatar>
                                <AvatarFallback className="bg-primary/10 text-primary">{activeContact.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-bold">{activeContact.name}</h3>
                                <p className="text-xs text-neutral-500">Connected</p>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-4 bg-neutral-50/50">
                            {loadingHistory ? (
                                <div className="text-center text-neutral-500 mt-4">Loading history...</div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((msg) => {
                                        const isMe = msg.senderId === currentUserId;
                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                                <div
                                                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe
                                                        ? "bg-primary text-primary-foreground rounded-br-sm"
                                                        : "bg-white border text-neutral-900 rounded-bl-sm shadow-sm"
                                                        }`}
                                                >
                                                    <p className="text-sm">{msg.content}</p>
                                                    <span className={`text-[10px] block mt-1 ${isMe ? "text-primary-foreground/70 text-right" : "text-neutral-400"}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={scrollRef} />
                                </div>
                            )}
                        </ScrollArea>

                        <div className="p-4 bg-white border-t">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    placeholder={`Message ${activeContact.name}...`}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1 rounded-full bg-neutral-100 border-transparent focus-visible:ring-primary focus-visible:bg-white"
                                />
                                <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={!newMessage.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 bg-neutral-50/50">
                        <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </Card>

        </div>
    );
}
