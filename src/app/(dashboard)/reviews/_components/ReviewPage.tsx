/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { Search, Eye, EyeOff, Trash2, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteListingModal } from "@/components/modal/DeleteModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type ReviewStatus = "visible" | "hidden";

interface ReviewRow {
  id: string;
  when: string;
  property: string;
  island: string;
  ownerEmail: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
}

interface IslandOption {
  _id: string;
  name: string;
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const styles = {
    visible: "bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]",
    hidden: "bg-[#fce4ec] text-[#c62828] border border-[#f8bbd0]",
  };
  const labels = { visible: "Visible", hidden: "Hidden" };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function ReviewPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedIslandId, setSelectedIslandId] = useState("all");
  const [visibility, setVisibility] = useState<"all" | "visible" | "hidden">(
    "all",
  );
  const [perPage] = useState("50");
  const [page] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsReviewId, setDetailsReviewId] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string | null;
    name: string;
  }>({ isOpen: false, id: null, name: "" });

  // ==================== Queries ====================
  const { data: islandsData = [] } = useQuery({
    queryKey: ["island-options", token],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/islands`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const json = await res.json();
      if (!res.ok || !json?.status)
        throw new Error(json?.message || "Failed to fetch islands");
      return json.data?.islands || [];
    },
  });

  const {
    data: reviewData,
    isLoading,
  } = useQuery({
    queryKey: ["reviews", token, page, perPage, visibility],
    enabled: !!token,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: perPage,
      });
      if (visibility !== "all") params.set("status", visibility);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/reviews/all?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const json = await res.json();
      if (!res.ok || !json?.status)
        throw new Error(json?.message || "Failed to fetch reviews");
      return json.data;
    },
  });

  const { data: reviewDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["review-details", detailsReviewId, token],
    enabled: detailsModalOpen && !!detailsReviewId && !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/reviews/${detailsReviewId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const json = await res.json();
      if (!res.ok || !json?.status)
        throw new Error(json?.message || "Failed to fetch review details");
      return json.data;
    },
  });

  // ==================== Single Mutations ====================
  const hideUnhideMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/reviews/${reviewId}/toggle`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const json = await res.json();
      if (!res.ok || !json?.status)
        throw new Error(json?.message || "Failed to toggle visibility");
      return json;
    },
    onSuccess: () => {
      toast.success("Visibility updated");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/reviews/admin/${reviewId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const json = await res.json();
      if (!res.ok || !json?.status)
        throw new Error(json?.message || "Failed to delete review");
      return json;
    },
    onSuccess: () => {
      toast.success("Review deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // ==================== Bulk Mutations ====================
  const bulkHideMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/reviews/bulk/hide`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids }),
        },
      );
      const json = await res.json();
      if (!res.ok || !json?.status)
        throw new Error(json?.message || "Failed to hide reviews");
      return json;
    },
    onSuccess: () => {
      toast.success("Selected reviews hidden");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setSelected([]);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const bulkUnhideMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/reviews/bulk/unhide`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids }),
        },
      );
      const json = await res.json();
      if (!res.ok || !json?.status)
        throw new Error(json?.message || "Failed to unhide reviews");
      return json;
    },
    onSuccess: () => {
      toast.success("Selected reviews unhidden");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setSelected([]);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/reviews/bulk/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids }),
        },
      );
      const json = await res.json();
      if (!res.ok || !json?.status)
        throw new Error(json?.message || "Failed to delete reviews");
      return json;
    },
    onSuccess: () => {
      toast.success("Selected reviews deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setSelected([]);
    },
    onError: (err: any) => toast.error(err.message),
  });

  // ==================== Data & Filtering ====================
  const rows: ReviewRow[] = useMemo(() => {
    return (reviewData?.reviews || []).map((item: any) => {
      const islandId = item?.property?.address?.island;
      const islandName =
        islandsData.find((i: IslandOption) => i._id === islandId)?.name ||
        "N/A";

      return {
        id: item._id,
        when: item.createdAt
          ? new Date(item.createdAt).toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
        property:
          item?.property?.basicInformation?.propertyTitle ||
          "Untitled Property",
        island: islandName,
        ownerEmail: item?.user?.email || "N/A",
        rating: item?.rating ?? 0,
        comment: item?.comment?.trim() || "—",
        status: item?.status === "hidden" ? "hidden" : "visible",
      };
    });
  }, [reviewData?.reviews, islandsData]);

  const filteredRows = useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    return rows.filter((review) => {
      const matchesSearch =
        review.property.toLowerCase().includes(searchLower) ||
        review.ownerEmail.toLowerCase().includes(searchLower) ||
        review.comment.toLowerCase().includes(searchLower);

      const matchesIsland =
        selectedIslandId === "all" ||
        islandsData.find((i: any) => i._id === selectedIslandId)?.name ===
          review.island;

      return matchesSearch && matchesIsland;
    });
  }, [rows, search, selectedIslandId, islandsData]);

  const allSelected =
    filteredRows.length > 0 &&
    filteredRows.every((r) => selected.includes(r.id));
  const selectedCount = selected.length;

  const toggleAll = () =>
    setSelected(allSelected ? [] : filteredRows.map((r) => r.id));
  const toggleOne = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const openDetailsModal = (id: string) => {
    setDetailsReviewId(id);
    setDetailsModalOpen(true);
  };

  const openDeleteModal = (review: ReviewRow) => {
    setDeleteModal({ isOpen: true, id: review.id, name: review.property });
  };

  const handleBulkHide = () => bulkHideMutation.mutate(selected);
  const handleBulkUnhide = () => bulkUnhideMutation.mutate(selected);
  const handleBulkDelete = () => bulkDeleteMutation.mutate(selected);
  const clearSelection = () => setSelected([]);

  const totalData = reviewData?.paginationInfo?.totalData ?? 0;

  return (
    <div className="container mx-auto py-8">
      {/* Header & Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Reviews Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {totalData} total reviews
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 text-sm px-4 py-2 border rounded-xl hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[280px]">
            <label className="text-xs text-gray-500 mb-1.5 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Property title, email or comment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </div>

          <div className="w-52">
            <label className="text-xs text-gray-500 mb-1.5 block">Island</label>
            <Select
              value={selectedIslandId}
              onValueChange={setSelectedIslandId}
            >
              <SelectTrigger className="!h-11 w-full">
                <SelectValue placeholder="All Islands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Islands</SelectItem>
                {islandsData.map((island: IslandOption) => (
                  <SelectItem key={island._id} value={island._id}>
                    {island.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-52">
            <label className="text-xs text-gray-500 mb-1.5 block">
              Visibility
            </label>
            <Select
              value={visibility}
              onValueChange={(v: any) => setVisibility(v)}
            >
              <SelectTrigger className="!h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="visible">Visible</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedCount > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {selectedCount} reviews selected
            </span>
            <button
              onClick={clearSelection}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleBulkHide}
              className="flex items-center gap-2"
            >
              <EyeOff className="w-4 h-4" />
              Bulk Hide
            </Button>
            <Button
              variant="outline"
              onClick={handleBulkUnhide}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Bulk Unhide
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Bulk Delete
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="w-12 px-4 py-4">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </th>
              {[
                "WHEN",
                "PROPERTY",
                "USER",
                "RATING",
                "COMMENT",
                "STATUS",
                "ACTIONS",
              ].map((col) => (
                <th
                  key={col}
                  className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-5">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredRows.length > 0 ? (
              filteredRows.map((review) => (
                <tr
                  key={review.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <Checkbox
                      checked={selected.includes(review.id)}
                      onCheckedChange={() => toggleOne(review.id)}
                    />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {review.when}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900">
                      {review.property?.length > 20
                        ? review.property.slice(0, 20) + "..."
                        : review.property}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {review.island}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {review.ownerEmail}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? "text-amber-400 fill-current" : "text-gray-200"}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-sm font-medium">
                        {review.rating}/5
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 max-w-xs">
                    <div className="line-clamp-2 leading-relaxed">
                      {review.comment?.length > 30
                        ? review.comment.slice(0, 30) + "..."
                        : review.comment}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={review.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => hideUnhideMutation.mutate(review.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border hover:bg-gray-50"
                      >
                        {review.status === "hidden" ? (
                          <>
                            <Eye className="w-4 h-4" /> Unhide
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" /> Hide
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => openDetailsModal(review.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>

                      <button
                        onClick={() => openDeleteModal(review)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-20 text-center text-gray-400">
                  No reviews found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <DeleteListingModal
        isOpen={deleteModal.isOpen}
        listingId={deleteModal.id}
        listingName={deleteModal.name}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        onConfirm={(id) => {
          if (id) deleteMutation.mutate(String(id));
        }}
      />

      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl">Review Details</DialogTitle>
          </DialogHeader>

          {isDetailsLoading ? (
            <p className="py-12 text-center text-lg">Loading details...</p>
          ) : (
            <div className="space-y-8 text-[15px]">
              <div>
                <p className="text-sm text-gray-500 mb-1">Property</p>
                <p className="font-semibold text-xl leading-tight">
                  {reviewDetails?.property?.basicInformation?.propertyTitle ||
                    "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-500">User Name</p>
                  <p className="font-medium text-lg mt-1">
                    {reviewDetails?.user?.firstName}{" "}
                    {reviewDetails?.user?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-lg mt-1">
                    {reviewDetails?.user?.email || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="font-semibold text-3xl mt-1">
                    {reviewDetails?.rating ?? 0}/5
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-2">
                    <StatusBadge status={reviewDetails?.status || "visible"} />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Comment</p>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-[15.5px] leading-relaxed whitespace-pre-wrap">
                  {reviewDetails?.comment || "—"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                  <p className="text-gray-500">Created At</p>
                  <p className="mt-1 font-medium">
                    {reviewDetails?.createdAt
                      ? new Date(reviewDetails.createdAt).toLocaleString(
                          "en-GB",
                        )
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Updated At</p>
                  <p className="mt-1 font-medium">
                    {reviewDetails?.updatedAt
                      ? new Date(reviewDetails.updatedAt).toLocaleString(
                          "en-GB",
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReviewPage;
