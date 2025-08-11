"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Send, Trash2, StopCircle, Settings2, Bot, User } from "lucide-react"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ChatRole = "user" | "assistant"
type Message = {
    id: string
    role: ChatRole
    content: string
    createdAt: number
}

function generateId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const DEFAULT_WELCOME: Message = {
    id: generateId(),
    role: "assistant",
    content:
        "Hi! I'm your assistant. Ask a question or describe a task. Use Shift+Enter for a new line.",
    createdAt: Date.now(),
}

export default function ProfilePage() {
    const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME])
    const [input, setInput] = useState("")
    const [isStreaming, setIsStreaming] = useState(false)
    const [model, setModel] = useState("gpt-4o-mini")

    const endRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }, [messages.length, isStreaming])

    const canSend = useMemo(() => input.trim().length > 0 && !isStreaming, [input, isStreaming])

    function handleSend() {
        if (!canSend) return
        const userMessage: Message = {
            id: generateId(),
            role: "user",
            content: input.trim(),
            createdAt: Date.now(),
        }
        setMessages((prev) => [...prev, userMessage])
        setInput("")

        // Placeholder de integração: mostre um estado de "gerando" até conectar seu backend/IA
        setIsStreaming(true)
        const placeholder: Message = {
            id: generateId(),
            role: "assistant",
            content: "Waiting for server response…",
            createdAt: Date.now(),
        }
        setMessages((prev) => [...prev, placeholder])
    }

    function handleStop() {
        // Ao integrar sua lógica, interrompa o streaming/resposta aqui
        setIsStreaming(false)
        setMessages((prev) => {
            // Opcional: remova o placeholder de "gerando"
            const last = [...prev]
            for (let i = last.length - 1; i >= 0; i--) {
                if (last[i].role === "assistant" && last[i].content.startsWith("Waiting for server response")) {
                    last.splice(i, 1)
                    break
                }
            }
            return last
        })
    }

    function handleClear() {
        setMessages([DEFAULT_WELCOME])
        setIsStreaming(false)
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex h-full w-full flex-col">
            <Card className="flex h-full min-h-0 flex-col rounded-none border-0">
                <CardContent className="min-h-0 flex-1 p-0">
                    <ScrollArea className="h-full">
                        <div className="flex flex-col gap-6 p-4 md:p-6">
                            {messages.map((m) => (
                                <ChatMessage key={m.id} message={m} />
                            ))}
                            <div ref={endRef} />
                        </div>
                    </ScrollArea>
                </CardContent>

                <CardFooter className="border-t">
                    <div className="flex w-full flex-col gap-2">
                        <div className="flex items-end gap-2">
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                placeholder={isStreaming ? "Generating response…" : "Type your message here…"}
                                disabled={isStreaming}
                                className="max-h-40 min-h-16 resize-y"
                            />

                            {isStreaming ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="secondary" size="lg" onClick={handleStop}>
                                            <StopCircle className="size-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Stop generation</TooltipContent>
                                </Tooltip>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span>
                                            <Button size="lg" onClick={handleSend} disabled={!canSend}>
                                                <Send className="size-5" />
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>Send (Enter)</TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

function ChatMessage({ message }: { message: Message }) {
    const isUser = message.role === "user"
    return (
        <div className="group/message">
            <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
                <Avatar className="size-8">
                    <AvatarFallback>
                        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
                    </AvatarFallback>
                </Avatar>

                <div
                    className={
                        isUser
                            ? "bg-primary text-primary-foreground max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 shadow-xs"
                            : "bg-muted/40 max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs"
                    }
                >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                </div>
            </div>
        </div>
    )
}   