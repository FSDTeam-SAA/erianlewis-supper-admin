"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
// import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Types ─────────────────────────────────────────────────────────────────────
interface CreateFlagPayload {
  userEmail: string;
  flagType: string;
  severity: string;
  description: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: CreateFlagPayload) => void;
}

// ── Modal Component ───────────────────────────────────────────────────────────
export function CreateSecurityModal({ isOpen, onClose, onConfirm }: Props) {
  const [userEmail, setUserEmail] = useState("");
  const [flagType, setFlagType] = useState("suspicious_activity");
  const [severity, setSeverity] = useState("Medium");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onConfirm({ userEmail, flagType, severity, description });
    setUserEmail("");
    setFlagType("suspicious_activity");
    setSeverity("Medium");
    setDescription("");
  };

  return (
    /* Backdrop */
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
          <Select value={userEmail} onValueChange={setUserEmail}>
            <SelectTrigger className="!h-10 w-full text-sm border-gray-200">
              <SelectValue placeholder="user@example.com" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user@example.com">user@example.com</SelectItem>
              <SelectItem value="xyz@gmail.com">xyz@gmail.com</SelectItem>
              <SelectItem value="waqas00@gmail.com">waqas00@gmail.com</SelectItem>
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
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
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
            className="px-6 h-10 text-sm font-medium text-white bg-[#e53935] hover:bg-[#c62828] rounded-lg transition-colors"
          >
            Create Flag
          </button>
        </div>
      </div>
    </div>
  );
}