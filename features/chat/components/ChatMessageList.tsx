// features/chat/components/ChatMessageList.tsx
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
  addMessage,
} from "../store/chatSlice";
import { ChatMessage } from "./ChatMessage";
import { fetchChatMessages, deleteChatMessage } from "../store/chat-thunks";
import { useSocket } from "../services/socketService";

interface ChatMessageListProps {
  onReply?: (message: any) => void;
  onForward?: (message: any) => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({ onReply, onForward }) => {
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
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);
  const [prevMessageCount, setPrevMessageCount] = useState(0);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // useSocket may return { joinRoom, leaveRoom, socket } or just { joinRoom, leaveRoom }.
  const socketService = useSocket();
  // attempt to get socket object from the service in a flexible way
  const socket: any =
    (socketService as any).socket ?? (socketService as any).getSocket?.() ?? (socketService as any);

  const joinRoom = (socketService as any).joinRoom;
  const leaveRoom = (socketService as any).leaveRoom;

  // Auto-refresh function (backup)
  const autoRefreshMessages = useCallback(async () => {
    if (!selectedRoomId || isAutoRefreshing || messageLoadingStatus === "loading") return;
    setIsAutoRefreshing(true);
    setRefreshCount((p) => p + 1);
    try {
      const result = await dispatch(
        fetchChatMessages({
          roomId: selectedRoomId,
          page: 1,
          limit: 50,
          timestamp: Date.now(),
        } as any)
      );
      // optional logging: console.log("auto-refresh", result);
      if (result.meta.requestStatus === "fulfilled") {
        // server messages merged by slice
        setHasMore(true);
        setPage(1);
      }
    } catch (e) {
      // ignore
    } finally {
      setTimeout(() => setIsAutoRefreshing(false), 400);
    }
  }, [selectedRoomId, dispatch, isAutoRefreshing, messageLoadingStatus]);

