// features/chat/components/ChatMessage.tsx

"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isToday, isYesterday } from "date-fns";
import { cn, generateColorFromString, getContrastColor, getInitials } from "@/lib/utils";
import { type ChatMessage as MessageType, MessageType as MsgType, MessageStatus } from "../types/chat-types";
import { useAppSelector } from "@/store/hooks";
import {
    FileIcon,
    Check,
    CheckCheck,
    Clock,
    AlertCircle,
    Download,
    Play,
    Pause,
    Volume2,
    Image as ImageIcon,
    Copy,
    Reply,
    Forward,
    Trash2,
    MoreVertical
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

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  showSenderInfo,
  isLast = false,
  onReply,
  onForward,
  onDelete
}) => {
  // Early return if message is null/undefined or missing required properties
  if (!message || !message.id || !message.senderId) {
    return null;
  }

  const currentUser = useAppSelector((state) => state.auth.user);
  const isOwnMessage = message.senderId === currentUser?.id;
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { markMessageAsRead } = useSocket();
    const messageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOwnMessage && messageRef.current && isLast) {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        markMessageAsRead(message.id, message.roomId);
                    }
                },
                { threshold: 0.5 }
            );

            observer.observe(messageRef.current);
            return () => observer.disconnect();
        }
    }, [message.id, message.roomId, isOwnMessage, isLast, markMessageAsRead]);

    const formatTimestamp = (ts?: string | null): string => {
        if (!ts) return "";
        try {
            const date = new Date(ts);
            if (isToday(date)) return format(date, "HH:mm");
            if (isYesterday(date)) return `Yesterday ${format(date, "HH:mm")}`;
            return format(date, "dd/MM/yyyy HH:mm");
        } catch (error) {
            return ts;
        }
    };

    const getMessageStatusIcon = () => {
        if (!isOwnMessage) return null;
        switch (message.status) {
            case MessageStatus.SENDING:
                return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />;
            case MessageStatus.FAILED:
                return <AlertCircle className="h-3 w-3 text-destructive" />;
            case MessageStatus.SENT:
                return <Check className="h-3 w-3 text-muted-foreground" />;
            case MessageStatus.DELIVERED:
                return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
            case MessageStatus.READ:
                return <CheckCheck className="h-3 w-3 text-blue-500" />;
            default:
                return <Clock className="h-3 w-3 text-muted-foreground" />;
        }
    };
    
    // ... (rest of the component is the same as you provided)

    const renderMessageContent = () => {
        // ...
        return (
            <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                {message.content}
            </div>
        );
    };

    const fallbackBgColor = message.sender?.id ? generateColorFromString(message.sender.id) : '#e5e7eb';
    const contrast = getContrastColor(fallbackBgColor);
    const fallbackTextColorClass = contrast === 'light' ? 'text-gray-700' : 'text-white';
    const initials = getInitials(message.sender?.name || 'Unknown User');

    if (message.type === MsgType.SYSTEM) {
        return (
            <div className="flex justify-center my-3">
                <div className="bg-muted/80 text-muted-foreground rounded-full px-3 py-1 text-xs text-center max-w-md">
                    {message.content}
                </div>
            </div>
        );
    }
    
    return (
        <div
            ref={messageRef}
            className={cn(
                "group flex gap-2 items-end relative px-2 py-1",
                isOwnMessage ? "justify-end" : "justify-start",
                !showSenderInfo && !isOwnMessage && "pl-12"
            )}
        >
             {!isOwnMessage && showSenderInfo && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender?.avatarUrl || ''} />
                    <AvatarFallback style={{ backgroundColor: fallbackBgColor }} className={cn(fallbackTextColorClass)}>
                        {initials}
                    </AvatarFallback>
                </Avatar>
            )}
            <div className={cn(
                "flex flex-col max-w-[75%]",
                isOwnMessage ? "items-end" : "items-start"
            )}>
                 {!isOwnMessage && showSenderInfo && (
                    <span className="text-xs font-medium text-muted-foreground">{message.sender?.name || 'Unknown User'}</span>
                )}
                <div className={cn(
                    "relative px-3 py-2 rounded-2xl",
                    isOwnMessage ? "bg-primary text-primary-foreground" : "bg-background border"
                )}>
                    {renderMessageContent()}
                    <div className="flex items-center gap-1 mt-1 text-xs">
                        <span>{formatTimestamp(message.timestamp)}</span>
                        {getMessageStatusIcon()}
                    </div>
                </div>
            </div>
        </div>
    );
};