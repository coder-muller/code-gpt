"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Send, StopCircle, Bot, User } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

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
    const [sessionId, setSessionId] = useState<string>("")

    const endRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }, [messages.length, isStreaming])

    const canSend = useMemo(() => input.trim().length > 0 && !isStreaming, [input, isStreaming])

    useEffect(() => {
        setSessionId(typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()))
    }, [])

    async function handleSend() {
        if (!canSend) return
        const userMessage: Message = {
            id: generateId(),
            role: "user",
            content: input.trim(),
            createdAt: Date.now(),
        }
        setMessages((prev) => [...prev, userMessage])
        setInput("")

        setIsStreaming(true)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage.content, sessionId }),
            })

            if (!res.ok || !res.body) throw new Error('Request failed')

            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let assistantText = ""

            // placeholder assistant
            const assistantId = generateId()
            setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '', createdAt: Date.now() }])

            // consume text stream
            while (true) {
                const { value, done } = await reader.read()
                if (done) break
                const chunk = decoder.decode(value, { stream: true })
                assistantText += chunk
                setMessages((prev) => {
                    const copy = [...prev]
                    const idx = copy.findIndex((m) => m.id === assistantId)
                    if (idx !== -1) copy[idx] = { ...copy[idx], content: assistantText }
                    return copy
                })
            }
        } catch (e) {
            setMessages((prev) => [...prev, { id: generateId(), role: 'assistant', content: 'Erro ao gerar resposta.', createdAt: Date.now() }])
        } finally {
            setIsStreaming(false)
        }
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
        <div className="flex h-dvh w-full flex-col">
            <Card className="flex flex-1 min-h-0 flex-col rounded-none border-0">
                <CardContent className="min-h-0 flex-1 p-0">
                    <ScrollArea className="h-full">
                        <div className="flex flex-col gap-6 p-4 pb-36 md:p-6">
                            {messages.map((m) => (
                                <ChatMessage key={m.id} message={m} />
                            ))}
                            <div ref={endRef} />
                        </div>
                    </ScrollArea>
                </CardContent>

                <CardFooter className="relative sticky bottom-0 z-20 border-t-0 bg-transparent p-4 backdrop-blur-lg supports-[backdrop-filter]:bg-background/20 before:pointer-events-none before:absolute before:inset-x-0 before:-top-6 before:h-6 before:bg-gradient-to-t before:from-background/60 before:to-transparent">
                    <div className="w-full max-w-3xl mx-auto rounded-2xl border border-border/40 bg-background/60 shadow-lg p-2">
                        <div className="flex items-end gap-2">
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                placeholder={isStreaming ? "Generating response…" : "Type your message here…"}
                                disabled={isStreaming}
                                className="min-h-12 max-h-24 resize-none bg-transparent border-0 focus-visible:ring-0"
                            />

                            {isStreaming ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="secondary" size="icon" className="shrink-0" onClick={handleStop}>
                                            <StopCircle className="size-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Stop generation</TooltipContent>
                                </Tooltip>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span>
                                            <Button size="icon" className="shrink-0" onClick={handleSend} disabled={!canSend}>
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