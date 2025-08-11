"use client"

import { Plus, MessageSquare } from "lucide-react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarInput,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader>
          <Button className="h-8 w-full" size="sm">
            <Plus className="mr-2 size-4" />
            New Chat
          </Button>
          <SidebarInput placeholder="Search your threads…" />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Last 7 Days</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {[
                  "Reviewing authentication hooks…",
                  "Landing page ideas…",
                ].map((title, idx) => (
                  <SidebarMenuItem key={`recent-${idx}`}>
                    <SidebarMenuButton>
                      <MessageSquare />
                      <span>{title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Older</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {[
                  "Upscale image quality…",
                  "Bug triage notes…",
                  "Docs planning…",
                ].map((title, idx) => (
                  <SidebarMenuItem key={`older-${idx}`}>
                    <SidebarMenuButton>
                      <MessageSquare />
                      <span>{title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
            <Avatar className="size-6">
              <AvatarFallback>GM</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 items-center justify-between text-xs">
              <span className="truncate">Guilherme Müller</span>
              <span className="text-muted-foreground ml-2">Free</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}


