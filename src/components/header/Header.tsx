/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
    const user = session?.user as any;
    const email = user?.email;
    console.log(session)

    

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex h-[80px] items-center justify-between px-6 bg-[#212121] shadow-md">
      <div className="flex items-center space-x-2"></div>

      <div className="relative flex items-center space-x-3">
        <div
          ref={avatarRef}
          className="flex items-center space-x-2 text-white text-sm cursor-pointer hover:bg-white/10 rounded-lg px-2 py-1 transition-colors"
          onClick={toggleDropdown}
        >
          <span>{email}</span>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback className="text-black">TA</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}