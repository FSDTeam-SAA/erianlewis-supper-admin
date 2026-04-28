/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  MapPin,
  Calendar,
  Bed,
  Bath,
  Square,
  DollarSign,
} from "lucide-react";
import Image from "next/image";

interface ViewListingModalProps {
  id: string;
  triggerText?: string;
}

export function ViewListingModal({
  id,
  triggerText = "View",
}: ViewListingModalProps) {
  const [open, setOpen] = React.useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["singleListing", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/rental-properties/${id}`,
      );
      if (!res.ok) throw new Error("Failed to fetch listing");
      return res.json();
    },
    enabled: !!id && open, // Only fetch when modal is open
  });

  const listing = data?.data;

  if (error) {
    return <p className="text-red-500">Error loading listing</p>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-red-500 font-semibold text-sm hover:underline">
          {triggerText}
        </button>
      </DialogTrigger>

      <DialogContent className="!max-w-4xl p-0 overflow-hidden rounded-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white border-b z-10 px-6 py-4 flex items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            Property Details
          </DialogTitle>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </DialogHeader>

        {isLoading ? (
          <div className="p-12 text-center">Loading property details...</div>
        ) : !listing ? (
          <div className="p-12 text-center text-red-500">
            Property not found
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {/* Photos Gallery */}
            {listing.photos && listing.photos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {listing.photos.map((photo: any, index: number) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden border"
                    >
                      <Image
                        src={photo.url}
                        alt={photo.originalName || `Photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="bg-white border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Property Title</p>
                  <p className="font-medium">
                    {listing.basicInformation?.propertyTitle}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Property Type</p>
                  <p className="font-medium">
                    {listing.basicInformation?.propertyType?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monthly Rent</p>
                  <p className="font-medium flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {listing.basicInformation?.monthlyRent?.toLocaleString()}{" "}
                    {listing.basicInformation?.preferredCurrency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium capitalize text-green-600">
                    {listing.status}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-1">Details</p>
                <p className="text-gray-700 leading-relaxed">
                  {listing.basicInformation?.details}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Street Address</p>
                  <p className="font-medium">
                    {listing.address?.streetNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium">{listing.address?.cityTown}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Island</p>
                  <p className="font-medium">
                    {listing.address?.island?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Address</p>
                  <p className="font-medium">{listing.location?.address}</p>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Property Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <Bed className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Bedrooms</p>
                    <p className="font-semibold">
                      {listing.propertyDetails?.bedrooms}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Bath className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Bathrooms</p>
                    <p className="font-semibold">
                      {listing.propertyDetails?.bathrooms}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Square className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Square Feet</p>
                    <p className="font-semibold">
                      {listing.propertyDetails?.squareFeet}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year Built</p>
                  <p className="font-semibold">
                    {listing.propertyDetails?.yearBuilt || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Rental Terms & Amenities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Rental Terms</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utilities Included</span>
                    <span
                      className={
                        listing.rentalTerms?.additional?.utilitiesIncluded
                          ? "text-green-600"
                          : "text-red-500"
                      }
                    >
                      {listing.rentalTerms?.additional?.utilitiesIncluded
                        ? "Yes"
                        : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Furnished</span>
                    <span
                      className={
                        listing.rentalTerms?.additional?.furnished
                          ? "text-green-600"
                          : "text-red-500"
                      }
                    >
                      {listing.rentalTerms?.additional?.furnished
                        ? "Yes"
                        : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pet Friendly</span>
                    <span
                      className={
                        listing.rentalTerms?.additional?.petFriendly
                          ? "text-green-600"
                          : "text-red-500"
                      }
                    >
                      {listing.rentalTerms?.additional?.petFriendly
                        ? "Yes"
                        : "No"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities?.amenities?.length > 0 ? (
                    listing.amenities.amenities.map(
                      (amenity: string, i: number) => (
                        <span
                          key={i}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {amenity}
                        </span>
                      ),
                    )
                  ) : (
                    <p className="text-gray-500">No amenities listed</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-xs text-gray-500 flex items-center gap-4 border-t pt-6">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created: {formatDate(listing.createdAt)}
              </div>
              <div>Views: {listing.views || 0}</div>
              <div>
                Status:{" "}
                <span className="capitalize font-medium">{listing.status}</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper function
const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