  // start/stop auto-refresh
  useEffect(() => {
    if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    if (!selectedRoomId) return;
    autoRefreshRef.current = setInterval(() => autoRefreshMessages(), 3000);
    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
        autoRefreshRef.current = null;
      }
    };
  }, [selectedRoomId, autoRefreshMessages]);

  // join room + initial fetch
  useEffect(() => {
    if (!selectedRoomId) return;
    try {
      joinRoom && joinRoom(selectedRoomId);
    } catch (e) {
      /* ignore */
    }

    // fetch first page
    setPage(1);
    setHasMore(true);
    dispatch(fetchChatMessages({ roomId: selectedRoomId, page: 1, limit: 50 } as any));

    return () => {
      try {
        leaveRoom && leaveRoom(selectedRoomId);
      } catch (e) {
        /* ignore */
      }
    };
  }, [selectedRoomId, dispatch, joinRoom, leaveRoom]);

  // socket listener: flexible about socket object shape
  useEffect(() => {
    if (!socket || !selectedRoomId) return;

    const eventNameCandidates = ["newMessage", "message:new", "message", "message:new:room"]; // try common names
    // Prefer 'newMessage' first; if your backend uses something else, change below.
    const EVENT = "newMessage";

    const handler = (msg: any) => {
      try {
        // ensure msg belongs to this room (server may send room info or it may be implicit)
        if (!msg) return;
        if (msg.roomId && msg.roomId !== selectedRoomId) return;
        // if server doesn't include roomId, we assume socket is already scoped to the room
        dispatch(addMessage(msg));
        // Auto-scroll behaviour:
        const viewport = viewportRef.current;
        if (!userScrolledUp && viewport) {
          setTimeout(() => viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" }), 80);
          setShowNewMessageIndicator(false);
        } else {
          setShowNewMessageIndicator(true);
        }
      } catch (e) {
        // ignore
      }
    };

    // Register handler (try several ways depending how socket object exposes API)
    if (typeof socket.on === "function") {
      socket.on(EVENT, handler);
    } else if (typeof (socket as any).addEventListener === "function") {
      (socket as any).addEventListener(EVENT, handler);
    } else if ((socket as any).subscribe) {
      // some wrappers:
      (socket as any).subscribe(EVENT, handler);
    } else {
      // last resort: try event name candidates
      for (const ev of eventNameCandidates) {
        try {
          typeof socket.on === "function" && socket.on(ev, handler);
        } catch {}
      }
    }

    return () => {
      try {
        if (typeof socket.off === "function") {
          socket.off(EVENT, handler);
        } else if (typeof (socket as any).removeEventListener === "function") {
          (socket as any).removeEventListener(EVENT, handler);
        } else if ((socket as any).unsubscribe) {
          (socket as any).unsubscribe(EVENT, handler);
        } else {
          for (const ev of eventNameCandidates) {
            try {
              typeof socket.off === "function" && socket.off(ev, handler);
            } catch {}
          }
        }
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, selectedRoomId, dispatch, userScrolledUp]);

  // Detect changes in messages count (auto-scroll show indicator)
  useEffect(() => {
    if (messages.length > prevMessageCount && prevMessageCount > 0) {
      if (!userScrolledUp) {
        const viewport = viewportRef.current;
        if (viewport) {
          setTimeout(() => viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" }), 120);
        }
        setShowNewMessageIndicator(false);
      } else {
        setShowNewMessageIndicator(true);
      }
    }
    setPrevMessageCount(messages.length);
  }, [messages.length, prevMessageCount, userScrolledUp]);

  // initial scroll when first messages load
  useEffect(() => {
    if (messages.length > 0 && prevMessageCount === 0 && !userScrolledUp) {
      const vp = viewportRef.current;
      if (vp) setTimeout(() => vp.scrollTo({ top: vp.scrollHeight, behavior: "auto" }), 300);
    }
  }, [messages.length, prevMessageCount, userScrolledUp]);

  // scroll handler
  const handleScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const isAtBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 50;
    const isNearTop = viewport.scrollTop < 200;
    if (isAtBottom) {
      setUserScrolledUp(false);
      setShowNewMessageIndicator(false);
    } else {
      setUserScrolledUp(true);
    }

    if (isNearTop && hasMore && messageLoadingStatus !== "loading") {
      // load older
      handleLoadMore();
    }
  }, [hasMore, messageLoadingStatus]);

  const scrollToBottom = () => {
    const vp = viewportRef.current;
    if (!vp) return;
    vp.scrollTo({ top: vp.scrollHeight, behavior: "smooth" });
    setUserScrolledUp(false);
    setShowNewMessageIndicator(false);
  };

  // Load older messages
  const handleLoadMore = useCallback(async () => {
    if (!selectedRoomId || messageLoadingStatus === "loading" || !hasMore) return;
    const viewport = viewportRef.current;
    const scrollHeightBefore = viewport?.scrollHeight || 0;
    const scrollTopBefore = viewport?.scrollTop || 0;

    const nextPage = page + 1;
    const result = await dispatch(fetchChatMessages({ roomId: selectedRoomId, page: nextPage, limit: 20 } as any));
    const fetched = (result.payload as any)?.data ?? [];
    if (result.meta.requestStatus === "fulfilled" && fetched.length === 0) {
      setHasMore(false);
    } else {
      // keep scroll position after older messages appended to top
      setTimeout(() => {
        if (viewport) {
          const scrollHeightAfter = viewport.scrollHeight;
          const diff = scrollHeightAfter - scrollHeightBefore;
          viewport.scrollTo({ top: scrollTopBefore + diff, behavior: "auto" });
        }
      }, 80);
    }
    setPage(nextPage);
  }, [selectedRoomId, messageLoadingStatus, hasMore, page, dispatch]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!selectedRoomId) return;
    dispatch(deleteChatMessage({ roomId: selectedRoomId, messageId } as any));
  }, [selectedRoomId, dispatch]);

  // group messages by sender for rendering (keeps your existing UI)
  const groupedMessages = useMemo(() => {
    if (!messages || messages.length === 0) return [];
    return messages.reduce((groups: any[][], message: any, index: number) => {
      const prevMessage = messages[index - 1];
      const shouldStartNewGroup = !prevMessage || prevMessage.senderId !== message.senderId;
      if (shouldStartNewGroup) groups.push([message]);
      else groups[groups.length - 1].push(message);
      return groups;
    }, [] as any[]);
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
      {/* Debug panel (optional) */}
      <div className="absolute top-2 left-2 z-50 bg-black/80 text-white text-xs p-3 rounded-lg font-mono">
        <div>🏠 Room: {selectedRoomId?.slice(-8)}</div>
        <div>📨 Messages: {messages.length}</div>
        <div>🔄 Refreshes: {refreshCount}</div>
        <div>⚡ Status: {messageLoadingStatus}</div>
        <div>🔄 Auto: {isAutoRefreshing ? "🟢 ON" : "🔴 OFF"}</div>
        <div>📍 Scroll: {userScrolledUp ? "👆 UP" : "⬇️ BOTTOM"}</div>
      </div>

      {isAutoRefreshing && (
        <div className="absolute top-2 right-2 z-50">
          <div className="flex items-center space-x-2 bg-green-500/90 text-white px-3 py-2 rounded-lg shadow-lg animate-pulse">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            <span className="text-sm font-medium">Fetching latest...</span>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 px-4" viewportRef={viewportRef} onScroll={handleScroll}>
        <div className="py-4">
          {hasMore && (
            <div className="text-center mb-4">
              <Button variant="ghost" size="sm" onClick={handleLoadMore} disabled={messageLoadingStatus === "loading"}>
                {messageLoadingStatus === "loading" ? "Loading..." : "Load More Messages"}
              </Button>
            </div>
          )}

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
            groupedMessages.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-1">
                {group.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
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
          {typingUsers.map((u: any) => u.userName).join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing...
        </div>
      )}

      {showNewMessageIndicator && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
          <Button size="sm" className="rounded-full shadow-lg animate-bounce" onClick={scrollToBottom}>
            <ArrowDown className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      )}
    </div>
  );
};
