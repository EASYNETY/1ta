// app/(authenticated)/chat/page.tsx
"use client"; // Layout component uses hooks

import { ChatLayout } from "@/features/chat/components/ChatLayout"; // Adjust path

export default function ChatPage() {
    // For now, the main page just renders the layout.
    // Specific room logic could be handled via dynamic routes later ([roomId]/page.tsx)
    // or by the ChatLayout component itself reacting to URL changes if needed.
    return <ChatLayout />;
}