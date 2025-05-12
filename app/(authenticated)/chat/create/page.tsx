// app/(authenticate)/chat/create/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createChatRoom } from "@/features/chat/store/chat-thunks";
import { ChatRoomType, type ChatParticipant } from "@/features/chat/types/chat-types";
import { toast } from "sonner";
import { clearCreateRoomStatus, selectCreateRoomError, selectCreateRoomStatus } from "@/features/chat/store/chatSlice";
import { useRouter } from "next/navigation"; // For navigation
import { users as mockAuthUsers } from "@/data/mock-auth-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/auth/page-header";

const createChatRoomSchema = z.object({
    name: z.string().min(3, "Room name must be at least 3 characters").max(50),
    description: z.string().max(200).optional(),
    type: z.nativeEnum(ChatRoomType),
    contextId: z.string().min(1, "Context ID is required (e.g., course ID, 'general')"),
    participantIds: z.array(z.string()).min(1, "Select at least one participant (can be just yourself for some types like announcements if you're an admin).")
        .refine(value => value.length > 0, { message: "At least one participant is required." }),
});

type CreateChatRoomFormValues = z.infer<typeof createChatRoomSchema>;

export default function CreateChatRoomPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const currentUser = useAppSelector((state) => state.auth.user);
    const createStatus = useAppSelector(selectCreateRoomStatus);
    const createError = useAppSelector(selectCreateRoomError);

    const [availableUsers, setAvailableUsers] = useState<ChatParticipant[]>([]);
    useEffect(() => {
        const chatParticipants = mockAuthUsers.map(u => ({
            id: u.id,
            name: u.name,
            avatarUrl: u.avatarUrl || "",
            role: u.role,
        }));
        setAvailableUsers(chatParticipants); // Show all users, including self for selection
    }, []);


    const {
        control,
        handleSubmit,
        register,
        reset,
        formState: { errors, isSubmitting }, // Use isSubmitting from RHF
    } = useForm<CreateChatRoomFormValues>({
        resolver: zodResolver(createChatRoomSchema),
        defaultValues: {
            name: "",
            description: "",
            type: ChatRoomType.CLASS,
            contextId: "",
            participantIds: [],
        },
    });

    useEffect(() => {
        // Clear status on component mount/unmount or when navigating away
        return () => {
            dispatch(clearCreateRoomStatus());
        };
    }, [dispatch]);

    useEffect(() => {
        if (createStatus === "succeeded") {
            toast.success("Chat room created successfully!");
            reset();
            dispatch(clearCreateRoomStatus());
            router.push("/chat"); // Navigate to the main chat page or the new room
        } else if (createStatus === "failed" && createError) {
            toast.error(`Failed to create room: ${createError}`);
            // Don't clear status immediately here, let user see error and retry.
            // Or you could clear it after a timeout if you prefer.
        }
    }, [createStatus, createError, reset, dispatch, router]);


    const onSubmit = (data: CreateChatRoomFormValues) => {
        if (!currentUser?.id) {
            toast.error("User not authenticated.");
            return;
        }
        // Ensure the creator is part of participants if not an admin creating an announcement
        let finalParticipantIds = [...data.participantIds];
        if (!finalParticipantIds.includes(currentUser.id) &&
            !(currentUser.role === 'admin' && data.type === ChatRoomType.ANNOUNCEMENT)) {
            finalParticipantIds.push(currentUser.id);
        }


        const payload = {
            ...data,
            participantIds: finalParticipantIds,
            createdBy: currentUser.id,
        };
        dispatch(createChatRoom(payload));
    };

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'teacher')) {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Permission Denied</CardTitle>
                        <CardDescription>You do not have permission to create chat rooms.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href="/chat">Back to Chat</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }


    return (
        <div className="mx-auto">
            {/* Header */}
            <PageHeader
                heading="Create New Chat Room"
                subheading="Fill in the details to start a new conversation space."
            />

            <Card>
                <CardHeader>
                    <CardTitle>Room Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <Label htmlFor="name" className="font-semibold">Room Name</Label>
                            <Input id="name" {...register("name")} placeholder="e.g., Q4 Project Planning" className="mt-1" />
                            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="description" className="font-semibold">Description (Optional)</Label>
                            <Textarea id="description" {...register("description")} placeholder="Purpose of this chat room" className="mt-1" />
                            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="type" className="font-semibold">Room Type</Label>
                                <Controller
                                    name="type"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={ChatRoomType.COURSE}>Course</SelectItem>
                                                <SelectItem value={ChatRoomType.CLASS}>Class</SelectItem>
                                                <SelectItem value={ChatRoomType.EVENT}>Event</SelectItem>
                                                <SelectItem value={ChatRoomType.ANNOUNCEMENT}>Announcement</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.type && <p className="text-xs text-destructive mt-1">{errors.type.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="contextId" className="font-semibold">Context ID</Label>
                                <Input id="contextId" {...register("contextId")} placeholder="course_id, class_id, event_id, general" className="mt-1" />
                                {errors.contextId && <p className="text-xs text-destructive mt-1">{errors.contextId.message}</p>}
                            </div>
                        </div>

                        <div>
                            <Label className="font-semibold">Participants</Label>
                            <p className="text-sm text-muted-foreground mb-2">Select users to add to this chat room.</p>
                            <ScrollArea className="h-[200px] w-full rounded-md border p-3 mt-1">
                                <div className="space-y-3">
                                    {availableUsers.map((user) => (
                                        <Controller
                                            key={user.id}
                                            name="participantIds"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-center space-x-3 p-1 hover:bg-muted/50 rounded-sm">
                                                    <Checkbox
                                                        id={`user-${user.id}`}
                                                        checked={field.value?.includes(user.id)}
                                                        onCheckedChange={(checked) => {
                                                            const currentValues = field.value || [];
                                                            const newValues = checked
                                                                ? [...currentValues, user.id]
                                                                : currentValues.filter(
                                                                    (value) => value !== user.id
                                                                );
                                                            field.onChange(newValues);
                                                        }}
                                                    />
                                                    <Label htmlFor={`user-${user.id}`} className="font-normal text-sm cursor-pointer flex-1">
                                                        {user.name} <span className="text-xs text-muted-foreground">({user.role})</span>
                                                    </Label>
                                                </div>
                                            )}
                                        />
                                    ))}
                                    {availableUsers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No users available for selection.</p>}
                                </div>
                            </ScrollArea>
                            {errors.participantIds && <p className="text-xs text-destructive mt-1">{errors.participantIds.message}</p>}
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSubmitting || createStatus === "loading"} size="lg">
                                {isSubmitting || createStatus === "loading" ? "Creating Room..." : "Create Chat Room"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}