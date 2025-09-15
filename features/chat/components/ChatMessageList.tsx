"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  addMessage, // ✅ new reducer
} from "../store/chatSlice";
import { ChatMessage } from "./ChatMessage";
import { fetchChatMessages, deleteChatMessage } from "../store/chat-thunks";
import { useSocket } from "../services/socketService";

export const ChatMessageList: React.FC<{
  onReply?: (message: any) => void;
  onForward?: (message: any) => void;
}> = ({ onReply, onForward }) => {
  const dispatch = useAppDispatch();
  const selectedRoomId = useAppSelector(selectSelectedRoomId);
  const messages = useAppSelector(selectCurrentRoomMessages);
  const messageLoadingStatus = useAppSelector((state) =>
    selectedRoomId ? selectMessageStatusForRoom(state, selectedRoomId) : "idle"
  );
  const typingUsers = useAppSelector((state) =>
    selectedRoomId ? selectTypingUsersForRoom(state, selectedRoomId) : []
  );

  const viewportRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);
  const [prevMessageCount, setPrevMessageCount] = useState(0);

  const { joinRoom, leaveRoom, socket } = useSocket();

  // ✅ Real-time listener
  useEffect(() => {
    if (!socket || !selectedRoomId) return;

    const handleNewMessage = (msg: any) => {
      if (msg.roomId !== selectedRoomId) return;

      dispatch(addMessage(msg));

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
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedRoomId, dispatch, userScrolledUp]);

  // ✅ Initial join/leave room
  useEffect(() => {
    if (selectedRoomId) {
      joinRoom(selectedRoomId);
      dispatch(fetchChatMessages({ roomId: selectedRoomId, page: 1, limit: 50 }));
    }
    return () => {
      if (selectedRoomId) leaveRoom(selectedRoomId);
    };
  }, [selectedRoomId, joinRoom, leaveRoom, dispatch]);

  // ✅ Track message changes
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

  const handleScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const isAtBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 50;
    setUserScrolledUp(!isAtBottom);
    if (isAtBottom) setShowNewMessageIndicator(false);
  };

  const scrollToBottom = () => {
    const viewport = viewportRef.current;
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    }
    setUserScrolledUp(false);
    setShowNewMessageIndicator(false);
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-muted/20">
      <ScrollArea className="flex-1 px-4" viewportRef={viewportRef} onScroll={handleScroll}>
        <div className="py-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onReply={onReply}
              onForward={onForward}
              onDelete={(id) =>
                dispatch(deleteChatMessage({ roomId: selectedRoomId!, messageId: id }))
              }
            />
          ))}
        </div>
        <ScrollBar />
      </ScrollArea>

      {typingUsers.length > 0 && (
        <div className="px-4 pb-2 text-sm text-muted-foreground animate-pulse">
          {typingUsers.map((u) => u.userName).join(", ")}{" "}
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
