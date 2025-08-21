"use client";

import React, { useRef, useEffect, useMemo, useCallback, memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isToday, isYesterday } from "date-fns";
import { cn, generateColorFromString, getContrastColor, getInitials } from "@/lib/utils";
import { type ChatMessage as MessageType, MessageType as MsgType, MessageStatus } from "../types/chat-types";
import { useAppSelector } from "@/store/hooks";
import {
  FileIcon, Check, CheckCheck, Clock, AlertCircle, Download, Play, Pause, Volume2,
  Image as ImageIcon, Copy, Reply, Forward, Trash2, MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSocket } from "../services/socketService";

interface ChatMessageProps {
  message: MessageType;
  showSenderInfo: boolean;
  isLast?: boolean;
  onReply?: (message: MessageType) => void;
  onForward?: (message: MessageType) => void;
  onDelete?: (messageId: string) => void;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({
  message,
  showSenderInfo,
  isLast = false,
  onReply,
  onForward,
  onDelete
}) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const isOwnMessage = message.senderId === currentUser?.id;
  const { markMessageAsRead } = useSocket();
  const messageRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Mark message as read only for messages from others
  useEffect(() => {
    if (!isOwnMessage && isLast && messageRef.current) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) markMessageAsRead(message.id, message.roomId);
      }, { threshold: 0.5 });
      observer.observe(messageRef.current);
      return () => observer.disconnect();
    }
  }, [isOwnMessage, isLast, message.id, message.roomId, markMessageAsRead]);

  // Memoized timestamp
  const formattedTimestamp = useMemo(() => {
    if (!message.timestamp) return "";
    try {
      const date = new Date(message.timestamp);
      if (isToday(date)) return format(date, "HH:mm");
      if (isYesterday(date)) return `Yesterday ${format(date, "HH:mm")}`;
      return format(date, "dd/MM/yyyy HH:mm");
    } catch { return message.timestamp; }
  }, [message.timestamp]);

  // Memoized message status icon
  const messageStatusIcon = useMemo(() => {
    if (!isOwnMessage) return null;
    switch (message.status) {
      case MessageStatus.SENDING: return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />;
      case MessageStatus.FAILED: return <AlertCircle className="h-3 w-3 text-destructive" />;
      case MessageStatus.SENT: return <Check className="h-3 w-3 text-muted-foreground" />;
      case MessageStatus.DELIVERED: return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case MessageStatus.READ: return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default: return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  }, [isOwnMessage, message.status]);

  // Avatar colors
  const fallbackBgColor = useMemo(() => message.sender?.id ? generateColorFromString(message.sender.id) : "#e5e7eb", [message.sender?.id]);
  const fallbackTextColorClass = useMemo(() => getContrastColor(fallbackBgColor) === "light" ? "text-gray-700" : "text-white", [fallbackBgColor]);
  const initials = useMemo(() => getInitials(message.sender?.name), [message.sender?.name]);

  const handleCopy = useCallback(() => navigator.clipboard.writeText(message.content || ""), [message.content]);
  const handleDownload = useCallback((url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);
  const toggleAudio = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) audioRef.current.play();
    else audioRef.current.pause();
  }, []);

  // Render content only once
  const messageContent = useMemo(() => {
    switch (message.type) {
      case MsgType.IMAGE:
        return (
          <img src={message.metadata?.imageUrl || "/placeholder.svg"} alt="Image content" className="rounded-md max-h-[300px] w-full object-cover cursor-pointer" />
        );
      case MsgType.FILE:
        return (
          <div onClick={() => message.metadata?.fileUrl && handleDownload(message.metadata.fileUrl, message.metadata.fileName || "file")}>
            <FileIcon /> {message.metadata?.fileName || "File"}
          </div>
        );
      case MsgType.AUDIO:
        return <audio ref={audioRef} src={message.metadata?.audioUrl} controls className="w-full" />;
      case MsgType.SYSTEM:
        return <div className="text-xs italic text-muted-foreground text-center">{message.content}</div>;
      default:
        return <div>{message.content}</div>;
    }
  }, [message, handleDownload]);

  return (
    <div ref={messageRef} className={cn("flex gap-2 items-end px-2 py-1", isOwnMessage ? "justify-end" : "justify-start")}>
      {!isOwnMessage && showSenderInfo && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender?.avatarUrl} />
          <AvatarFallback style={{ backgroundColor: fallbackBgColor }} className={fallbackTextColorClass}>{initials}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn("flex flex-col max-w-[65%]", isOwnMessage ? "items-end" : "items-start")}>
        {messageContent}
        <div className="flex items-center gap-1 mt-1 text-xs">
          <span>{formattedTimestamp}</span>
          {messageStatusIcon}
        </div>
      </div>
    </div>
  );
};

export const ChatMessage = memo(ChatMessageComponent);
