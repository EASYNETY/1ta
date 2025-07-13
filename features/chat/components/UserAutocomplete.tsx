import React, { useState } from "react";
import { Input } from "@/components/ui/input";

export interface UserAutocompleteProps {
  users: { id: string; name: string }[];
  selected: { id: string; name: string }[];
  onAdd: (user: { id: string; name: string }) => void;
  onRemove: (userId: string) => void;
}

export const UserAutocomplete: React.FC<UserAutocompleteProps> = ({ users, selected, onAdd, onRemove }) => {
  const [query, setQuery] = useState("");
  const filtered = users.filter(
    u => u.name.toLowerCase().includes(query.toLowerCase()) && !selected.some(s => s.id === u.id)
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map(user => (
          <span key={user.id} className="inline-flex items-center bg-muted px-2 py-1 rounded text-xs">
            {user.name}
            <button
              type="button"
              className="ml-1 text-destructive hover:text-red-600"
              onClick={() => onRemove(user.id)}
              aria-label={`Remove ${user.name}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <Input
        placeholder="Add participant by name"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && filtered.length > 0) {
            e.preventDefault();
            onAdd(filtered[0]);
            setQuery("");
          }
        }}
      />
      {query && filtered.length > 0 && (
        <div className="border rounded bg-white mt-1 max-h-32 overflow-y-auto z-10">
          {filtered.map(user => (
            <div
              key={user.id}
              className="px-2 py-1 cursor-pointer hover:bg-muted"
              onClick={() => {
                onAdd(user);
                setQuery("");
              }}
            >
              {user.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
