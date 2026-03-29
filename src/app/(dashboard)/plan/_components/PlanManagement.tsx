"use client";

import React, { useState } from "react";
import {
  Building2,
  Tag,
  ShieldCheck,
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

// ── Types ─────────────────────────────────────────────────────────────────────
interface Plan {
  id: number;
  key: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxProperties: number | null; // null = unlimited
  displayOrder: number;
  trialDays: number;
  promoMessage: string;
  freeTier: boolean;
  active: boolean;
}

// ── Initial mock plans ────────────────────────────────────────────────────────
const initialPlans: Plan[] = [
  {
    id: 1,
    key: "free",
    name: "Free Plan",
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxProperties: 3,
    displayOrder: 0,
    trialDays: 0,
    promoMessage: "",
    freeTier: true,
    active: true,
  },
  {
    id: 2,
    key: "basic",
    name: "Basic Plan",
    monthlyPrice: 9.99,
    yearlyPrice: 99,
    maxProperties: 10,
    displayOrder: 1,
    trialDays: 0,
    promoMessage: "",
    freeTier: false,
    active: true,
  },
  {
    id: 3,
    key: "premium",
    name: "Premium Plan",
    monthlyPrice: 9.99,
    yearlyPrice: 99,
    maxProperties: null,
    displayOrder: 2,
    trialDays: 0,
    promoMessage: "",
    freeTier: false,
    active: true,
  },
];

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
  freeTier: false,
  active: false,
};

type Tab = "plans" | "access" | "discount";

// ── Plan Card ─────────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  onEdit,
  onDelete,
}: {
  plan: Plan;
  onEdit: (p: Plan) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Red header */}
      <div className="bg-[#CC1F1F] px-5 py-4">
        <p className="text-white text-sm font-medium opacity-90">{plan.name}</p>
        <p className="text-white text-2xl font-bold mt-0.5">
          ${plan.monthlyPrice.toFixed(plan.monthlyPrice % 1 === 0 ? 0 : 2)}
          <span className="text-sm font-normal opacity-80">/mo</span>
        </p>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
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
        <div className="mb-4">
          <p className="text-sm font-bold text-gray-800 mb-1">Features:</p>
          <p className="text-sm text-gray-500">No Features set</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(plan)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1D4ED8] hover:bg-[#1e40af] text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => onDelete(plan.id)}
            className="w-10 h-9 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-lg border border-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Plan Form Modal ───────────────────────────────────────────────────────────
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
      {/* Modal header */}
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
            placeholder="eg: Free plan"
            value={form.key}
            onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
            className="h-10 text-sm border-gray-200"
          />
        </div>

        {/* Plan Name */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Plan Name</label>
          <Input
            placeholder="eg: Free plan"
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
            value={form.monthlyPrice}
            onChange={(e) =>
              setForm((f) => ({ ...f, monthlyPrice: e.target.value }))
            }
            className="h-10 text-sm border-gray-200"
          />
        </div>

        {/* Yearly Price */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Yearly Price ($)
          </label>
          <Input
            value={form.yearlyPrice}
            onChange={(e) =>
              setForm((f) => ({ ...f, yearlyPrice: e.target.value }))
            }
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
          <p className="text-xs text-gray-400 mt-1">
            Optional. If set, Stripe checkout will create a trial.
          </p>
        </div>

        {/* Promo Message */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Promo Message (optional)
          </label>
          <Input
            placeholder="eg: free until 14 feb"
            value={form.promoMessage}
            onChange={(e) =>
              setForm((f) => ({ ...f, promoMessage: e.target.value }))
            }
            className="h-10 text-sm border-gray-200"
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="mt-5 space-y-3">
        <div className="flex items-start gap-2">
          <Checkbox
            id="freeTier"
            checked={form.freeTier}
            onCheckedChange={(v) =>
              setForm((f) => ({ ...f, freeTier: !!v }))
            }
            className="mt-0.5"
          />
          <div>
            <Label htmlFor="freeTier" className="text-sm text-gray-700 cursor-pointer">
              Free tier plan (no payment required)
            </Label>
            <p className="text-xs text-gray-400 mt-0.5">
              If enabled, your app can treat this as a free plan (separate from
              time-limited promos).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="activePlan"
            checked={form.active}
            onCheckedChange={(v) =>
              setForm((f) => ({ ...f, active: !!v }))
            }
          />
          <Label htmlFor="activePlan" className="text-sm text-gray-700 cursor-pointer">
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
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save Plan
        </Button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PlanManagement() {
  const [activeTab, setActiveTab] = useState<Tab>("plans");
  const [plans, setPlans] = useState<Plan[]>(initialPlans);

  // Modal state: null = closed, "create" = create mode, number = edit mode (plan id)
  const [modalMode, setModalMode] = useState<null | "create" | number>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setForm(emptyForm);
    setModalMode("create");
  };

  const openEdit = (plan: Plan) => {
    setForm({
      key: plan.key,
      name: plan.name,
      monthlyPrice: String(plan.monthlyPrice),
      yearlyPrice: String(plan.yearlyPrice),
      maxProperties: plan.maxProperties === null ? "" : String(plan.maxProperties),
      displayOrder: String(plan.displayOrder),
      trialDays: String(plan.trialDays),
      promoMessage: plan.promoMessage,
      freeTier: plan.freeTier,
      active: plan.active,
    });
    setModalMode(plan.id);
  };

  const handleSave = () => {
    const maxProps =
      form.maxProperties.trim() === "" ? null : Number(form.maxProperties);

    if (modalMode === "create") {
      const newPlan: Plan = {
        id: Date.now(),
        key: form.key,
        name: form.name,
        monthlyPrice: Number(form.monthlyPrice),
        yearlyPrice: Number(form.yearlyPrice),
        maxProperties: maxProps,
        displayOrder: Number(form.displayOrder),
        trialDays: Number(form.trialDays),
        promoMessage: form.promoMessage,
        freeTier: form.freeTier,
        active: form.active,
      };
      setPlans((prev) => [...prev, newPlan]);
    } else {
      setPlans((prev) =>
        prev.map((p) =>
          p.id === modalMode
            ? {
                ...p,
                key: form.key,
                name: form.name,
                monthlyPrice: Number(form.monthlyPrice),
                yearlyPrice: Number(form.yearlyPrice),
                maxProperties: maxProps,
                displayOrder: Number(form.displayOrder),
                trialDays: Number(form.trialDays),
                promoMessage: form.promoMessage,
                freeTier: form.freeTier,
                active: form.active,
              }
            : p
        )
      );
    }
    setModalMode(null);
  };

  const handleDelete = (id: number) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "plans", label: "Plans", icon: <Tag className="w-4 h-4" /> },
    { id: "access", label: "Access", icon: <ShieldCheck className="w-4 h-4" /> },
    { id: "discount", label: "Discount Codes", icon: <Tag className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Tab Bar ── */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex items-center gap-2 py-3">
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
        {/* ── Page Header ── */}
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
              onClick={() => setPlans(initialPlans)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
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

        {/* ── Modal (Create / Edit) ── */}
        {modalMode !== null && (
          <PlanModal
            title={modalMode === "create" ? "Create new Plan" : "Edit Plan"}
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onCancel={() => setModalMode(null)}
          />
        )}

        {/* ── Plans Grid ── */}
        {activeTab === "plans" && (
          <div className="grid grid-cols-3 gap-5">
            {plans
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

        {activeTab === "access" && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            Access management coming soon.
          </div>
        )}

        {activeTab === "discount" && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            Discount Codes management coming soon.
          </div>
        )}
      </div>
    </div>
  );
}