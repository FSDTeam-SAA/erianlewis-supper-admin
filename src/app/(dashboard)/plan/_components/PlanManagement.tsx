/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import {
  Building2,
  Tag,
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { DeleteListingModal } from "@/components/modal/DeleteModal";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Plan {
  id: string;
  key: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxProperties: number | null;
  displayOrder: number;
  trialDays: number;
  promoMessage: string;
  displayFeatures: string[];
  freeTier: boolean;
  active: boolean;
  targetRoles: ("LANDLORD" | "AGENT")[]; // ← এটি যোগ করো
}

// ── Empty form state ──────────────────────────────────────────────────────────
const emptyForm = {
  key: "",
  name: "",
  monthlyPrice: "0",
  yearlyPrice: "0",
  maxProperties: "3",
  displayOrder: "0",
  trialDays: "0",
  promoMessage: "",
  features: [] as string[],
  featureInput: "",
  freeTier: false,
  active: false,
  targetRoles: ["LANDLORD", "AGENT"] as ("LANDLORD" | "AGENT")[],
};

type Tab = "plans";

// ── Plan Card (No changes) ───────────────────────────────────────────────────
function PlanCard({
  plan,
  onEdit,
  onDelete,
}: {
  plan: Plan;
  onEdit: (p: Plan) => void;
  onDelete: (p: Plan) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm h-full flex flex-col">
      <div className="bg-[#CC1F1F] px-5 py-4">
        <p className="text-white text-sm font-medium opacity-90">{plan.name}</p>
        <p className="text-white text-2xl font-bold mt-0.5">
          ${plan.monthlyPrice.toFixed(plan.monthlyPrice % 1 === 0 ? 0 : 2)}
          <span className="text-sm font-normal opacity-80">/mo</span>
        </p>
      </div>

      <div className="px-5 py-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">
            {plan.maxProperties === null
              ? "Unlimited Properties"
              : `Up to ${plan.maxProperties} Properties`}
          </span>
        </div>
        <div className="flex items-center gap-1 mb-3 text-sm text-gray-500">
          <span className="font-medium text-gray-700">Key :</span>
          <span className="ml-1">{plan.key}</span>
        </div>
        <div className="mb-4 min-h-[92px]">
          <p className="text-sm font-bold text-gray-800 mb-1">Features:</p>
          {plan.displayFeatures?.length ? (
            <div className="space-y-1.5">
              {plan.displayFeatures.map((feature, idx) => (
                <div
                  key={`${plan.id}-feature-${idx}`}
                  className="inline-flex items-center gap-2 px-2.5 py-1 mr-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CC1F1F]" />
                  <span className="text-sm text-gray-600 leading-5">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No Features set</p>
          )}
        </div>

        <div className="flex items-center gap-2 mt-auto">
          <button
            onClick={() => onEdit(plan)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1D4ED8] hover:bg-[#1e40af] text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => onDelete(plan)}
            className="w-10 h-9 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-lg border border-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm h-full flex flex-col">
      <div className="bg-[#CC1F1F] px-5 py-4">
        <Skeleton className="h-4 w-24 bg-white/30" />
        <Skeleton className="h-8 w-28 mt-2 bg-white/30" />
      </div>
      <div className="px-5 py-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="mb-2">
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="mb-4 min-h-[92px] space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 w-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ── Plan Form Modal (Updated with Role Select) ───────────────────────────────
function PlanModal({
  title,
  form,
  setForm,
  onSave,
  onCancel,
}: {
  title: string;
  form: typeof emptyForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md mb-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Plan Key */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Plan Key (Identifier)
          </label>
          <Input
            placeholder="eg: pro_monthly"
            value={form.key}
            onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
            className="h-10 text-sm border-gray-200"
          />
        </div>

        {/* Plan Name */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Plan Name</label>
          <Input
            placeholder="eg: Professional Plan"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="h-10 text-sm border-gray-200"
          />
        </div>

        {/* Monthly Price */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Monthly Price ($)
          </label>
          <Input
            type="text"
            inputMode="decimal"
            value={form.monthlyPrice}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d*$/.test(value)) {
                setForm((f) => ({ ...f, monthlyPrice: value }));
              }
            }}
            className="h-10 text-sm border-gray-200"
          />
        </div>

        {/* Yearly Price */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Yearly Price ($)
          </label>
          <Input
            type="text"
            inputMode="decimal"
            value={form.yearlyPrice}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d*$/.test(value)) {
                setForm((f) => ({ ...f, yearlyPrice: value }));
              }
            }}
            className="h-10 text-sm border-gray-200"
          />
          <p className="text-xs text-gray-400 mt-1">
            Optional. A common setup is ~2 months free.
          </p>
        </div>

        {/* Max Properties */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Max Properties (leave empty for unlimited)
          </label>
          <Input
            value={form.maxProperties}
            onChange={(e) =>
              setForm((f) => ({ ...f, maxProperties: e.target.value }))
            }
            className="h-10 text-sm border-gray-200"
          />
        </div>

        {/* Display Order */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Display Order
          </label>
          <Input
            value={form.displayOrder}
            onChange={(e) =>
              setForm((f) => ({ ...f, displayOrder: e.target.value }))
            }
            className="h-10 text-sm border-gray-200"
          />
        </div>

        {/* Trial Days */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Trial Days</label>
          <Input
            value={form.trialDays}
            onChange={(e) =>
              setForm((f) => ({ ...f, trialDays: e.target.value }))
            }
            className="h-10 text-sm border-gray-200"
          />
        </div>

        {/* Target Roles - NEW FIELD */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Target Roles
          </label>
          <Select
            value={form.targetRoles.join(",")}
            onValueChange={(value) => {
              let selected: ("LANDLORD" | "AGENT")[] = [];

              if (value === "LANDLORD") selected = ["LANDLORD"];
              else if (value === "AGENT") selected = ["AGENT"];
              else if (value === "LANDLORD,AGENT")
                selected = ["LANDLORD", "AGENT"];

              setForm((f) => ({ ...f, targetRoles: selected }));
            }}
          >
            <SelectTrigger className="h-10 w-full text-sm border-gray-200">
              <SelectValue placeholder="Select target roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LANDLORD">LANDLORD</SelectItem>
              <SelectItem value="AGENT">AGENT</SelectItem>
              <SelectItem value="LANDLORD,AGENT">
                Both (LANDLORD & AGENT)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Features */}
        <div className="col-span-2">
          <label className="block text-sm text-gray-600 mb-1">Features</label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type feature and click +"
              value={form.featureInput}
              onChange={(e) =>
                setForm((f) => ({ ...f, featureInput: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const feature = form.featureInput.trim();
                  if (!feature) return;
                  setForm((f) =>
                    f.features.includes(feature)
                      ? { ...f, featureInput: "" }
                      : {
                          ...f,
                          features: [...f.features, feature],
                          featureInput: "",
                        },
                  );
                }
              }}
              className="h-10 text-sm border-gray-200"
            />
            <button
              type="button"
              onClick={() => {
                const feature = form.featureInput.trim();
                if (!feature) return;
                setForm((f) =>
                  f.features.includes(feature)
                    ? { ...f, featureInput: "" }
                    : {
                        ...f,
                        features: [...f.features, feature],
                        featureInput: "",
                      },
                );
              }}
              className="h-10 w-10 rounded-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {!!form.features.length && (
            <div className="mt-2 flex flex-wrap gap-2">
              {form.features.map((feature, idx) => (
                <div
                  key={`${feature}-${idx}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 border border-gray-200 px-2 py-1"
                >
                  <span className="text-xs text-gray-700">{feature}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        features: f.features.filter((item) => item !== feature),
                      }))
                    }
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="mt-5 space-y-3">
        <div className="flex items-start gap-2">
          <Checkbox
            id="freeTier"
            checked={form.freeTier}
            onCheckedChange={(v) => setForm((f) => ({ ...f, freeTier: !!v }))}
            className="mt-0.5"
          />
          <div>
            <Label
              htmlFor="freeTier"
              className="text-sm text-gray-700 cursor-pointer"
            >
              Free tier plan (no payment required)
            </Label>
            <p className="text-xs text-gray-400 mt-0.5">
              If enabled, your app can treat this as a free plan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="activePlan"
            checked={form.active}
            onCheckedChange={(v) => setForm((f) => ({ ...f, active: !!v }))}
          />
          <Label
            htmlFor="activePlan"
            className="text-sm text-gray-700 cursor-pointer"
          >
            Active Plan
          </Label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 mt-6">
        <Button
          variant="outline"
          onClick={onCancel}
          className="px-6 h-9 text-sm border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          className="px-6 h-9 text-sm bg-[#CC1F1F] hover:bg-[#b01c1c] text-white flex items-center gap-1.5"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
          Save Plan
        </Button>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function PlanManagement() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>("plans");
  const [roleFilter, setRoleFilter] = useState<"all" | "LANDLORD" | "AGENT">(
    "all",
  );
  const [modalMode, setModalMode] = useState<null | "create" | string>(null);
  const [form, setForm] = useState(emptyForm);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string | null;
    name: string;
  }>({ isOpen: false, id: null, name: "" });

  // Fetch Plans
  const {
    data: getPlan,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["plan", roleFilter],
    queryFn: async () => {
      const roleQuery = roleFilter === "all" ? "" : `?role=${roleFilter}`;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/plans${roleQuery}`,
      );
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch plans");
      }
      return json.data as { items: any[] };
    },
  });

  const plans: Plan[] = useMemo(() => {
    return (getPlan?.items || []).map((item, idx) => ({
      id: item._id,
      key: item.name || "",
      name: item.title || item.name || "N/A",
      monthlyPrice:
        item.billingCycle === "monthly" || item.billingCycle === "free"
          ? Number(item.price || 0)
          : 0,
      yearlyPrice: item.billingCycle === "yearly" ? Number(item.price || 0) : 0,
      maxProperties: item.maxProperties ?? null,
      displayOrder: idx,
      trialDays: 0,
      promoMessage: "",
      displayFeatures: item.displayFeatures || [],
      freeTier: item.billingCycle === "free",
      active: item.status === "active",

      // ← এখানে targetRoles যোগ করা হয়েছে
      targetRoles: Array.isArray(item.targetRoles)
        ? item.targetRoles
        : ["LANDLORD", "AGENT"], // fallback
    }));
  }, [getPlan?.items]);
  const buildPayloadFromForm = () => {
    const maxProps =
      form.maxProperties.trim() === "" ? null : Number(form.maxProperties);

    return {
      title: form.name,
      name: form.key,
      price: Number(form.monthlyPrice || 0),
      billingCycle: form.freeTier ? "free" : "monthly",
      displayFeatures: form.features,
      limits: {
        maxReturnOrders: Number(form.trialDays || 0),
      },
      numberOfPackages: maxProps ?? 0,
      entitlements: {
        rushService: !!form.active,
        freePhysicalReturnLabel: !!form.freeTier,
        freePhysicalReceipt: !!form.freeTier,
      },
      targetRoles: form.targetRoles, // ← Now dynamic
      maxProperties: maxProps,
      status: form.active ? "active" : "inactive",
    };
  };

  const addPlanMutaion = useMutation({
    mutationFn: async () => {
      const payload = buildPayloadFromForm();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/plans`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!res.ok || !json?.status)
        throw new Error(json?.message || "Failed to create plan");
      return json;
    },
    onSuccess: () => {
      toast.success("Plan created successfully");
      queryClient.invalidateQueries({ queryKey: ["plan"] });
      setModalMode(null);
      setForm(emptyForm);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const editPlanMutaion = useMutation({
    mutationFn: async (id: string) => {
      const payload = buildPayloadFromForm();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/plans/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!res.ok || !json?.status)
        throw new Error(json?.message || "Failed to update plan");
      return json;
    },
    onSuccess: () => {
      toast.success("Plan updated successfully");
      queryClient.invalidateQueries({ queryKey: ["plan"] });
      setModalMode(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteplanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/plans/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const json = await res.json();
      if (!res.ok || !json?.status)
        throw new Error(json?.message || "Failed to delete plan");
      return json;
    },
    onSuccess: () => {
      toast.success("Plan deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["plan"] });
      setDeleteModal({ isOpen: false, id: null, name: "" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const openCreate = () => {
    setForm(emptyForm);
    setModalMode("create");
  };

  const openEdit = (plan: Plan) => {
    // Backend থেকে আসা targetRoles ব্যবহার করা হচ্ছে
    const targetRoles: ("LANDLORD" | "AGENT")[] =
      Array.isArray(plan.targetRoles) && plan.targetRoles.length > 0
        ? plan.targetRoles
        : ["LANDLORD", "AGENT"]; // fallback

    setForm({
      key: plan.key,
      name: plan.name,
      monthlyPrice: String(plan.monthlyPrice),
      yearlyPrice: String(plan.yearlyPrice),
      maxProperties:
        plan.maxProperties === null ? "" : String(plan.maxProperties),
      displayOrder: String(plan.displayOrder),
      trialDays: String(plan.trialDays),
      promoMessage: "",
      features: plan.displayFeatures || [],
      featureInput: "",
      freeTier: plan.freeTier,
      active: plan.active,
      targetRoles: targetRoles, // ← এখানে ঠিক করা হয়েছে
    });
    setModalMode(plan.id);
  };

  const handleSave = () => {
    if (modalMode === "create") {
      addPlanMutaion.mutate();
    } else if (modalMode) {
      editPlanMutaion.mutate(String(modalMode));
    }
  };

  const handleDelete = (p: Plan) => {
    setDeleteModal({ isOpen: true, id: p.id, name: p.name });
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "plans", label: "Plans", icon: <Tag className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Bar */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex items-center gap-2 py-3 container mx-auto pl-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#CC1F1F] text-white"
                  : "text-gray-500 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manage Subscription Plans
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Configure pricing tiers, trials, and promo messages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>

            <Select
              value={roleFilter}
              onValueChange={(v) => setRoleFilter(v as any)}
            >
              <SelectTrigger className="w-[160px] h-10 text-sm border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="LANDLORD">LANDLORD</SelectItem>
                <SelectItem value="AGENT">AGENT</SelectItem>
              </SelectContent>
            </Select>

            {modalMode === null && (
              <button
                onClick={openCreate}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#CC1F1F] hover:bg-[#b01c1c] rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Plan
              </button>
            )}
          </div>
        </div>

        {/* Plan Modal */}
        {modalMode !== null && (
          <PlanModal
            title={modalMode === "create" ? "Create new Plan" : "Edit Plan"}
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onCancel={() => setModalMode(null)}
          />
        )}

        {/* Plans Grid */}
        {activeTab === "plans" && (
          <div className="grid grid-cols-3 gap-5">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <PlanCardSkeleton key={i} />
                ))
              : plans
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                    />
                  ))}
          </div>
        )}
      </div>

      <DeleteListingModal
        isOpen={deleteModal.isOpen}
        listingId={deleteModal.id}
        listingName={deleteModal.name}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        onConfirm={(id) => deleteplanMutation.mutate(String(id))}
      />
    </div>
  );
}
