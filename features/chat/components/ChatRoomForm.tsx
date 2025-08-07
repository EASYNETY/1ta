"use client";

import React, { useState, useEffect } from "react";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { Input } from "@/components/ui/input";
import { ChatRoomType } from "../types/chat-types";
import { X, UserPlus, UserMinus } from "lucide-react";
import { UserAutocomplete } from "./UserAutocomplete";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatRoomFormProps {
  initialRoom?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  users: { id: string; name: string; email?: string; role?: string }[];
  isLoading?: boolean;
}

export const ChatRoomForm: React.FC<ChatRoomFormProps> = ({ 
  initialRoom, 
  onSubmit, 
  onCancel, 
  users,
  isLoading = false 
}) => {
  function extractParticipantObjs(participants: any): { id: string; name: string; email?: string; role?: string }[] {
    if (!participants) return [];
    if (Array.isArray(participants)) {
      if (typeof participants[0] === "object" && participants[0] !== null) {
        return participants.map((p: any) => ({ 
          id: p.id, 
          name: p.name || p.id,
          email: p.email,
          role: p.role 
        }));
      }
      // If only IDs, map to user objects
      return participants.map((id: string) => {
        const user = users.find(u => u.id === id);
        return user || { id, name: id };
      });
    }
    return [];
  }

  const [name, setName] = useState(initialRoom?.name || "");
  const [type, setType] = useState<ChatRoomType>(initialRoom?.type || ChatRoomType.COURSE);
  const [selectedUsers, setSelectedUsers] = useState<{ id: string; name: string; email?: string; role?: string }[]>(
    extractParticipantObjs(initialRoom?.participants)
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (initialRoom) {
      setName(initialRoom.name || "");
      setType(initialRoom.type || ChatRoomType.COURSE);
      setSelectedUsers(extractParticipantObjs(initialRoom.participants));
    }
  }, [initialRoom, users]);

  // Filter available users (exclude already selected ones)
  const availableUsers = users.filter(user => 
    !selectedUsers.some(selected => selected.id === user.id) &&
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = (user: { id: string; name: string; email?: string; role?: string }) => {
    if (!selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
      setSearchQuery(""); // Clear search after adding
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Room name is required");
      return;
    }
    onSubmit({ 
      name: name.trim(), 
      type, 
      participantIds: selectedUsers.map(u => u.id) 
    });
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'teacher':
      case 'instructor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'admin':
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'student':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {initialRoom ? "Update Chat Room" : "Create Chat Room"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Room Name</label>
            <Input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Enter room name"
              required 
              disabled={isLoading}
            />
          </div>

          {/* Room Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Room Type</label>
            <select
              className="w-full border rounded-md px-3 py-2 bg-background"
              value={type}
              onChange={e => setType(e.target.value as ChatRoomType)}
              disabled={isLoading}
            >
              <option value={ChatRoomType.COURSE}>Course</option>
              <option value={ChatRoomType.CLASS}>Class</option>
              <option value={ChatRoomType.EVENT}>Event</option>
              <option value={ChatRoomType.ANNOUNCEMENT}>Announcement</option>
            </select>
          </div>

          <Separator />

          {/* Participants Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Participants</label>
              <Badge variant="outline" className="text-xs">
                {selectedUsers.length} participant{selectedUsers.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Current Participants */}
            {selectedUsers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Current Participants</h4>
                <ScrollArea className="max-h-48 border rounded-md p-2">
                  <div className="space-y-2">
                    {selectedUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            {user.email && (
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            )}
                          </div>
                          {user.role && (
                            <Badge variant="outline" className={`text-xs ${getRoleColor(user.role)}`}>
                              {user.role}
                            </Badge>
                          )}
                        </div>
                        <DyraneButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveUser(user.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
                          disabled={isLoading}
                        >
                          <UserMinus className="h-4 w-4" />
                        </DyraneButton>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Add New Participants */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add Participants
              </h4>
              <Input
                placeholder="Search users by name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
              
              {/* Available Users */}
              {searchQuery && availableUsers.length > 0 && (
                <div className="border rounded-md bg-background max-h-40 overflow-y-auto">
                  {availableUsers.slice(0, 10).map(user => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleAddUser(user)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          {user.email && (
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          )}
                        </div>
                        {user.role && (
                          <Badge variant="outline" className={`text-xs ${getRoleColor(user.role)}`}>
                            {user.role}
                          </Badge>
                        )}
                      </div>
                      <DyraneButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={isLoading}
                      >
                        <UserPlus className="h-4 w-4" />
                      </DyraneButton>
                    </div>
                  ))}
                  {availableUsers.length > 10 && (
                    <div className="p-2 text-xs text-muted-foreground text-center border-t">
                      ... and {availableUsers.length - 10} more users
                    </div>
                  )}
                </div>
              )}

              {searchQuery && availableUsers.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4 border rounded-md bg-muted/20">
                  No users found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <DyraneButton 
              type="submit" 
              className="flex-1"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? "Saving..." : (initialRoom ? "Update Room" : "Create Room")}
            </DyraneButton>
            <DyraneButton 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </DyraneButton>
          </div>
        </form>
      </div>
    </div>
  );
};