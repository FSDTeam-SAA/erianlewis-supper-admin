"use client";

import React from "react";
import CommendCenter from "./_components/CommendCenter";
import AbandonedSignups from "./_components/AbandonedSignups";
import RecentPlatformActivity from "./_components/RecentPlatformActivity";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <Skeleton className="h-10 w-56" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

function Page() {
  const { data: session, status } = useSession();
  const token = session?.user?.accessToken;

  const { data: commandCenterData, isLoading } = useQuery({
    queryKey: ["commend-data", token],
    enabled: status === "authenticated" && !!token,
    queryFn: async () => {
      if (!token) {
        throw new Error("User token not found");
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/command-centre`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch command center data");
      }

      const json = await res.json();
      return json.data;
    },
  });

  if (status === "loading") return <DashboardSkeleton />;
  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="container mx-auto">
      <CommendCenter summary={commandCenterData?.summary} listings={commandCenterData?.listings} />
      <AbandonedSignups
        subscriptionBreakdown={commandCenterData?.subscriptionBreakdown}
        listingsByIsland={commandCenterData?.listingsByIsland}
        accountsByIsland={commandCenterData?.accountsByIsland}
      />
      <RecentPlatformActivity recentActivity={commandCenterData?.recentActivity} />
    </div>
  );
}

export default Page;
