// app/(authenticate)/chat/create/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox"; // Kept if you want a fallback or different UI sometimes
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/auth/page-header";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChevronsUpDown, Check, XCircle } from "lucide-react"; // Icons

// Navigation
import Link from "next/link";
import { useRouter } from "next/navigation";

// Redux
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createChatRoom } from "@/features/chat/store/chat-thunks";
import { ChatRoomType, type ChatParticipant, CreateRoomPayload } from "@/features/chat/types/chat-types";
import { clearCreateRoomStatus, selectCreateRoomError, selectCreateRoomStatus } from "@/features/chat/store/chatSlice";

// Context Item Thunks & Selectors
import { fetchCourses, selectAllCourses, selectCoursesStatus } from "@/features/courses/store/course-slice";
import { selectAllAdminClasses, selectClassesStatus } from "@/features/classes/store/classes-slice"; // Assuming fetchAllClassesAdmin fetches AdminClassView[]
import { fetchAllScheduleEvents, selectAllScheduleEvents, selectScheduleStatus } from "@/features/schedule/store/schedule-slice";

// User Fetching Thunk & Selectors (from authSlice or a dedicated user slice)
import {
    selectAllUsers,
    selectUsersLoading,
    selectUsersError,
    // clearUsersError // Optional action
} from "@/features/auth/store/auth-slice"; // Adjust path if thunk is elsewhere
import { fetchAllClassesAdmin } from "@/features/classes/store/classes-thunks";
import { fetchAllUsers } from "@/features/auth";

interface ContextItem {
    id: string;
    name: string;
    participantIds?: string[]; // For pre-selecting participants based on context
}

const createChatRoomSchema = z.object({
    name: z.string().min(3, "Room name must be at least 3 characters").max(50),
    description: z.string().max(200).optional(),
    type: z.nativeEnum(ChatRoomType),
    contextId: z.string().min(1, "Please select a context for the room type."),
    dynamicContextSelection: z.string().optional(), // Helper for the form
    participantIds: z.array(z.string()).min(1, "Select at least one participant.")
        .refine(value => value.length > 0, { message: "At least one participant is required." }),
});

type CreateChatRoomFormValues = z.infer<typeof createChatRoomSchema>;

