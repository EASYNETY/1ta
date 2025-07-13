"use client";

import React, { useState, useEffect } from "react";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { Input } from "@/components/ui/input";
import { ChatRoomType } from "../types/chat-types";
import { X } from "lucide-react";
import { UserAutocomplete } from "./UserAutocomplete";

interface ChatRoomFormProps {
  initialRoom?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  users: { id: string; name: string }[];
}

export const ChatRoomForm: React.FC<ChatRoomFormProps> = ({ initialRoom, onSubmit, onCancel, users }) => {
  function extractParticipantObjs(participants: any): { id: string; name: string }[] {
    if (!participants) return [];
    if (Array.isArray(participants)) {
      if (typeof participants[0] === "object" && participants[0] !== null) {
        return participants.map((p: any) => ({ id: p.id, name: p.name || p.id }));
      }
      // If only IDs, map to user objects
      return participants.map((id: string) => users.find(u => u.id === id) || { id, name: id });
    }
    return [];
  }

  const [name, setName] = useState(initialRoom?.name || "");
  const [type, setType] = useState<ChatRoomType>(initialRoom?.type || ChatRoomType.COURSE);
  const [selectedUsers, setSelectedUsers] = useState<{ id: string; name: string }[]>(extractParticipantObjs(initialRoom?.participants));

  useEffect(() => {
    if (initialRoom) {
      setName(initialRoom.name || "");
      setType(initialRoom.type || ChatRoomType.COURSE);
      setSelectedUsers(extractParticipantObjs(initialRoom.participants));
    }
  }, [initialRoom, users]);

  const handleAddUser = (user: { id: string; name: string }) => {
    if (!selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };
  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, type, participantIds: selectedUsers.map(u => u.id) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-1">Room Name</label>
        <Input value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={type}
          onChange={e => setType(e.target.value as ChatRoomType)}
        >
          <option value={ChatRoomType.COURSE}>Course</option>
          <option value={ChatRoomType.CLASS}>Class</option>
          <option value={ChatRoomType.EVENT}>Event</option>
          <option value={ChatRoomType.ANNOUNCEMENT}>Announcement</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Participants</label>
        <UserAutocomplete
          users={users}
          selected={selectedUsers}
          onAdd={handleAddUser}
          onRemove={handleRemoveUser}
        />
      </div>
      <div className="flex gap-2 mt-4">
        <DyraneButton type="submit" className="w-full">{initialRoom ? "Update" : "Create"} Room</DyraneButton>
        <DyraneButton type="button" variant="secondary" onClick={onCancel} className="w-full">Cancel</DyraneButton>
      </div>
    </form>
  );
};
