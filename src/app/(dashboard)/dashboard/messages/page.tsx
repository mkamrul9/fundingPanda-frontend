"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { socket } from "@/lib/socket";
import { getConversations, getChatHistory, uploadChatImage, sendTextMessage } from "@/services/message.service";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, Paperclip, Loader2 } from "lucide-react";

interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    imageUrl?: string | null;
    createdAt: string;
    clientTempId?: string | null;
    sender?: { id: string; name: string };
    receiver?: { id: string; name: string };
}

interface ConversationItem {
    id: string;
    name: string;
    role: string;
    unreadCount?: number;
}
import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from "next/navigation";

export default function MessagesPage() {
    const { data: session } = useSession();
    const currentUserId = session?.user?.id;

    const [activeContact, setActiveContact] = useState<any | null>(null);
    const [activePane, setActivePane] = useState<"conversations" | "chat">("conversations");
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatusText, setUploadStatusText] = useState("");
    const [hasNewIncomingMessage, setHasNewIncomingMessage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const activeContactIdRef = useRef<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    const { data: contacts, isLoading: loadingContacts } = useQuery<ConversationItem[]>({
        queryKey: ["conversations"],
        queryFn: getConversations,
        enabled: !!currentUserId,
    });

    const queryClient = useQueryClient();

    const appendUniqueMessage = (prev: Message[], message: Message) => {
        const existingIndex = prev.findIndex((m) => m.id === message.id);
        if (existingIndex !== -1) {
            const copy = [...prev];
            copy[existingIndex] = { ...copy[existingIndex], ...message };
            return copy;
        }
        return [...prev, message];
    };

    const searchParams = useSearchParams();
    const contactParam = searchParams?.get?.("contact");

    const { data: chatHistory, isLoading: loadingHistory } = useQuery<Message[]>({
        queryKey: ["chatHistory", activeContact?.id],
        queryFn: () => getChatHistory(activeContact.id),
        enabled: !!activeContact?.id,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        if (!activeContact?.id) {
            setMessages([]);
            return;
        }

        setMessages(chatHistory || []);
        setHasNewIncomingMessage(false);
    }, [activeContact?.id, chatHistory]);

    useEffect(() => {
        activeContactIdRef.current = activeContact?.id ?? null;
    }, [activeContact?.id]);

    useEffect(() => {
        if (!currentUserId) return;

        socket.connect();

        // Let the server bind this socket to the authenticated user's room
        try {
            socket.emit("join_own_room", currentUserId);
            socket.emit("join_own_room");
            socket.emit("joinOwnRoom", currentUserId);
        } catch (err) {
            // ignore emit errors
        }

        // Listen for incoming messages (server uses snake_case events)
        const receiveHandler = (message: Message) => {
            const activeId = activeContactIdRef.current;

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
                    if (activeId && (message.senderId === activeId || message.receiverId === activeId)) {
                        return appendUniqueMessage(prev, message);
                    }
                    return prev;
                });
            } else {
                if (
                    activeId &&
                    (message.senderId === activeId || message.receiverId === activeId)
                ) {
                    setMessages((prev) => appendUniqueMessage(prev, message));
                    if (message.senderId !== currentUserId) {
                        setHasNewIncomingMessage(true);
                    }
                }
            }

            // Refresh conversations list so left pane shows latest message
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        };

        socket.on("receive_message", receiveHandler);
        socket.on("receiveMessage", receiveHandler);

        return () => {
            socket.off("receive_message", receiveHandler);
            socket.off("receiveMessage", receiveHandler);
            socket.disconnect();
        };
    }, [currentUserId, queryClient]);

    // Auto-select contact from ?contact=ID immediately (fallback when conversations empty)
    useEffect(() => {
        const preferredContactId = contactParam || (typeof window !== 'undefined' ? localStorage.getItem('lastMessageContactId') : null);
        if (!preferredContactId) return;
        if (activeContact) return; // don't override a user-picked contact

        const found = contacts?.find?.((c: any) => c.id === preferredContactId);
        if (found) {
            setActiveContact(found);
            setActivePane("chat");
            return;
        }

        // If not found in existing conversations, set a minimal placeholder so chat opens
        setActiveContact({ id: preferredContactId, name: 'Researcher' });
        setActivePane("chat");
    }, [contactParam, contacts, activeContact]);

    useEffect(() => {
        if (!activeContact?.id) return;
        if (typeof window !== 'undefined') {
            localStorage.setItem('lastMessageContactId', activeContact.id);
        }
    }, [activeContact?.id]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeContact) return;

        const tempId = `temp-${Date.now().toString()}`;

        const content = newMessage.trim();
        const messagePayload = {
            receiverId: activeContact.id,
            content,
            tempId,
        };

        // Emit for real-time experience.
        socket.emit("send_message", messagePayload);
        socket.emit("sendMessage", messagePayload);

        // Optimistic UI: use tempId as the local message id so we can replace it when server responds
        setMessages((prev) => [
            ...prev,
            {
                id: tempId,
                senderId: currentUserId!,
                receiverId: activeContact.id,
                content,
                createdAt: new Date().toISOString(),
                clientTempId: tempId,
            },
        ]);

        setNewMessage("");

        // Also persist via HTTP to guarantee durability when socket is unstable.
        try {
            const persisted = await sendTextMessage({
                receiverId: activeContact.id,
                content,
            });

            setMessages((prev) => {
                const index = prev.findIndex((msg) => msg.id === tempId);
                if (index === -1) return prev;
                const copy = [...prev];
                copy[index] = {
                    ...copy[index],
                    ...persisted,
                };
                return copy;
            });
        } catch {
            // If REST endpoint is not deployed yet, keep socket-delivered optimistic message.
            toast.info("Message sent in realtime.");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeContact) return;

        try {
            setIsUploading(true);
            setUploadStatusText("Uploading image...");
            const uploaded = await uploadChatImage(file, activeContact.id);
            setUploadStatusText("Sending image...");

            setMessages((prev) => [
                ...prev,
                {
                    id: uploaded.id ?? Date.now().toString(),
                    senderId: uploaded.senderId ?? currentUserId!,
                    receiverId: uploaded.receiverId ?? activeContact.id,
                    content: uploaded.content ?? "",
                    imageUrl: uploaded.imageUrl ?? null,
                    createdAt: uploaded.createdAt ?? new Date().toISOString(),
                },
            ]);

            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        } catch {
            toast.error("Failed to upload image.");
        } finally {
            setIsUploading(false);
            setUploadStatusText("");
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] flex-col gap-4 animate-in fade-in duration-500">

            <div className="flex items-center gap-2">
                <Button
                    variant={activePane === "conversations" ? "default" : "outline"}
                    onClick={() => setActivePane("conversations")}
                >
                    Conversations
                </Button>
                <Button
                    variant={activePane === "chat" ? "default" : "outline"}
                    onClick={() => setActivePane("chat")}
                    disabled={!activeContact}
                >
                    Message
                </Button>
            </div>

            {activePane === "conversations" && (
                <Card className="flex flex-1 flex-col overflow-hidden border-r shadow-sm">
                    <div className="p-4 border-b bg-neutral-50 font-bold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" /> Messages
                    </div>
                    <ScrollArea className="flex-1">
                        {loadingContacts ? (
                            <div className="p-4 text-center text-neutral-500">Loading contacts...</div>
                        ) : contacts && contacts.length > 0 ? (
                            contacts.map((contact) => (
                                <div
                                    key={contact.id}
                                    onClick={() => {
                                        setActiveContact(contact);
                                        setActivePane("chat");
                                        router.replace(`${pathname}?contact=${contact.id}`, { scroll: false });
                                    }}
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
                                    {Number(contact.unreadCount || 0) > 0 && (
                                        <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                                            {contact.unreadCount}
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-neutral-500 text-sm">
                                No active conversations. Reach out to a researcher from their project page!
                            </div>
                        )}
                    </ScrollArea>
                </Card>
            )}

            {activePane === "chat" && (
                <Card className="flex flex-1 flex-col overflow-hidden shadow-sm">
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
                                {hasNewIncomingMessage && (
                                    <button
                                        type="button"
                                        className="ml-3 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                                        onClick={() => setHasNewIncomingMessage(false)}
                                    >
                                        New messages
                                    </button>
                                )}
                                <Button variant="outline" size="sm" className="ml-auto" onClick={() => setActivePane("conversations")}>
                                    Back to conversations
                                </Button>
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
                                                        <div className="text-sm">
                                                            {msg.imageUrl || msg.content.includes("res.cloudinary.com") ? (
                                                                <a href={msg.imageUrl || msg.content} target="_blank" rel="noopener noreferrer">
                                                                    <img
                                                                        src={msg.imageUrl || msg.content}
                                                                        alt="Chat attachment"
                                                                        className="mt-1 max-w-50 rounded-md transition-opacity hover:opacity-90"
                                                                    />
                                                                </a>
                                                            ) : msg.content}
                                                            {!isMe && (
                                                                <p className="mt-1 text-[11px] text-neutral-400">
                                                                    {msg.sender?.name || activeContact.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <span className={`text-[10px] block mt-1 ${isMe ? "text-primary-foreground/70 text-right" : "text-neutral-400"}`}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollArea>

                            <div className="p-4 bg-white border-t">
                                {isUploading && (
                                    <div className="mb-2 flex items-center gap-2 text-sm text-neutral-500">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {uploadStatusText || "Uploading image..."}
                                    </div>
                                )}
                                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/webp"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="shrink-0 text-neutral-500 hover:text-primary"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                    >
                                        <Paperclip className="h-5 w-5" />
                                    </Button>
                                    <Input
                                        placeholder={isUploading ? "Uploading image..." : `Message ${activeContact.name}...`}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={isUploading}
                                        className="flex-1 rounded-full bg-neutral-100 border-transparent focus-visible:ring-primary focus-visible:bg-white"
                                    />
                                    <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={!newMessage.trim() || isUploading}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 bg-neutral-50/50">
                            <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                            <p>Select a conversation to start messaging</p>
                            <Button variant="outline" className="mt-4" onClick={() => setActivePane("conversations")}>
                                Open conversations
                            </Button>
                        </div>
                    )}
                </Card>
            )}

        </div>
    );
}
