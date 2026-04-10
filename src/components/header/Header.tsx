"use client"
import React, { useState } from "react";
import { Shield, Lock } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

function Header() {
  const session = useSession();
  const email = session?.data?.user?.email;
  const token = session?.data?.user?.accessToken;
  const [openAccessModal, setOpenAccessModal] = useState(false);
  const [openLogoutConfirm, setOpenLogoutConfirm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const chagepasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to change password");
      }

      return json;
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
      setOldPassword("");
      setNewPassword("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to logout");
      }
      return json;
    },
    onSuccess: async () => {
      setOpenLogoutConfirm(false);
      setOpenAccessModal(false);
      await signOut({ callbackUrl: "/signin" });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleChangePassword = () => {
    if (!oldPassword.trim() || !newPassword.trim()) {
      toast.error("Please enter current and new password");
      return;
    }
    chagepasswordMutation.mutate();
  };

  return (
    <>
      <header className="w-full" style={{ background: "linear-gradient(90deg, #DB2626 0%, #B91C1C 100%)" }}>
        <div className="h-[159px] flex items-center justify-between container mx-auto">
        {/* Left Section */}
          <div className="flex items-center gap-4">
          {/* Shield Icon */}
            <div className="flex items-center justify-center">
              <Shield className="w-12 h-12 text-white/80 stroke-[1.5]" />
            </div>

          {/* Title & Subtitle */}
            <div className="flex flex-col">
              <h1 className="text-white font-bold text-[32px] leading-[100%]">
                Superadmin Control Center
              </h1>
              <div className="mt-6">
                <p className="text-white text-base mt-0.5 font-normal leading-[100%]">
                  Platform Owner Dashboard · Full System Authority
                </p>
                <p className="text-white text-base mt-3 font-normal leading-[100%]">
                  Access : {email}
                </p>
              </div>
            </div>
          </div>

        {/* Right Section */}
          <button
            onClick={() => setOpenAccessModal(true)}
            className="flex items-center gap-2 rounded-md px-4 py-2 bg-[#FFFFFF1A] hover:bg-white/20 transition-colors"
          >
            <Lock className="w-4 h-4 text-white/80" />
            <span className="text-white text-sm font-medium">
              Superadmin (erian264)
            </span>
          </button>
        </div>
      </header>

      {openAccessModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenAccessModal(false);
          }}
        >
          <div className="bg-white w-full max-w-[560px] rounded-xl shadow-2xl p-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <p className="text-lg font-semibold text-gray-900">Superadmin Access Accounts</p>
              <button
                onClick={() => setOpenAccessModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium text-gray-700 mb-3">My password</p>
              <div className="space-y-3">
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm focus:outline-none focus:border-red-400"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password(min8chars)"
                  className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm focus:outline-none focus:border-red-400"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={chagepasswordMutation.isPending}
                className="mt-4 bg-[#EF6B6B] hover:bg-[#e45757] text-white rounded-md h-10 px-4 text-sm font-medium transition-colors disabled:opacity-60"
              >
                {chagepasswordMutation.isPending ? "Changing..." : "Change password"}
              </button>

              <p className="text-xs text-gray-500 mt-3">
                You&apos;ll stay signed in, but the new password will be required next time.
              </p>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <button
                  onClick={() => setOpenLogoutConfirm(true)}
                  className="w-full h-11 border border-gray-200 rounded-md text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  Sign out of Superadmin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {openLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-5">
            <h3 className="text-base font-semibold text-gray-900">Confirm Sign out</h3>
            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to sign out?
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setOpenLogoutConfirm(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-60"
              >
                {logoutMutation.isPending ? "Signing out..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
