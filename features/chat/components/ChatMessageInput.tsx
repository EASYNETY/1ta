// features/chat/components/ChatMessageInput.tsx - Enhanced with real-time features

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Send, 
    Paperclip, 
    Smile, 
    Mic, 
    Image as ImageIcon, 
    FileText, 
    X,
    Camera,
    Video
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
    selectSelectedRoomId, 
    selectMessageDraftForRoom,
    selectIsUserTypingInRoom,
    updateMessageDraft,
    clearMessageDraft,
    setCurrentUserTyping,
    addOptimisticMessage
} from "../store/chatSlice";
import { useSocket } from "../services/socketService";
import { sendChatMessage } from "../store/chat-thunks";
import { MessageType, MessageStatus } from "../types/chat-types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
// import EmojiPicker from '@emoji-mart/react';
// import data from '@emoji-mart/data';

interface ChatMessageInputProps {
    replyToMessage?: any;
    onCancelReply?: () => void;
}

export const ChatMessageInput: React.FC<ChatMessageInputProps> = ({
    replyToMessage,
    onCancelReply
}) => {
    const dispatch = useAppDispatch();
    const selectedRoomId = useAppSelector(selectSelectedRoomId);
    const currentUser = useAppSelector((state) => state.auth.user);
    const draft = useAppSelector(state => 
        selectedRoomId ? selectMessageDraftForRoom(state, selectedRoomId) : ""
    );
    const isUserTyping = useAppSelector(state =>
        selectedRoomId ? selectIsUserTypingInRoom(state, selectedRoomId) : false
    );

    const [message, setMessage] = useState(draft);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const handleSendMessage = async () => {
        if ((!message.trim() && attachmentFiles.length === 0) || !selectedRoomId || !currentUser) {
            return;
        }

        // Stop typing indicator
        handleTypingStop();

        try {
            // Handle text message
            if (message.trim()) {
                const tempId = `temp_${Date.now()}_${Math.random()}`;
                const optimisticMessage = {
                    id: tempId,
                    tempId,
                    roomId: selectedRoomId,
                    content: message.trim(),
                    senderId: currentUser.id,
                    senderName: currentUser.name || currentUser.email,
                    type: MessageType.TEXT,
                    timestamp: new Date().toISOString(),
                    status: MessageStatus.SENDING,
                    isOptimistic: true,
                    // parentMessageId: replyToMessage?.id || undefined, // Only if type allows
                    sender: {
                        id: currentUser.id,
                        name: currentUser.name || currentUser.email || 'Unknown',
                        avatarUrl: currentUser.avatarUrl // Remove null, allow undefined only
                    }
                };

                // Add optimistic message immediately
                dispatch(addOptimisticMessage(optimisticMessage));

                // Send via API
                dispatch(sendChatMessage({
                    roomId: selectedRoomId,
                    content: message.trim(),
                    type: MessageType.TEXT,
                    tempId
                }));
            }

            // Handle file attachments
            if (attachmentFiles.length > 0) {
                setIsUploading(true);
                // Handle file attachments
                if (attachmentFiles.length > 0) {
                    setIsUploading(true);
                    for (const file of attachmentFiles) {
                        const tempId = `temp_${Date.now()}_${Math.random()}`;
                        try {
                            // Determine message type based on file
                            let messageType = MessageType.FILE;
                            if (file.type.startsWith('image/')) {
                                messageType = MessageType.IMAGE;
                            } else if (file.type.startsWith('video/')) {
                                messageType = MessageType.VIDEO;
                            } else if (file.type.startsWith('audio/')) {
                                messageType = MessageType.AUDIO;
                            }

                            // Create optimistic message for file
                            const fileMessage = {
                                id: tempId,
                                tempId,
                                roomId: selectedRoomId,
                                content: file.name,
                                senderId: currentUser.id,
                                senderName: currentUser.name || currentUser.email,
                                type: messageType,
                                timestamp: new Date().toISOString(),
                                status: MessageStatus.SENDING,
                                isOptimistic: true,
                                metadata: {
                                    fileName: file.name,
                                    fileSize: file.size,
                                    fileType: file.type,
                                    fileUrl: URL.createObjectURL(file) // Temporary local URL
                                },
                                sender: {
                                    id: currentUser.id,
                                    name: currentUser.name || currentUser.email || 'Unknown',
                                    avatarUrl: currentUser.avatarUrl !== null ? currentUser.avatarUrl : undefined
                                }
                            };

                            dispatch(addOptimisticMessage(fileMessage));

                            // Upload file and send message
                            await uploadFile(file, selectedRoomId);

                            dispatch(sendChatMessage({
                                roomId: selectedRoomId,
                                content: file.name,
                                type: messageType
                            }));
                        } catch (error) {
                            console.error('Failed to upload file:', error);
                            toast.error(`Failed to upload ${file.name}`);
                        }
                    }
                    setIsUploading(false);
                }
            setMessage("");
            setAttachmentFiles([]);
            dispatch(clearMessageDraft(selectedRoomId));
            onCancelReply?.();

        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
            setIsUploading(false);
        }
    };
                
                for (const file of attachmentFiles) {
                    const tempId = `temp_${Date.now()}_${Math.random()}`;
                    
                    try {
                        // Determine message type based on file
                        let messageType = MessageType.FILE;
                        if (file.type.startsWith('image/')) {
                            messageType = MessageType.IMAGE;
                        } else if (file.type.startsWith('video/')) {
                            messageType = MessageType.VIDEO;
                        } else if (file.type.startsWith('audio/')) {
                            messageType = MessageType.AUDIO;
                        }

                        // Create optimistic message for file
                        const fileMessage = {
                            id: tempId,
                            tempId,
                            roomId: selectedRoomId,
                            content: file.name,
                            senderId: currentUser.id,
                            senderName: currentUser.name || currentUser.email,
                            type: messageType,
                            timestamp: new Date().toISOString(),
                            status: MessageStatus.SENDING,
                            isOptimistic: true,
                            metadata: {
                                fileName: file.name,
                                fileSize: file.size,
                                fileType: file.type,
                                fileUrl: URL.createObjectURL(file) // Temporary local URL
                            },
                            sender: {
                                id: currentUser.id,
                                name: currentUser.name || currentUser.email || 'Unknown',
                                avatarUrl: currentUser.avatarUrl
                            }
                        };

                        dispatch(addOptimisticMessage(fileMessage));

                        // Upload file and send message
                        const uploadedFile = await uploadFile(file, selectedRoomId);
                        
                        dispatch(sendChatMessage({
                            roomId: selectedRoomId,
                            content: file.name,
                            type: messageType,
                            metadata: uploadedFile.metadata,
                            tempId
                        }));
                        
                    } catch (error) {
                        console.error('Failed to upload file:', error);
                        toast.error(`Failed to upload ${file.name}`);
                    }
                }
                
                setIsUploading(false);
            }

            // Clear input and draft
            setMessage("");
            setAttachmentFiles([]);
            dispatch(clearMessageDraft(selectedRoomId));
            onCancelReply?.();

        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
            setIsUploading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        } else if (e.key === 'Escape' && replyToMessage) {
            onCancelReply?.();
        }
    };

    // File handling
    const handleFileSelect = (files: FileList | null, type?: 'image' | 'video' | 'file') => {
        if (!files) return;

        const newFiles = Array.from(files).filter(file => {
            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`File ${file.name} is too large (max 10MB)`);
                return false;
            }
            return true;
        });

        setAttachmentFiles(prev => [...prev, ...newFiles]);
    };

    const removeAttachment = (index: number) => {
        setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Voice recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks: BlobPart[] = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioFile = new File([audioBlob], `voice_${Date.now()}.wav`, { type: 'audio/wav' });
                setAttachmentFiles(prev => [...prev, audioFile]);
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
            setRecordingDuration(0);

            // Start timer
            recordingTimerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Failed to start recording:', error);
            toast.error('Failed to start voice recording');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }
        }
    };

    const formatRecordingTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEmojiSelect = (emoji: any) => {
        const newMessage = message + emoji.native;
        setMessage(newMessage);
        setEmojiPickerOpen(false);
        
        // Trigger typing if not already typing
        if (newMessage.trim()) {
            handleTypingStart();
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            handleTypingStop();
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [handleTypingStop]);

    if (!selectedRoomId) {
        return null;
    }

    const canSend = (message.trim() || attachmentFiles.length > 0) && !isUploading && isConnected;

    return (
        <div className="border-t bg-background/95 backdrop-blur-sm">
            {/* Reply Preview */}
            {replyToMessage && (
                <div className="px-4 py-2 border-b bg-muted/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="h-0.5 w-1 bg-primary rounded-full" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Replying to {replyToMessage.sender?.name || 'Unknown'}
                                </p>
                                <p className="text-sm truncate">
                                    {replyToMessage.content}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={onCancelReply}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Attachment Previews */}
            {attachmentFiles.length > 0 && (
                <div className="px-4 py-2 border-b bg-muted/30">
                    <div className="flex flex-wrap gap-2">
                        {attachmentFiles.map((file, index) => (
                            <div key={index} className="relative group">
                                <div className="flex items-center gap-2 bg-background border rounded-lg px-2 py-1 text-sm">
                                    {file.type.startsWith('image/') ? (
                                        <ImageIcon className="h-4 w-4 text-blue-500" />
                                    ) : file.type.startsWith('video/') ? (
                                        <Video className="h-4 w-4 text-green-500" />
                                    ) : file.type.startsWith('audio/') ? (
                                        <Mic className="h-4 w-4 text-orange-500" />
                                    ) : (
                                        <FileText className="h-4 w-4 text-gray-500" />
                                    )}
                                    <span className="truncate max-w-[100px]">{file.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeAttachment(index)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recording Indicator */}
            {isRecording && (
                <div className="px-4 py-2 border-b bg-red-50 dark:bg-red-900/10">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            Recording... {formatRecordingTime(recordingDuration)}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={stopRecording}
                            className="ml-auto text-red-600 hover:text-red-700"
                        >
                            Stop
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex items-end gap-2 p-4">
                {/* Attachment Button */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 flex-shrink-0"
                            disabled={isUploading || isRecording}
                        >
                            <Paperclip className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="top">
                        <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Photo
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => videoInputRef.current?.click()}>
                            <Video className="h-4 w-4 mr-2" />
                            Video
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                            <FileText className="h-4 w-4 mr-2" />
                            Document
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={isRecording ? stopRecording : startRecording}
                            className={isRecording ? "text-red-600" : ""}
                        >
                            <Mic className="h-4 w-4 mr-2" />
                            {isRecording ? "Stop Recording" : "Voice Message"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Hidden File Inputs */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files, 'file')}
                    accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                />
                <input
                    ref={imageInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files, 'image')}
                    accept="image/*"
                />
                <input
                    ref={videoInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files, 'video')}
                    accept="video/*"
                />

                {/* Message Input Container */}
                <div className="flex-1 relative">
                    <div className="flex items-end bg-muted/30 rounded-2xl border focus-within:border-primary/50 transition-colors">
                        <div className="flex-1 px-4 py-2">
                            <Input
                                ref={inputRef}
                                value={message}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyPress}
                                placeholder={
                                    isRecording 
                                        ? "Recording voice message..." 
                                        : isUploading 
                                        ? "Uploading files..."
                                        : "Type a message..."
                                }
                                disabled={isRecording || isUploading}
                                className="border-0 bg-transparent shadow-none focus-visible:ring-0 resize-none min-h-[20px] max-h-[120px] overflow-y-auto"
                                style={{ height: 'auto' }}
                            />
                        </div>

                        {/* Emoji Picker */}
                        <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 mx-1 flex-shrink-0"
                                    disabled={isRecording}
                                >
                                    <Smile className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent 
                                side="top" 
                                align="end" 
                                className="w-auto p-0 border-0"
                                sideOffset={10}
                            >
                                <EmojiPicker 
                                    data={data} 
                                    onEmojiSelect={handleEmojiSelect}
                                    theme="light" // You can make this dynamic based on your theme
                                    set="native"
                                    previewPosition="none"
                                    skinTonePosition="none"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Send Button */}
                <Button
                    onClick={handleSendMessage}
                    disabled={!canSend || isRecording}
                    size="icon"
                    className={cn(
                        "h-10 w-10 rounded-full flex-shrink-0 transition-all",
                        canSend 
                            ? "bg-primary hover:bg-primary/90 scale-100" 
                            : "bg-muted-foreground/20 scale-95"
                    )}
                >
                    {isUploading ? (
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Connection Status Indicator */}
            {!isConnected && (
                <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/10 border-t">
                    <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                        <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                        <span>Connecting to chat server...</span>
                    </div>
                </div>
            )}
        </div>
    );
};