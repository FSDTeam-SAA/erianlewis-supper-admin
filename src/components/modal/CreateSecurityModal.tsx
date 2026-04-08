"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

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
  const [flagType, setFlagType] = useState("suspicious_activity");
  const [severity, setSeverity] = useState("medium");
  const [description, setDescription] = useState("");

  const { data: userOptions = [] } = useQuery({
    queryKey: ["security-flag-users", token],
    enabled: isOpen && sessionStatus === "authenticated" && !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/security-flags/search-users?search=a`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch users");
      }

      return (json.data || []) as UserOption[];
    },
  });

  const addSecurityMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/security-flags`, {
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
      });

      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to create security flag");
      }

      return json.data;
    },
    onSuccess: () => {
      setUserId("");
      setFlagType("suspicious_activity");
      setSeverity("medium");
      setDescription("");
      onConfirm();
    },
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!userId) return;
    addSecurityMutation.mutate();
  };

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

        {/* User Email / Name */}
        <div className="mt-5 mb-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            User Email / Name
          </label>
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger className="!h-10 w-full text-sm border-gray-200">
              <SelectValue placeholder="user@example.com" />
            </SelectTrigger>
            <SelectContent>
              {userOptions.map((user) => {
                const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
                const label = `${fullName || "N/A"} - ${user.email || "N/A"}`;
                return (
                  <SelectItem key={user._id} value={user._id}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-400 mt-1">
            We resolve this using the Accounts search endpoint.
          </p>
        </div>

        {/* Flag Type + Severity */}
        <div className="grid grid-cols-2 gap-4 mt-4">
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
            className="px-6 h-10 text-sm font-medium text-white bg-[#e53935] hover:bg-[#c62828] rounded-lg transition-colors"
          >
            Create Flag
          </button>
        </div>
      </div>
    </div>
  );
}
