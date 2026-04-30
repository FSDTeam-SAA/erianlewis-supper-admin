"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type FieldItem = {
  key: string;
  label: string;
  placeholder: string;
  helperText: string;
  required: boolean;
  enabled: boolean;
};

type RoleItem = {
  key: string;
  label: string;
  description: string;
};

type EntityOptionItem = {
  key: string;
  label: string;
  description: string;
  features: string[];
};

type StepContent = {
  title: string;
  subtitle: string;
  body: string;
  fields: FieldItem[];
  roles: RoleItem[];
  entityOptions: EntityOptionItem[];
};

type OnboardingStep = {
  stepNumber: number;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  required: boolean;
  visibleForRoles: string[];
  content: StepContent;
};

type OnboardingConfig = {
  _id: string;
  steps: OnboardingStep[];
  updatedAt: string;
  createdAt: string;
};

type ApiResponse = {
  status: boolean;
  message: string;
  data: OnboardingConfig;
};

function ToggleChip({ value }: { value: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {value ? "Enabled" : "Disabled"}
    </span>
  );
}

function RequiredChip({ value }: { value: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        value ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
      }`}
    >
      {value ? "Required" : "Optional"}
    </span>
  );
}

export default function OnboardingPage() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;

  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [selectedStepNumber, setSelectedStepNumber] = useState<number | null>(
    null,
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["onboarding-config", token],
    enabled: sessionStatus === "authenticated" && !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/onboarding`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = (await res.json()) as ApiResponse;
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch onboarding config");
      }
      return json.data;
    },
  });
  useEffect(() => {
    if (!data?.steps?.length) return;
    setSteps(data.steps);
    setSelectedStepNumber((prev) => prev ?? data.steps[0].stepNumber);
  }, [data]);

  const selectedStep = useMemo(
    () => steps.find((step) => step.stepNumber === selectedStepNumber) || null,
    [steps, selectedStepNumber],
  );

  const updateSelectedStep = (
    updater: (step: OnboardingStep) => OnboardingStep,
  ) => {
    if (!selectedStep) return;
    setSteps((prev) =>
      prev.map((step) =>
        step.stepNumber === selectedStep.stepNumber ? updater(step) : step,
      ),
    );
  };

  const buildStepContentPayload = (step: OnboardingStep) => {
    if (step.key === "personal_information") {
      return {
        title: step.content.title,
        subtitle: step.content.subtitle,
        fields: step.content.fields,
      };
    }

    if (step.key === "role_selection") {
      return {
        title: step.content.title,
        subtitle: step.content.subtitle,
        body: step.content.body,
        roles: step.content.roles,
      };
    }

    if (step.key === "entity_type") {
      return {
        title: step.content.title,
        subtitle: step.content.subtitle,
        body: step.content.body,
        entityOptions: step.content.entityOptions,
        fields: step.content.fields,
      };
    }

    if (step.key === "business_profile") {
      return {
        title: step.content.title,
        subtitle: step.content.subtitle,
        fields: step.content.fields,
      };
    }

    if (step.key === "plan_selection") {
      return {
        title: step.content.title,
        subtitle: step.content.subtitle,
        body: step.content.body,
        fields: step.content.fields,
      };
    }

    if (step.key === "completion") {
      return {
        title: step.content.title,
        subtitle: step.content.subtitle,
        body: step.content.body,
      };
    }

    return {
      title: step.content.title,
      subtitle: step.content.subtitle,
      body: step.content.body,
      roles: step.content.roles,
      entityOptions: step.content.entityOptions,
      fields: step.content.fields,
    };
  };

  const updateContentMutation = useMutation({
    mutationFn: async (step: OnboardingStep) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/onboarding/steps/${step.key}/content`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(buildStepContentPayload(step)),
        },
      );

      const json = (await res.json()) as ApiResponse;
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to update step content");
      }
      return json.data;
    },
    onSuccess: (updatedConfig) => {
      if (updatedConfig?.steps?.length) {
        setSteps(updatedConfig.steps);
      }
      toast.success("Step content updated");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to update step content",
      );
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Onboarding Process Management
          </h1>
          {/* <p className="text-sm text-gray-500 mt-1">
            Left side এ step list, right side এ selected step content edit করতে পারবেন.
          </p> */}
        </div>

        {isLoading && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-500">
            Loading onboarding config...
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-sm text-red-700">
            {(error as Error)?.message || "Failed to load onboarding data"}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                <p className="text-sm font-semibold text-gray-700">
                  Onboarding Steps
                </p>
              </div>

              <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
                {steps.map((step) => (
                  <button
                    key={step.stepNumber}
                    onClick={() => setSelectedStepNumber(step.stepNumber)}
                    className={`w-full text-left px-4 py-3.5 transition-colors ${
                      selectedStepNumber === step.stepNumber
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5 ${
                          selectedStepNumber === step.stepNumber
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {step.stepNumber}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {step.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                          {step.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <ToggleChip value={step.enabled} />
                          <RequiredChip value={step.required} />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                <p className="text-sm font-semibold text-gray-700">
                  {selectedStep
                    ? `Step ${selectedStep.stepNumber}: ${selectedStep.name}`
                    : "Select a step"}
                </p>
              </div>

              {!selectedStep ? (
                <div className="p-6 text-sm text-gray-500">
                  No step selected.
                </div>
              ) : (
                <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                  <div className="pt-4">
                    <p className="text-sm font-semibold text-gray-800 mb-3">
                      Content
                    </p>

                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Step Key
                      </label>
                      <input
                        value={selectedStep.key}
                        disabled
                        className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          value={selectedStep.content.title}
                          onChange={(e) =>
                            updateSelectedStep((step) => ({
                              ...step,
                              content: {
                                ...step.content,
                                title: e.target.value,
                              },
                            }))
                          }
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Subtitle
                        </label>
                        <input
                          value={selectedStep.content.subtitle}
                          onChange={(e) =>
                            updateSelectedStep((step) => ({
                              ...step,
                              content: {
                                ...step.content,
                                subtitle: e.target.value,
                              },
                            }))
                          }
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Body
                      </label>
                      <textarea
                        value={selectedStep.content.body}
                        onChange={(e) =>
                          updateSelectedStep((step) => ({
                            ...step,
                            content: { ...step.content, body: e.target.value },
                          }))
                        }
                        rows={3}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    {selectedStep.content.entityOptions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 my-4">
                          Entity Options (
                          {selectedStep.content.entityOptions.length})
                        </p>

                        {selectedStep.content.entityOptions.length === 0 && (
                          <p className="text-xs text-gray-400">
                            No entity options in this step.
                          </p>
                        )}

                        <div className="space-y-3">
                          {selectedStep.content.entityOptions.map(
                            (entity, idx) => (
                              <div
                                key={`${entity.key}-${idx}`}
                                className="border border-gray-200 rounded-lg p-3"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <input
                                    value={entity.key}
                                    disabled
                                    placeholder="Entity key"
                                    className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-md px-2.5 py-2 text-sm cursor-not-allowed"
                                  />
                                  <input
                                    value={entity.label}
                                    onChange={(e) =>
                                      updateSelectedStep((step) => {
                                        const nextEntities = [
                                          ...step.content.entityOptions,
                                        ];
                                        nextEntities[idx] = {
                                          ...nextEntities[idx],
                                          label: e.target.value,
                                        };
                                        return {
                                          ...step,
                                          content: {
                                            ...step.content,
                                            entityOptions: nextEntities,
                                          },
                                        };
                                      })
                                    }
                                    placeholder="Entity label"
                                    className="w-full border border-gray-200 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:border-blue-400"
                                  />
                                </div>

                                <textarea
                                  value={entity.description}
                                  onChange={(e) =>
                                    updateSelectedStep((step) => {
                                      const nextEntities = [
                                        ...step.content.entityOptions,
                                      ];
                                      nextEntities[idx] = {
                                        ...nextEntities[idx],
                                        description: e.target.value,
                                      };
                                      return {
                                        ...step,
                                        content: {
                                          ...step.content,
                                          entityOptions: nextEntities,
                                        },
                                      };
                                    })
                                  }
                                  placeholder="Entity description"
                                  rows={2}
                                  className="w-full border border-gray-200 rounded-md px-2.5 py-2 text-sm mt-3 focus:outline-none focus:border-blue-400"
                                />

                                <textarea
                                  value={entity.features.join("\n")}
                                  onChange={(e) =>
                                    updateSelectedStep((step) => {
                                      const nextEntities = [
                                        ...step.content.entityOptions,
                                      ];
                                      nextEntities[idx] = {
                                        ...nextEntities[idx],
                                        features: e.target.value
                                          .split("\n")
                                          .map((f) => f.trim())
                                          .filter(Boolean),
                                      };
                                      return {
                                        ...step,
                                        content: {
                                          ...step.content,
                                          entityOptions: nextEntities,
                                        },
                                      };
                                    })
                                  }
                                  placeholder="One feature per line"
                                  rows={3}
                                  className="w-full border border-gray-200 rounded-md px-2.5 py-2 text-sm mt-3 focus:outline-none focus:border-blue-400"
                                />
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {selectedStep.content.fields.length > 0 && (
                      <div className="my-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Fields ({selectedStep.content.fields.length})
                        </p>

                        {selectedStep.content.fields.length === 0 && (
                          <p className="text-xs text-gray-400">
                            No fields in this step.
                          </p>
                        )}

                        <div className="space-y-3">
                          {selectedStep.content.fields.map((field, idx) => (
                            <div
                              key={`${field.key}-${idx}`}
                              className="border border-gray-200 rounded-lg p-3"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Field Key
                                  </label>
                                  <input
                                    value={field.key}
                                    disabled
                                    className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-md px-2.5 py-2 text-sm cursor-not-allowed"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Label
                                  </label>
                                  <input
                                    value={field.label}
                                    onChange={(e) =>
                                      updateSelectedStep((step) => {
                                        const nextFields = [
                                          ...step.content.fields,
                                        ];
                                        nextFields[idx] = {
                                          ...nextFields[idx],
                                          label: e.target.value,
                                        };
                                        return {
                                          ...step,
                                          content: {
                                            ...step.content,
                                            fields: nextFields,
                                          },
                                        };
                                      })
                                    }
                                    className="w-full border border-gray-200 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:border-blue-400"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Placeholder
                                  </label>
                                  <input
                                    value={field.placeholder}
                                    onChange={(e) =>
                                      updateSelectedStep((step) => {
                                        const nextFields = [
                                          ...step.content.fields,
                                        ];
                                        nextFields[idx] = {
                                          ...nextFields[idx],
                                          placeholder: e.target.value,
                                        };
                                        return {
                                          ...step,
                                          content: {
                                            ...step.content,
                                            fields: nextFields,
                                          },
                                        };
                                      })
                                    }
                                    className="w-full border border-gray-200 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:border-blue-400"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Helper Text
                                  </label>
                                  <input
                                    value={field.helperText}
                                    onChange={(e) =>
                                      updateSelectedStep((step) => {
                                        const nextFields = [
                                          ...step.content.fields,
                                        ];
                                        nextFields[idx] = {
                                          ...nextFields[idx],
                                          helperText: e.target.value,
                                        };
                                        return {
                                          ...step,
                                          content: {
                                            ...step.content,
                                            fields: nextFields,
                                          },
                                        };
                                      })
                                    }
                                    className="w-full border border-gray-200 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:border-blue-400"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-5 mt-3">
                                <label className="flex items-center gap-1.5 text-xs text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) =>
                                      updateSelectedStep((step) => {
                                        const nextFields = [
                                          ...step.content.fields,
                                        ];
                                        nextFields[idx] = {
                                          ...nextFields[idx],
                                          required: e.target.checked,
                                        };
                                        return {
                                          ...step,
                                          content: {
                                            ...step.content,
                                            fields: nextFields,
                                          },
                                        };
                                      })
                                    }
                                  />
                                  Required
                                </label>

                                <label className="flex items-center gap-1.5 text-xs text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={field.enabled}
                                    onChange={(e) =>
                                      updateSelectedStep((step) => {
                                        const nextFields = [
                                          ...step.content.fields,
                                        ];
                                        nextFields[idx] = {
                                          ...nextFields[idx],
                                          enabled: e.target.checked,
                                        };
                                        return {
                                          ...step,
                                          content: {
                                            ...step.content,
                                            fields: nextFields,
                                          },
                                        };
                                      })
                                    }
                                  />
                                  Enabled
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedStep.content.roles.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Roles ({selectedStep.content.roles.length})
                        </p>

                        {selectedStep.content.roles.length === 0 && (
                          <p className="text-xs text-gray-400">
                            No roles in this step.
                          </p>
                        )}

                        <div className="space-y-3">
                          {selectedStep.content.roles.map((role, idx) => (
                            <div
                              key={`${role.key}-${idx}`}
                              className="border border-gray-200 rounded-lg p-3"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                  value={role.key}
                                  disabled
                                  placeholder="Role key"
                                  className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-md px-2.5 py-2 text-sm cursor-not-allowed"
                                />
                                <input
                                  value={role.label}
                                  onChange={(e) =>
                                    updateSelectedStep((step) => {
                                      const nextRoles = [...step.content.roles];
                                      nextRoles[idx] = {
                                        ...nextRoles[idx],
                                        label: e.target.value,
                                      };
                                      return {
                                        ...step,
                                        content: {
                                          ...step.content,
                                          roles: nextRoles,
                                        },
                                      };
                                    })
                                  }
                                  placeholder="Role label"
                                  className="w-full border border-gray-200 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:border-blue-400"
                                />
                              </div>
                              <textarea
                                value={role.description}
                                onChange={(e) =>
                                  updateSelectedStep((step) => {
                                    const nextRoles = [...step.content.roles];
                                    nextRoles[idx] = {
                                      ...nextRoles[idx],
                                      description: e.target.value,
                                    };
                                    return {
                                      ...step,
                                      content: {
                                        ...step.content,
                                        roles: nextRoles,
                                      },
                                    };
                                  })
                                }
                                placeholder="Role description"
                                rows={2}
                                className="w-full border border-gray-200 rounded-md px-2.5 py-2 text-sm mt-3 focus:outline-none focus:border-blue-400"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          if (!selectedStep) return;
                          updateContentMutation.mutate(selectedStep);
                        }}
                        disabled={updateContentMutation.isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60"
                      >
                        {updateContentMutation.isPending
                          ? "Saving..."
                          : "Save Content"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