export default function CreateChatRoomPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const currentUser = useAppSelector((state) => state.auth.user);
    const createRoomReqStatus = useAppSelector(selectCreateRoomStatus);
    const createRoomReqError = useAppSelector(selectCreateRoomError);

    // --- Form Setup ---
    const {
        control, handleSubmit, register, reset, watch, setValue, getValues,
        formState: { errors, isSubmitting: isFormSubmitting }, // Renamed to avoid conflict with Redux status
    } = useForm<CreateChatRoomFormValues>({
        resolver: zodResolver(createChatRoomSchema),
        defaultValues: {
            name: "", description: "", type: ChatRoomType.CLASS, contextId: "",
            dynamicContextSelection: "", participantIds: currentUser ? [currentUser.id] : [],
        },
    });

    // --- User Fetching (for participant selection) ---
    const usersInStore = useAppSelector(selectAllUsers);
    const usersFetchLoading = useAppSelector(selectUsersLoading);
    const usersFetchError = useAppSelector(selectUsersError);
    const [availableUsers, setAvailableUsers] = useState<ChatParticipant[]>([]);

    useEffect(() => {
        if (usersFetchLoading === false && usersInStore.length === 0 && !usersFetchError) {
            dispatch(fetchAllUsers({ limit: 1000 })); // Fetch a large list for selection
        }
    }, [dispatch, usersFetchLoading, usersInStore, usersFetchError]);

    useEffect(() => {
        if (usersInStore && usersInStore.length > 0) {
            // Filter out duplicates based on user.id before mapping
            const uniqueUsersById = Array.from(new Map(usersInStore.map(user => [user.id, user])).values());

            const chatParticipants: ChatParticipant[] = uniqueUsersById.map(u => ({
                id: u.id,
                name: u.name || 'Unnamed User',
                avatarUrl: u.avatarUrl || "",
                role: u.role,
            }));
            setAvailableUsers(chatParticipants);
        } else {
            setAvailableUsers([]);
        }
    }, [usersInStore])


    // --- Context Item Fetching (Courses, Classes, Events) ---
    const selectedRoomType = watch("type");
    const selectedDynamicContextId = watch("dynamicContextSelection");

    const allCoursesFromStore = useAppSelector(selectAllCourses);
    const coursesFetchStatus = useAppSelector(selectCoursesStatus);
    const allAdminClassesFromStore = useAppSelector(selectAllAdminClasses);
    const classesFetchStatus = useAppSelector(selectClassesStatus);
    const allScheduleEventsFromStore = useAppSelector(selectAllScheduleEvents);
    const scheduleEventsFetchStatus = useAppSelector(selectScheduleStatus);

    const [contextItems, setContextItems] = useState<ContextItem[]>([]);
    const [contextItemsLoading, setContextItemsLoading] = useState(false);

    useEffect(() => {
        if (coursesFetchStatus === 'idle') dispatch(fetchCourses());
        if (classesFetchStatus === 'idle') dispatch(fetchAllClassesAdmin({ limit: 500 })); // Fetch many for dropdown
        if (scheduleEventsFetchStatus === 'idle') dispatch(fetchAllScheduleEvents({ limit: 500 }));
    }, [dispatch, coursesFetchStatus, classesFetchStatus, scheduleEventsFetchStatus]);

    useEffect(() => {
        setValue("dynamicContextSelection", "", { shouldValidate: false });
        setValue("contextId", "", { shouldValidate: false });
        if (currentUser) setValue("participantIds", [currentUser.id], { shouldValidate: false });

        let items: ContextItem[] = [];
        let isLoading = false;

        switch (selectedRoomType) {
            case ChatRoomType.COURSE:
                isLoading = coursesFetchStatus === 'loading';
                if (coursesFetchStatus === 'succeeded') {
                    items = allCoursesFromStore.map(course => ({
                        id: course.id, name: course.title,
                        // participantIds: course.enroledUserIds // If your Course type has this
                    }));
                }
                break;
            case ChatRoomType.CLASS:
                isLoading = classesFetchStatus === 'loading';
                if (classesFetchStatus === 'succeeded') {
                    items = allAdminClassesFromStore.map(cls => ({
                        id: cls.id, name: cls.name as string,
                        // participantIds: cls.studentIds
                    }));
                }
                break;
            case ChatRoomType.EVENT:
                isLoading = scheduleEventsFetchStatus === 'loading';
                if (scheduleEventsFetchStatus === 'succeeded') {
                    items = allScheduleEventsFromStore.map(evt => ({
                        id: evt.id, name: evt.title,
                        // participantIds: evt.attendeeIds
                    }));
                }
                break;
            case ChatRoomType.ANNOUNCEMENT:
                items = [];
                setValue("contextId", "general_announcements", { shouldValidate: true });
                break;
            default: items = []; break;
        }
        setContextItems(items);
        setContextItemsLoading(isLoading);
    }, [
        selectedRoomType, setValue, currentUser,
        allCoursesFromStore, coursesFetchStatus,
        allAdminClassesFromStore, classesFetchStatus,
        allScheduleEventsFromStore, scheduleEventsFetchStatus
    ]);

    // Auto-select participants based on chosen context
    useEffect(() => {
        if (selectedDynamicContextId) {
            const selectedContextItem = contextItems.find(item => item.id === selectedDynamicContextId);
            const contextParticipantIds = selectedContextItem?.participantIds;
            if (contextParticipantIds && contextParticipantIds.length > 0) {
                const initialParticipants = currentUser ? [currentUser.id] : [];
                const newParticipantIds = Array.from(new Set([...initialParticipants, ...contextParticipantIds]));
                setValue("participantIds", newParticipantIds, { shouldValidate: true });
            } else if (currentUser) {
                setValue("participantIds", [currentUser.id], { shouldValidate: true });
            } else {
                setValue("participantIds", [], { shouldValidate: true });
            }
        } else if (selectedRoomType !== ChatRoomType.ANNOUNCEMENT) {
            setValue("participantIds", currentUser ? [currentUser.id] : [], { shouldValidate: true });
        }
    }, [selectedDynamicContextId, selectedRoomType, contextItems, setValue, currentUser]);


    // --- Form Submission & Status ---
    useEffect(() => { return () => { dispatch(clearCreateRoomStatus()); }; }, [dispatch]);

    useEffect(() => {
        if (createRoomReqStatus === "succeeded") {
            toast.success("Chat room created successfully!");
            reset({
                name: "", description: "", type: ChatRoomType.CLASS, contextId: "",
                dynamicContextSelection: "", participantIds: currentUser ? [currentUser.id] : [],
            });
            dispatch(clearCreateRoomStatus());
            router.push("/chat");
        } else if (createRoomReqStatus === "failed" && createRoomReqError) {
            toast.error(`Failed to create room: ${createRoomReqError}`);
        }
    }, [createRoomReqStatus, createRoomReqError, reset, dispatch, router, currentUser]);

    const onSubmitHandler = (data: CreateChatRoomFormValues) => {
        if (!currentUser?.id) { toast.error("User not authenticated."); return; }
        let finalContextId = data.contextId;
        if (data.type !== ChatRoomType.ANNOUNCEMENT && data.dynamicContextSelection) {
            finalContextId = data.dynamicContextSelection;
        } else if (data.type !== ChatRoomType.ANNOUNCEMENT && !data.dynamicContextSelection && contextItems.length > 0) {
            toast.error(`Please select a specific ${data.type} for the context.`);
            setValue("contextId", "", { shouldValidate: true }); return;
        }

        let finalParticipantIds = [...data.participantIds];
        if (currentUser && !finalParticipantIds.includes(currentUser.id) &&
            !((currentUser.role === 'admin' || currentUser.role === 'super_admin') && data.type === ChatRoomType.ANNOUNCEMENT)) {
            finalParticipantIds.push(currentUser.id);
        }
        finalParticipantIds = Array.from(new Set(finalParticipantIds));

        const { dynamicContextSelection, ...payloadToSubmit } = data;
        const finalPayload: CreateRoomPayload = {
            ...payloadToSubmit, contextId: finalContextId,
            participantIds: finalParticipantIds, createdBy: currentUser.id,
        };
        dispatch(createChatRoom(finalPayload));
    };


    // --- Participant Selection State & Logic (for Combobox) ---
    const [participantSearchOpen, setParticipantSearchOpen] = useState(false);
    const [participantSearchValue, setParticipantSearchValue] = useState("");
    const selectedParticipantIdsFromForm = watch("participantIds") || [];

    const filteredSelectableUsers = useMemo(() => {
        if (!participantSearchValue) return availableUsers;
        return availableUsers.filter(user =>
            user.name.toLowerCase().includes(participantSearchValue.toLowerCase())
        );
    }, [availableUsers, participantSearchValue]);

    const handleClearParticipants = () => {
        setValue("participantIds", currentUser ? [currentUser.id] : [], { shouldValidate: true });
        toast.info("Participant selections cleared (current user re-selected if applicable).");
    };

    // --- Bulk Add Options ---
    const bulkAddOptions = useMemo(() => {
        const options: { label: string; userIds: string[] }[] = [];
        if (!selectedRoomType || availableUsers.length === 0) return options;
        if (selectedDynamicContextId) {
            const selectedContextItem = contextItems.find(item => item.id === selectedDynamicContextId);
            if (selectedContextItem?.name && selectedContextItem?.participantIds?.length) {
                options.push({ label: `All in "${selectedContextItem.name}"`, userIds: selectedContextItem.participantIds });
            }
        }
        const allStudentIds = availableUsers.filter(u => u.role === 'student').map(u => u.id);
        if (allStudentIds.length > 0) options.push({ label: "All Students", userIds: allStudentIds });
        const allTeacherIds = availableUsers.filter(u => u.role === 'teacher').map(u => u.id);
        if (allTeacherIds.length > 0) options.push({ label: "All Facilitators", userIds: allTeacherIds });

        if (availableUsers.length > 0 && availableUsers.length !== selectedParticipantIdsFromForm.length) {
            options.push({ label: "All Visible Users", userIds: availableUsers.map(u => u.id) });
        }
        return options;
    }, [selectedRoomType, selectedDynamicContextId, contextItems, availableUsers, selectedParticipantIdsFromForm]);

    const handleBulkAddParticipants = (userIdsToAdd: string[]) => {
        const currentIds = getValues("participantIds") || [];
        const newParticipantIds = Array.from(new Set([...currentIds, ...userIdsToAdd]));
        setValue("participantIds", newParticipantIds, { shouldValidate: true });
        const addedCount = newParticipantIds.length - currentIds.length;
        toast.info(`${addedCount} new user(s) added from group.`);
    };


    // --- Permission Check ---
    if (!currentUser || !['admin', 'super_admin', 'teacher'].includes(currentUser.role)) {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardHeader><CardTitle>Permission Denied</CardTitle><CardDescription>You do not have permission to create chat rooms.</CardDescription></CardHeader>
                    <CardFooter><Button asChild className="w-full"><Link href="/chat">Back to Chat</Link></Button></CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto">
            <PageHeader heading="Create New Chat Room" subheading="Fill in the details to start a new conversation space." />
            <Card className="mt-6">
                <CardHeader><CardTitle>Room Details</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-8">
                        {/* Name */}
                        <div>
                            <Label htmlFor="name" className="font-semibold">Room Name</Label>
                            <Input id="name" {...register("name")} placeholder="e.g., Q4 Project Planning" className="mt-1" />
                            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                        </div>
                        {/* Description */}
                        <div>
                            <Label htmlFor="description" className="font-semibold">Description (Optional)</Label>
                            <Textarea id="description" {...register("description")} placeholder="Purpose of this chat room" className="mt-1" />
                            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
                        </div>

                        {/* Room Type and Dynamic Context Selection Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {/* Room Type Select */}
                            <div>
                                <Label htmlFor="type" className="font-semibold block mb-1">Room Type</Label>
                                <Controller name="type" control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={(value) => field.onChange(value as ChatRoomType)} defaultValue={field.value}>
                                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
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

                            {/* Dynamic Context Section */}
                            {(() => {
                                if (contextItemsLoading) {
                                    return (
                                        <div>
                                            <Label className="font-semibold block mb-1">Select Specific {selectedRoomType ? selectedRoomType.charAt(0).toUpperCase() + selectedRoomType.slice(1) : 'Context'}</Label>
                                            <Select disabled><SelectTrigger><SelectValue placeholder={`Loading ${selectedRoomType ? selectedRoomType + 's' : 'items'}...`} /></SelectTrigger></Select>
                                        </div>
                                    );
                                }
                                if (selectedRoomType === ChatRoomType.ANNOUNCEMENT) {
                                    return (
                                        <div>
                                            <Label className="font-semibold block mb-1">Context</Label>
                                            <Input value={getValues("contextId") || "General Announcements"} className="bg-muted cursor-default" readOnly />
                                            {errors.contextId && <p className="text-xs text-destructive mt-1">{errors.contextId.message}</p>}
                                        </div>
                                    );
                                }
                                if (selectedRoomType && contextItems.length > 0) {
                                    return (
                                        <div>
                                            <Label htmlFor="dynamicContextSelection" className="font-semibold block mb-1">Select Specific {selectedRoomType.charAt(0).toUpperCase() + selectedRoomType.slice(1)}</Label>
                                            <Controller name="dynamicContextSelection" control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        onValueChange={(value) => { field.onChange(value); setValue("contextId", value, { shouldValidate: true }); }}
                                                        value={field.value || ""}
                                                    >
                                                        <SelectTrigger><SelectValue placeholder={`Select specific ${selectedRoomType}...`} /></SelectTrigger>
                                                        <SelectContent>
                                                            {contextItems.map(item => (<SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.contextId && <p className="text-xs text-destructive mt-1">{errors.contextId.message}</p>}
                                        </div>
                                    );
                                }
                                if (selectedRoomType) {
                                    return (
                                        <div>
                                            <Label className="font-semibold block mb-1">Context</Label>
                                            <Input placeholder={`No ${selectedRoomType}s found or API error`} className="bg-muted cursor-default" readOnly />
                                            {errors.contextId && <p className="text-xs text-destructive mt-1">{errors.contextId.message}</p>}
                                        </div>
                                    );
                                }
                                return (
                                    <div>
                                        <Label className="font-semibold block mb-1">Context</Label>
                                        <Input placeholder="Select a room type first" className="bg-muted cursor-default" readOnly />
                                        {errors.contextId && <p className="text-xs text-destructive mt-1">{errors.contextId.message}</p>}
                                    </div>
                                );
                            })()}
                        </div>
                        <Separator />

                        {/* Participants Section */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <Label className="font-semibold">Participants</Label>
                                {selectedParticipantIdsFromForm.length > (currentUser && selectedParticipantIdsFromForm.includes(currentUser.id) ? 1 : 0) && (
                                    <Button type="button" variant="ghost" size="sm" onClick={handleClearParticipants} className="text-xs text-muted-foreground hover:text-destructive">
                                        <XCircle className="mr-1 h-3.5 w-3.5" /> Clear Selections
                                    </Button>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                                Select users for this chat room.
                                {selectedRoomType === ChatRoomType.ANNOUNCEMENT && (currentUser?.role === 'admin' || currentUser?.role === 'super_admin') &&
                                    " (Admins/Super Admins are implicitly included in announcements they create)."
                                }
                            </p>

                            {/* Bulk Add Buttons */}
                            {bulkAddOptions.length > 0 && !usersFetchLoading && (
                                <div className="mb-3">
                                    <Label className="text-xs font-medium text-muted-foreground">Quick Add:</Label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {bulkAddOptions.map(opt => (
                                            <Button key={opt.label} type="button" variant="outline" size="sm" onClick={() => handleBulkAddParticipants(opt.userIds)}>
                                                Add {opt.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {usersFetchLoading && <p className="text-sm text-muted-foreground my-2">Loading users for selection...</p>}
                            {usersFetchError && <p className="text-sm text-destructive my-2">Error loading users: {usersFetchError}</p>}

                            {/* Searchable Participant Combobox */}
                            {!usersFetchLoading && !usersFetchError && availableUsers.length > 0 && (
                                <Controller
                                    name="participantIds"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover open={participantSearchOpen} onOpenChange={setParticipantSearchOpen}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" role="combobox" aria-expanded={participantSearchOpen} className="w-full justify-between font-normal mt-1">
                                                    {field.value && field.value.length > 0 ? `${field.value.length} user(s) selected` : "Select participants..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                                <Command shouldFilter={false}>
                                                    <CommandInput placeholder="Search users..." value={participantSearchValue} onValueChange={setParticipantSearchValue} />
                                                    <CommandList>
                                                        <ScrollArea className="h-[200px]">
                                                            <CommandEmpty>No users found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {filteredSelectableUsers.map((user, index) => (
                                                                    <CommandItem
                                                                        key={`${user.id}-${index}`}
                                                                        value={user.name} // For Command's internal matching if shouldFilter was true
                                                                        onSelect={() => {
                                                                            const currentValues = field.value || [];
                                                                            const newValues = currentValues.includes(user.id)
                                                                                ? currentValues.filter(id => id !== user.id)
                                                                                : [...currentValues, user.id];
                                                                            field.onChange(newValues);
                                                                            // setParticipantSearchOpen(false); // Keep open for multi-select
                                                                            setParticipantSearchValue(""); // Clear search on select
                                                                        }}
                                                                        disabled={user.id === currentUser?.id && !((currentUser?.role === 'admin' || currentUser?.role === 'super_admin') && selectedRoomType === ChatRoomType.ANNOUNCEMENT)}
                                                                    >
                                                                        <Check className={`mr-2 h-4 w-4 ${field.value?.includes(user.id) ? "opacity-100" : "opacity-0"}`} />
                                                                        {user.name}
                                                                        <span className="ml-1 text-xs text-muted-foreground">({user.role.replace("_", " ")})</span>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </ScrollArea>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            )}
                            {/* Display selected users as badges */}
                            {selectedParticipantIdsFromForm.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {selectedParticipantIdsFromForm.map((id, index) => {
                                        const user = availableUsers.find(u => u.id === id);
                                        return user ? (
                                            <Badge key={`${id}-${index}`} variant="secondary" className="font-normal text-sm py-0.5 px-1.5">
                                                {user.name}
                                                <button type="button" onClick={() => {
                                                    const currentValues = getValues("participantIds") || [];
                                                    setValue("participantIds", currentValues.filter(pid => pid !== id), { shouldValidate: true });
                                                }} className="ml-1.5 text-muted-foreground hover:text-foreground focus:outline-none">
                                                    <XCircle className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ) : null;
                                    })}
                                </div>
                            )}
                            {errors.participantIds && <p className="text-xs text-destructive mt-1">{errors.participantIds.message}</p>}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6">
                            <Button type="submit" disabled={isFormSubmitting || createRoomReqStatus === "loading"} size="lg" className="min-w-[180px]">
                                {isFormSubmitting || createRoomReqStatus === "loading" ? "Creating Room..." : "Create Chat Room"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}