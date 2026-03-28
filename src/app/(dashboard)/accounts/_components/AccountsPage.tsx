"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccoutntModal } from "@/app/modal/AccoutntModal";

interface Account {
  id: number;
  name: string;
  email: string;
  island: string;
  role: string;
  plan: string;
  status: "active" | "onboarding" | "suspended";
  listings: number;
}

const mockAccounts: Account[] = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  name: "Kondaricabera Cabera",
  email: "kondoricabrerac@gmail.com",
  island: "N/A",
  role: "N/A",
  plan: "Free",
  status: i === 0 || i === 5 ? "onboarding" : "active",
  listings: 0,
}));

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Account["status"] }) {
  const styles = {
    active: "bg-green-100 text-green-700",
    onboarding: "bg-yellow-100 text-yellow-700",
    suspended: "bg-red-100 text-red-600",
  };
  return (
    <span
      className={`px-3 py-2 rounded-full text-base font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function AccountsPage() {
  const [search, setSearch] = useState("");
  const [island, setIsland] = useState("all");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");
  const [perPage, setPerPage] = useState("50");
  const [selected, setSelected] = useState<number[]>([]);

  const filtered = mockAccounts.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "all" || a.status === status;
    const matchRole = role === "all" || a.role === role;
    return matchSearch && matchStatus && matchRole;
  });

  const allSelected =
    filtered.length > 0 && filtered.every((a) => selected.includes(a.id));

  const toggleAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(filtered.map((a) => a.id));
  };

  const toggleOne = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="container mx-auto py-8">
      {/* ── Filter Card ── */}
      <div className="bg-white !rounded-[12px] border border-gray-200 shadow-[1px_1px_4px_0px_#00000040] p-6 mb-4">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-900">Accounts</h1>
        <p className="text-sm text-gray-400 mt-1 mb-5">
          32 total &nbsp;•&nbsp; Page 1 of 1
        </p>

        {/* Search + Filters */}
        <div className="flex items-end gap-3 mb-5">
          {/* Search */}
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Email, name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300"
              />
            </div>
          </div>

          {/* Island */}
          <div className="w-48">
            <label className="text-xs text-gray-500 mb-1 block">Island</label>
            <Select value={island} onValueChange={setIsland}>
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
                <SelectValue placeholder="All Islands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Islands</SelectItem>
                <SelectItem value="anguilla">Anguilla</SelectItem>
                <SelectItem value="bahamas">Bahamas</SelectItem>
                <SelectItem value="barbados">Barbados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="w-48">
            <label className="text-xs text-gray-500 mb-1 block">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role */}
          <div className="w-48">
            <label className="text-xs text-gray-500 mb-1 block">Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pagination row */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">Showing upt o 50 per page</p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Per page</span>
            <Select value={perPage} onValueChange={setPerPage}>
              <SelectTrigger className="!h-9 w-20 text-sm border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="!h-9 px-4 text-sm text-gray-500 border-gray-200 hover:bg-gray-50"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="!h-9 px-4 text-sm text-gray-500 border-gray-200 hover:bg-gray-50"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          {/* Head */}
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="w-10 px-4 py-3">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </th>
              {[
                "ACCOUNT",
                "ISLAND",
                "ROLE",
                "PLAN",
                "STATUS",
                "LISTINGS",
                "ACTIONS",
              ].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-base font-semibold text-[#8B8B8B] leading-[120%]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-100">
            {filtered.map((account) => (
              <tr
                key={account.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Checkbox */}
                <td className="px-4 py-4">
                  <Checkbox  className="w-[20px] h-[20px]"
                    checked={selected.includes(account.id)}
                    onCheckedChange={() => toggleOne(account.id)}
                  />
                </td>

                {/* Account */}
                <td className="px-4 py-4">
                  <p className="text-[20px] leading-[120%] font-semibold text-[#1C1C1C]">
                    {account.name}
                  </p>
                  <p className="text-base leading-[150%] text-[#7A7A7A] mt-0.5">
                    {account.email}
                  </p>
                </td>

                {/* Island */}
                <td className="px-4 py-4 text-[20px] leading-[120%] font-semibold text-[#1C1C1C]">
                  {account.island}
                </td>

                {/* Role */}
                <td className="px-4 py-4 text-[20px] leading-[120%] font-semibold text-[#1C1C1C]">
                  {account.role}
                </td>

                {/* Plan */}
                <td className="px-4 py-4 text-[20px] leading-[120%] font-semibold text-[#1C1C1C]">
                  {account.plan}
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <StatusBadge status={account.status} />
                </td>

                {/* Listings */}
                <td className="px-4 py-4 text-[20px] leading-[120%] font-semibold text-[#1C1C1C]">
                  {account.listings}
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  {/* <button className="text-[20px] leading-[120%] font-semibold text-[#DF2634] hover:text-[#DF2634]/80 transition-colors">
                    Manage
                  </button> */}
                  <AccoutntModal />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AccountsPage;
