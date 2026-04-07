"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle,
  Mail,
  Phone,
  ShieldOff,
  UserRound,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Image from "next/image";

type AccountStatus = "active" | "suspended" | "pending_payment";

interface AccountDetails {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  gender?: string;
  profileImage?: string;
  accountStatus?: AccountStatus;
  hasActiveSubscription?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  business?: {
    businessName?: string;
    aboutBusiness?: string;
    numberOfProperties?: number;
  } | null;
  subscription?: {
    startDate?: string | null;
    endDate?: string | null;
    planId?: {
      title?: string;
      name?: string;
      price?: number;
      billingCycle?: string;
      maxProperties?: number;
      displayFeatures?: string[];
    } | null;
  } | null;
  searchUsage?: {
    used?: number;
    resetDate?: string | null;
  } | null;
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const statusClassMap: Record<AccountStatus, string> = {
  active: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  suspended: "bg-red-100 text-red-700 border border-red-200",
  pending_payment: "bg-amber-100 text-amber-700 border border-amber-200",
};

export function AccoutntModal({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();

  const { data: singleAccount, isLoading } = useQuery({
    queryKey: ["account-details", id, token],
    enabled: open && sessionStatus === "authenticated" && !!token && !!id,
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch account");
      }
      return json.data as AccountDetails;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (type: "suspend" | "unsuspend") => {
      const endpoint = type === "suspend" ? "suspend" : "unsuspend";
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/${id}/${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to update account status");
      }
      return json;
    },
    onSuccess: (_data, type) => {
      toast.success(type === "suspend" ? "Account suspended successfully" : "Account activated successfully");
      queryClient.invalidateQueries({ queryKey: ["account"] });
      queryClient.invalidateQueries({ queryKey: ["account-details", id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const fullName = useMemo(() => {
    if (!singleAccount) return "N/A";
    const name = `${singleAccount.firstName || ""} ${singleAccount.lastName || ""}`.trim();
    return name || "N/A";
  }, [singleAccount]);
  const profileImageSrc = useMemo(() => {
    const src = singleAccount?.profileImage;
    if (!src) return "";
    return src.startsWith("http://") ? src.replace("http://", "https://") : src;
  }, [singleAccount?.profileImage]);

  const accountStatus: AccountStatus = (singleAccount?.accountStatus || "pending_payment") as AccountStatus;
  const isActive = accountStatus === "active";
  const canSuspend = isActive;
  const canActivate = !isActive;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-[20px] leading-[120%] font-semibold text-[#DF2634] hover:text-[#DF2634]/80 transition-colors">
          Manage
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-[560px] p-0 overflow-hidden rounded-2xl [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Account Management</DialogTitle>
        </DialogHeader>

        <div className="max-h-[85vh] overflow-y-auto no-scrollbar bg-gradient-to-b from-[#fff8f8] via-white to-white">
          <div className="px-5 pt-5 pb-4 border-b border-rose-100">
            <div className="flex items-center gap-3">
              {profileImageSrc ? (
                <Image
                  src={profileImageSrc}
                  alt={fullName}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <UserRound className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-900">{fullName}</p>
                <p className="text-sm text-gray-500">{singleAccount?.email || "N/A"}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full capitalize ${statusClassMap[accountStatus]}`}>
                {accountStatus.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                disabled={!canActivate || updateStatusMutation.isPending}
                onClick={() => updateStatusMutation.mutate("unsuspend")}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-200 disabled:text-emerald-700 text-white h-11 flex items-center gap-2 rounded-lg"
              >
                <CheckCircle className="w-4 h-4" />
                Activate
              </Button>
              <Button
                disabled={!canSuspend || updateStatusMutation.isPending}
                onClick={() => updateStatusMutation.mutate("suspend")}
                className="bg-red-500 hover:bg-red-600 disabled:bg-red-200 disabled:text-red-700 text-white h-11 flex items-center gap-2 rounded-lg"
              >
                <ShieldOff className="w-4 h-4" />
                Suspend
              </Button>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Account Information</h3>
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading account details...</p>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <p className="text-xs text-gray-400">Full Name</p>
                    <p className="text-sm font-medium text-gray-800">{fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Role</p>
                    <p className="text-sm font-medium text-gray-800">{singleAccount?.role || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Business Name</p>
                    <p className="text-sm font-medium text-gray-800">{singleAccount?.business?.businessName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Properties</p>
                    <p className="text-sm font-medium text-gray-800">{singleAccount?.business?.numberOfProperties ?? 0}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <Mail className="w-3 h-3" /> Email
                    </div>
                    <p className="text-sm font-medium text-gray-800">{singleAccount?.email || "N/A"}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <Phone className="w-3 h-3" /> Phone
                    </div>
                    <p className="text-sm font-medium text-gray-800">{singleAccount?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <Calendar className="w-3 h-3" /> Created
                    </div>
                    <p className="text-sm font-medium text-gray-800">{formatDate(singleAccount?.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Last Updated</p>
                    <p className="text-sm font-medium text-gray-800">{formatDate(singleAccount?.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Subscription</h3>
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading subscription details...</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-400">Plan</p>
                      <p className="text-sm font-medium text-gray-800">
                        {singleAccount?.subscription?.planId?.title ||
                          singleAccount?.subscription?.planId?.name ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Price</p>
                      <p className="text-sm font-medium text-gray-800">${singleAccount?.subscription?.planId?.price ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Billing Cycle</p>
                      <p className="text-sm font-medium text-gray-800 capitalize">
                        {singleAccount?.subscription?.planId?.billingCycle || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Max Properties</p>
                      <p className="text-sm font-medium text-gray-800">{singleAccount?.subscription?.planId?.maxProperties ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Start Date</p>
                      <p className="text-sm font-medium text-gray-800">
                        {formatDate(singleAccount?.subscription?.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">End Date</p>
                      <p className="text-sm font-medium text-gray-800">{formatDate(singleAccount?.subscription?.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Search Used</p>
                      <p className="text-sm font-medium text-gray-800">{singleAccount?.searchUsage?.used ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Verified</p>
                      <p className="text-sm font-medium text-gray-800">{singleAccount?.isVerified ? "Yes" : "No"}</p>
                    </div>
                  </div>

                  {!!singleAccount?.subscription?.planId?.displayFeatures?.length && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-400 mb-2">Plan Features</p>
                      <ul className="space-y-1">
                        {singleAccount.subscription.planId.displayFeatures.map((feature) => (
                          <li key={feature} className="text-sm text-gray-700">
                            • {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="px-4 pb-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full h-11 text-sm border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
