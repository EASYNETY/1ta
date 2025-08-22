// features/chat/components/SelectChatPrompt.tsx

import type React from "react"
import { MessageSquare } from "lucide-react"

export const SelectChatPrompt: React.FC = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center bg-muted/50 p-8">
      <MessageSquare className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h2 className="text-xl font-semibold text-foreground/90">Select a Chat</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        Choose a conversation from the list to start chatting. Each chat room is associated with a course, class, or
        event.
      </p>
      <p className="text-xs text-muted-foreground/70 mt-6">
        Note: Direct student-to-student messaging is not available. All chats are moderated by instructors.
      </p>
    </div>
  )
}
