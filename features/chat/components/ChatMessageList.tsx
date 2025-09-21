"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, MessageSquare } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  selectCurrentRoomMessages,
  selectMessageStatusForRoom,
  selectSelectedRoomId,
  selectTypingUsersForRoom,
} from "../store/chatSlice";
import { ChatMessage } from "./ChatMessage";
import type { ChatMessage as ChatMessageType, TypingUser } from "../types/chat-types";
import { fetchChatMessages, deleteChatMessage } from "../store/chat-thunks";

export const ChatMessageList: React.FC<{
  onReply?: (message: any) => void;
  onForward?: (message: any) => void;
}> = ({ onReply, onForward }) => {
  const dispatch = useAppDispatch();
  const selectedRoomId = useAppSelector(selectSelectedRoomId);
  const messages = useAppSelector(selectCurrentRoomMessages) as ChatMessageType[];
  const messageLoadingStatus = useAppSelector((state) =>
    selectedRoomId ? selectMessageStatusForRoom(state, selectedRoomId) : "idle"
  );
  const typingUsers = useAppSelector((state) =>
    selectedRoomId ? selectTypingUsersForRoom(state, selectedRoomId) : []
  ) as TypingUser[];

  const viewportRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);
  const [prevMessageCount, setPrevMessageCount] = useState(0);
  const scrollRafRef = useRef<number | null>(null);

  // 🚀 Always hard reload messages
 useEffect(() => {
  if (!selectedRoomId) return;

  const loadMessages = () => {
    console.log("🔄 Hard reloading messages:", selectedRoomId, Date.now());
    dispatch(fetchChatMessages({ roomId: selectedRoomId, page: 1, limit: 50 }));
  };

  loadMessages(); // first load
  const interval = setInterval(loadMessages, 3000);

  return () => clearInterval(interval);
}, [selectedRoomId, dispatch]);

  // auto-scroll on new messages
  useEffect(() => {
    if (messages.length > prevMessageCount && prevMessageCount > 0) {
      if (!userScrolledUp) {
        const viewport = viewportRef.current;
        if (viewport) {
          setTimeout(() => {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
          }, 100);
        }
        setShowNewMessageIndicator(false);
      } else {
        setShowNewMessageIndicator(true);
      }
    }
    setPrevMessageCount(messages.length);
  }, [messages.length, prevMessageCount, userScrolledUp]);

  // cleanup any pending animation frames on unmount
  useEffect(() => {
    return () => {
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollRafRef.current) {
      cancelAnimationFrame(scrollRafRef.current);
    }
    scrollRafRef.current = requestAnimationFrame(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const isAtBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 50;

      if (isAtBottom) {
        setUserScrolledUp(false);
        setShowNewMessageIndicator(false);
      } else {
        setUserScrolledUp(true);
      }
    });
  }, []);

  const scrollToBottom = () => {
    const viewport = viewportRef.current;
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    }
    setUserScrolledUp(false);
    setShowNewMessageIndicator(false);
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!selectedRoomId) return;
    dispatch(deleteChatMessage({ roomId: selectedRoomId, messageId }));
  };

  const groupedMessages = useMemo(() => {
    if (!messages || messages.length === 0) return [];
    return messages.reduce((groups: ChatMessageType[][], message: ChatMessageType, index: number) => {
      const prevMessage = messages[index - 1] as ChatMessageType | undefined;
      const shouldStartNewGroup = !prevMessage || prevMessage.senderId !== message.senderId;
      if (shouldStartNewGroup) groups.push([message]);
      else groups[groups.length - 1].push(message);
      return groups;
    }, [] as ChatMessageType[][]);
  }, [messages]);

  if (!selectedRoomId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <MessageSquare size={48} className="mb-4" />
        <h2 className="text-xl font-medium">Select a Chat</h2>
        <p>Choose a conversation from the sidebar to start messaging.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-muted/20">
      <ScrollArea className="flex-1 px-4" viewportRef={viewportRef} onScroll={handleScroll}>
        <div className="py-4">
          {messageLoadingStatus === "loading" && messages.length === 0 ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-4 p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))
          ) : (
            groupedMessages.map((group: ChatMessageType[], groupIndex: number) => (
              <div key={groupIndex} className="mb-1">
                {group.map((message: ChatMessageType, msgIndex: number) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    showSenderInfo={msgIndex === 0}
                    isLast={messages[messages.length - 1]?.id === message.id}
                    onReply={onReply}
                    onForward={onForward}
                    onDelete={handleDeleteMessage}
                  />
                ))}
              </div>
            ))
          )}
        </div>
        <ScrollBar />
      </ScrollArea>

      {typingUsers.length > 0 && (
        <div className="px-4 pb-2 text-sm text-muted-foreground animate-pulse">
          {typingUsers.map((u: TypingUser) => u.userName).join(", ")}{" "}
          {typingUsers.length > 1 ? "are" : "is"} typing...
        </div>
      )}

      {showNewMessageIndicator && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
          <Button
            size="sm"
            className="rounded-full shadow-lg animate-bounce"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      )}
    </div>
  );
};
