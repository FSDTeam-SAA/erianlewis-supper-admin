"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function IslandEditDialog({ id }: { id?: string }) {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const updateIslad = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/islands/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to update island");
      }
      return json;
    },
    onSuccess: () => {
      toast.success("Island updated successfully");
      queryClient.invalidateQueries({ queryKey: ["island-data"] });
      queryClient.invalidateQueries({ queryKey: ["island-overview"] });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const { data: singleIsland, isLoading: isSingleIslandLoading } = useQuery({
    queryKey: ["singleIsland", id],
    enabled: open && !!id && !!token,
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/islands/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch island");
      }
      return json.data as { _id: string; name: string };
    },
  });

  useEffect(() => {
    if (singleIsland?.name) {
      setName(singleIsland.name);
    }
  }, [singleIsland?.name]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || !id) return;
    updateIslad.mutate(trimmedName);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-black hover:bg-gray-50 bg-[#F3F4F6] h-[40px] w-[40px] p-0 flex-shrink-0"
          aria-label="Edit island"
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="overflow-hidden p-0 sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-gray-100 bg-gray-50 px-6 py-5">
            <DialogTitle className="text-xl font-semibold text-gray-950">Edit Island</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Update the island name for your platform data.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="px-6 py-6">
            <Field>
              <Label htmlFor="island-name" className="text-sm font-medium text-gray-800">
                Island Name
              </Label>
              <Input
                id="island-name"
                name="islandName"
                placeholder="Enter island name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isSingleIslandLoading || updateIslad.isPending}
                className="mt-2 h-12 border-gray-200 bg-white text-base focus-visible:ring-1 focus-visible:ring-red-400"
              />
              {isSingleIslandLoading && (
                <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading island...
                </p>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className="border-t border-gray-100 bg-gray-50 px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="h-11 px-5">
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              disabled={isSingleIslandLoading || updateIslad.isPending || !name.trim()}
              className="h-11 bg-[#DC2626] px-5 text-white hover:bg-red-600"
            >
              {updateIslad.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
