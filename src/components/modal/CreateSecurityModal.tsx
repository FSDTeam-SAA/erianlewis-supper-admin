"use client";

import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface UserOption {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CreateSecurityModal({ isOpen, onClose, onConfirm }: Props) {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;

  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [flagType, setFlagType] = useState("suspicious_activity");
  const [severity, setSeverity] = useState("medium");
  const [description, setDescription] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Fetch All Users initially + Search Users
  const { data: userOptions = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ["security-flag-users", token, searchTerm],
    enabled: isOpen && sessionStatus === "authenticated" && !!token,
    queryFn: async () => {
      const url = searchTerm.trim()
        ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/security-flags/search-users?search=${encodeURIComponent(searchTerm.trim())}`
        : `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/security-flags/search-users`; // No search = all users

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch users");
      }

      return (json.data || []) as UserOption[];
    },
  });

  // Show results when search term exists or on initial load
  useEffect(() => {
    if (isOpen) {
      setShowResults(true);
    }
  }, [isOpen]);

  const addSecurityMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/security-flags`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            flagType,
            severity,
            description,
          }),
        },
      );

      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to create security flag");
      }

      return json.data;
    },
    onSuccess: () => {
      setUserId("");
      setSearchTerm("");
      setFlagType("suspicious_activity");
      setSeverity("medium");
      setDescription("");
      setShowResults(false);
      onConfirm();
    },
  });

  const handleUserSelect = (selectedUserId: string) => {
    setUserId(selectedUserId);
    setSearchTerm(""); // Clear search after selection
    setShowResults(false);
  };

  const handleSubmit = () => {
    if (!userId) return;
    addSecurityMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] mx-4 p-7">
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Create Security Flag
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Create a flag for a user by searching their email or name.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors mt-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Search Section */}
        <div className="mt-5 mb-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            User Email / Name
          </label>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (!userId) setShowResults(true); // Show results while typing
              }}
              className="pl-10 h-10 text-sm border-gray-200"
            />
          </div>

          {/* Results List */}
          {showResults && (
            <div className="mt-2 max-h-60 overflow-auto border border-gray-200 rounded-lg bg-white shadow-sm">
              {isUsersLoading ? (
                <div className="p-4 text-sm text-gray-500">
                  Loading users...
                </div>
              ) : userOptions.length > 0 ? (
                userOptions.map((user) => {
                  const fullName =
                    `${user.firstName || ""} ${user.lastName || ""}`.trim();
                  const label = `${fullName || "N/A"} - ${user.email || "N/A"}`;

                  return (
                    <div
                      key={user._id}
                      onClick={() => handleUserSelect(user._id)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 text-sm"
                    >
                      {label}
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-sm text-gray-500">No users found</div>
              )}
            </div>
          )}

          {/* Selected User */}
          {userId && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <div className="text-sm text-green-700">
                Selected:{" "}
                <span className="font-medium">
                  {userOptions.find((u) => u._id === userId)?.email || "User"}
                </span>
              </div>
              <button
                onClick={() => {
                  setUserId("");
                  setSearchTerm("");
                }}
                className="text-red-500 hover:text-red-600 text-xs font-medium"
              >
                Change
              </button>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-1">
            Initially all users are shown. Type to search.
          </p>
        </div>

        {/* Flag Type + Severity */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Flag Type
            </label>
            <Select value={flagType} onValueChange={setFlagType}>
              <SelectTrigger className="!h-10 w-full text-sm border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="suspicious_activity">
                  suspicious_activity
                </SelectItem>
                <SelectItem value="fraud">fraud</SelectItem>
                <SelectItem value="spam">spam</SelectItem>
                <SelectItem value="abuse">abuse</SelectItem>
                <SelectItem value="other">other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Severity
            </label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger className="!h-10 w-full text-sm border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description (optional)
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none text-sm min-h-[90px] border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 h-10 text-sm text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <button
            onClick={handleSubmit}
            disabled={!userId || addSecurityMutation.isPending}
            className="px-6 h-10 text-sm font-medium text-white bg-[#e53935] hover:bg-[#c62828] rounded-lg transition-colors disabled:opacity-70"
          >
            {addSecurityMutation.isPending ? "Creating..." : "Create Flag"}
          </button>
        </div>
      </div>
    </div>
  );
}
