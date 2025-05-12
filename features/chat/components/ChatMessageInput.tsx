// features/chat/components/ChatMessageInput.tsx

"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { SendHorizontal, Loader2, Paperclip, ImageIcon, X } from "lucide-react"
import { selectSelectedRoomId, selectSendMessageStatus } from "../store/chatSlice"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MessageType } from "../types/chat-types"
import { sendChatMessage } from "../store/chat-thunks"

export const ChatMessageInput: React.FC = () => {
    const dispatch = useAppDispatch()
    const [messageContent, setMessageContent] = useState("")
    const [isAttaching, setIsAttaching] = useState(false)
    const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null)
    const [attachmentType, setAttachmentType] = useState<MessageType>(MessageType.TEXT)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const selectedRoomId = useAppSelector(selectSelectedRoomId)
    const currentUser = useAppSelector((state) => state.auth.user)
    const sendStatus = useAppSelector(selectSendMessageStatus)
    const isLoading = sendStatus === "loading"

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault()

        const trimmedContent = messageContent.trim()
        if (!trimmedContent || !selectedRoomId || !currentUser?.id || isLoading) return

        dispatch(
            sendChatMessage({
                roomId: selectedRoomId,
                senderId: currentUser.id,
                content: trimmedContent,
            }),
        )

        setMessageContent("")
        setAttachmentPreview(null)
        setAttachmentType(MessageType.TEXT)
        setIsAttaching(false)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Send on Enter, new line on Shift+Enter
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            handleSendMessage()
        }
    }

    const handleAttachmentClick = (type: MessageType) => {
        setAttachmentType(type)
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Create a preview URL
        const previewUrl = URL.createObjectURL(file)
        setAttachmentPreview(previewUrl)
        setIsAttaching(true)

        // In a real app, you would upload the file to a server here
        // and then send a message with the file URL
    }

    const clearAttachment = () => {
        if (attachmentPreview) {
            URL.revokeObjectURL(attachmentPreview)
        }
        setAttachmentPreview(null)
        setIsAttaching(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    return (
        <div className="border-t p-4 bg-background">
            {/* Attachment Preview */}
            {isAttaching && attachmentPreview && (
                <div className="mb-2 relative inline-block">
                    {attachmentType === MessageType.IMAGE ? (
                        <img
                            src={attachmentPreview || "/placeholder.svg"}
                            alt="Attachment preview"
                            className="h-20 rounded-md object-cover border"
                        />
                    ) : (
                        <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                            <Paperclip className="h-4 w-4" />
                            <span className="text-sm">File attached</span>
                        </div>
                    )}
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                        onClick={clearAttachment}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}

            <div className="flex items-center gap-2">
                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept={attachmentType === MessageType.IMAGE ? "image/*" : "*"}
                />

                {/* Attachment buttons */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full"
                                onClick={() => handleAttachmentClick(MessageType.FILE)}
                                disabled={!selectedRoomId || isLoading}
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Attach file</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full"
                                onClick={() => handleAttachmentClick(MessageType.IMAGE)}
                                disabled={!selectedRoomId || isLoading}
                            >
                                <ImageIcon className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Attach image</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Message input */}
                <Textarea
                    placeholder="Type your message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    className="flex-1 resize-none min-h-[40px] max-h-[120px] rounded-full px-4 py-2 border-input bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring"
                    disabled={!selectedRoomId || isLoading}
                />

                {/* Send button */}
                <Button
                    type="button"
                    onClick={handleSendMessage}
                    size="icon"
                    className="rounded-full h-9 w-9 flex-shrink-0"
                    disabled={!selectedRoomId || (!messageContent.trim() && !isAttaching) || isLoading}
                    aria-label="Send message"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}
