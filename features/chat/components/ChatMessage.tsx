// features/chat/components/ChatMessage.tsx - Enhanced WhatsApp-style

"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, parseISO, isToday, isYesterday, isValid } from "date-fns";
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
import { Badge } from "@/components/ui/badge";
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
    const currentUser = useAppSelector((state) => state.auth.user);
    const isOwnMessage = message.senderId === currentUser?.id;
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { markMessageAsRead } = useSocket();
    const messageRef = useRef<HTMLDivElement>(null);

    // Mark message as read when it comes into view
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

    const formatTimestamp = (ts: string | null | undefined): string => {
        if (!ts) return "";

        try {
            const date = parseISO(ts);
            if (!isValid(date)) {
                console.warn(`Invalid timestamp: "${ts}"`);
                return "";
            }

            if (isToday(date)) {
                return format(date, "HH:mm");
            } else if (isYesterday(date)) {
                return `Yesterday ${format(date, "HH:mm")}`;
            } else {
                return format(date, "dd/MM/yyyy HH:mm");
            }
        } catch (error) {
            console.error("Error formatting timestamp:", error);
            return "";
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

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
    };

    const handleDownload = (url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleAudio = () => {
        if (audioRef.current) {
            if (audioPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setAudioPlaying(!audioPlaying);
        }
    };

    const renderMessageContent = () => {
        switch (message.type) {
            case MsgType.IMAGE:
                return (
                    <div className="relative group">
                        <div className="relative max-w-[280px] sm:max-w-[320px]">
                            {!imageLoaded && (
                                <div className="flex items-center justify-center h-32 bg-muted rounded-md">
                                    <ImageIcon className="h-8 w-8 text-muted-foreground animate-pulse" />
                                </div>
                            )}
                            <img
                                src={message.metadata?.imageUrl || "/placeholder.svg"}
                                alt="Image content"
                                className={cn(
                                    "rounded-md max-h-[300px] object-cover w-full cursor-pointer transition-opacity",
                                    imageLoaded ? "opacity-100" : "opacity-0"
                                )}
                                onLoad={() => setImageLoaded(true)}
                                onClick={() => {
                                    // Open image in full screen or modal
                                    window.open(message.metadata?.imageUrl, '_blank');
                                }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-md" />
                        </div>
                        {message.content && (
                            <p className="mt-2 text-sm">{message.content}</p>
                        )}
                    </div>
                );

            case MsgType.FILE:
                return (
                    <div 
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-opacity-80 transition-colors min-w-[200px]",
                            isOwnMessage 
                                ? "bg-primary/10 border-primary/20 hover:bg-primary/20" 
                                : "bg-muted border-muted-foreground/20 hover:bg-muted/80"
                        )}
                        onClick={() => {
                            if (message.metadata?.fileUrl) {
                                handleDownload(message.metadata.fileUrl, message.metadata.fileName || 'file');
                            }
                        }}
                    >
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <FileIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {message.metadata?.fileName || "File"}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {message.metadata?.fileSize && (
                                    <span>{(message.metadata.fileSize / 1024).toFixed(1)} KB</span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Download className="h-3 w-3" />
                                    Download
                                </span>
                            </div>
                        </div>
                    </div>
                );

            case MsgType.AUDIO:
                return (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg min-w-[200px]">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={toggleAudio}
                        >
                            {audioPlaying ? (
                                <Pause className="h-4 w-4" />
                            ) : (
                                <Play className="h-4 w-4" />
                            )}
                        </Button>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Volume2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Voice message</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {message.metadata?.duration || "0:00"}
                            </div>
                        </div>
                        <audio
                            ref={audioRef}
                            src={message.metadata?.audioUrl}
                            onEnded={() => setAudioPlaying(false)}
                            className="hidden"
                        />
                    </div>
                );

            case MsgType.SYSTEM:
                return (
                    <div className="text-xs italic text-muted-foreground text-center px-4 py-1">
                        {message.content}
                    </div>
                );

            default: // TEXT
                return (
                    <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {message.content}
                        {message.metadata?.isEdited && (
                            <span className="text-xs text-muted-foreground ml-2 italic">
                                (edited)
                            </span>
                        )}
                    </div>
                );
        }
    };

    const fallbackBgColor = message.sender?.id ? generateColorFromString(message.sender.id) : '#e5e7eb';
    const contrast = getContrastColor(fallbackBgColor);
    const fallbackTextColorClass = contrast === 'light' ? 'text-gray-700' : 'text-white';
    const initials = getInitials(message.sender?.name);

    // System messages
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
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Avatar for other users */}
            {!isOwnMessage && (
                <div className="flex-shrink-0 h-8 w-8 mb-1">
                    {showSenderInfo ? (
                        <Avatar className="h-full w-full">
                            <AvatarImage
                                src={message.sender?.avatarUrl}
                                alt={message.sender?.name || "User"}
                            />
                            <AvatarFallback
                                style={{ backgroundColor: fallbackBgColor }}
                                className={cn("text-xs font-medium", fallbackTextColorClass)}
                            >
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    ) : (
                        <div className="h-8 w-8" />
                    )}
                </div>
            )}

            {/* Message Actions - Show on hover */}
            {isHovered && !message.isOptimistic && (
                <div className={cn(
                    "absolute top-0 z-10 flex items-center gap-1",
                    isOwnMessage ? "right-0 mr-2" : "left-12 ml-2"
                )}>
                    <TooltipProvider>
                        {onReply && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 bg-background/90 backdrop-blur border shadow-sm hover:bg-accent"
                                        onClick={() => onReply(message)}
                                    >
                                        <Reply className="h-3 w-3" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Reply</TooltipContent>
                            </Tooltip>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 bg-background/90 backdrop-blur border shadow-sm hover:bg-accent"
                                >
                                    <MoreVertical className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isOwnMessage ? "end" : "start"}>
                                {message.type === MsgType.TEXT && (
                                    <DropdownMenuItem onClick={handleCopy}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy
                                    </DropdownMenuItem>
                                )}
                                {onForward && (
                                    <DropdownMenuItem onClick={() => onForward(message)}>
                                        <Forward className="h-4 w-4 mr-2" />
                                        Forward
                                    </DropdownMenuItem>
                                )}
                                {isOwnMessage && onDelete && (
                                    <DropdownMenuItem 
                                        onClick={() => onDelete(message.id)}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TooltipProvider>
                </div>
            )}

            <div className={cn(
                "flex flex-col max-w-[75%] sm:max-w-[65%]",
                isOwnMessage ? "items-end" : "items-start"
            )}>
                {/* Sender name for group chats */}
                {!isOwnMessage && showSenderInfo && message.sender?.name && (
                    <span className="text-xs font-medium mb-1 text-muted-foreground px-1">
                        {message.sender.name}
                    </span>
                )}

                {/* Reply indicator */}
                {message.parentMessageId && (
                    <div className={cn(
                        "text-xs text-muted-foreground mb-1 px-3 py-1 rounded-md bg-muted/50 border-l-2",
                        isOwnMessage ? "border-l-primary/50" : "border-l-blue-500/50"
                    )}>
                        <div className="flex items-center gap-1">
                            <Reply className="h-3 w-3" />
                            <span>Replying to message</span>
                        </div>
                    </div>
                )}

                {/* Message bubble */}
                <div
                    className={cn(
                        "relative px-3 py-2 rounded-2xl shadow-sm transition-all",
                        isOwnMessage
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-background border rounded-bl-md",
                        message.status === MessageStatus.FAILED && "border-destructive/50",
                        message.isOptimistic && "opacity-70"
                    )}
                >
                    {renderMessageContent()}

                    {/* Message footer with time and status */}
                    <div className={cn(
                        "flex items-center gap-1 mt-1 text-xs",
                        isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                        <span>{formatTimestamp(message.timestamp)}</span>
                        {getMessageStatusIcon()}
                    </div>

                    {/* Optimistic message indicator */}
                    {message.isOptimistic && (
                        <div className="absolute -bottom-1 -right-1">
                            <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />
                        </div>
                    )}
                </div>

                {/* Read receipts for group chats */}
                {isOwnMessage && message.status === MessageStatus.READ && message.readBy && (
                    <div className="text-xs text-muted-foreground mt-1 px-1">
                        Read by {message.readBy.length} recipient{message.readBy.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </div>
    );
};