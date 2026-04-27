"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Home, Trash2, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";

// ── Leaflet Map (dynamically imported — no SSR) ───────────────────────────────
const MapPicker = dynamic(() => import("@/components/mappicker/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-48 bg-blue-50 flex items-center justify-center text-sm text-gray-400">
      Loading map…
    </div>
  ),
});

// ── Section Wrapper ───────────────────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[12px] border border-gray-200 shadow-[1px_1px_4px_0px_#00000040] p-6 mb-4">
      <h2 className="text-base font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

// ── Field Label ───────────────────────────────────────────────────────────────
function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-xs text-gray-500 mb-1">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

// ── Photo type ────────────────────────────────────────────────────────────────
interface PhotoFile {
  id: string;
  url: string;
  name: string;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function EditListingPage() {
  // Basic Info
  const [propertyTitle, setPropertyTitle] = useState("Waqas Ahmed");
  const [details, setDetails] = useState(
    "I need this Property because i am a agent."
  );
  const [propertyType, setPropertyType] = useState("house");
  const [monthlyRent, setMonthlyRent] = useState("5794.50");
  const [currency, setCurrency] = useState("usd");

  // Location
  const [hideLocation, setHideLocation] = useState(false);
  const [streetAddress, setStreetAddress] = useState("123 main street");
  const [cityTown, setCityTown] = useState("Lordmark");
  const [island, setIsland] = useState("Aruba");
  const [pinConfirmed, setPinConfirmed] = useState(false);
  const [pinLocation, setPinLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Property Details
  const [bedrooms, setBedrooms] = useState("4");
  const [bathrooms, setBathrooms] = useState("2");
  const [squareFeet, setSquareFeet] = useState("3242");
  const [lotSize, setLotSize] = useState("0");
  const [yearBuilt, setYearBuilt] = useState("2020");
  const [parkingSpaces, setParkingSpaces] = useState("0");

  // Rental Terms
  const [leaseTerms, setLeaseTerms] = useState<string[]>(["12months"]);
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(false);
  const [furnished, setFurnished] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);

  // Amenities
  const amenitiesList = [
    { id: "airConditioning", label: "Air conditioning" },
    { id: "ceilingFans", label: "Ceiling fans" },
    { id: "hardwoodFloors", label: "Hardwood floors" },
    { id: "tileFloors", label: "Tile floors" },
    { id: "balcony", label: "Balcony" },
    { id: "yard", label: "Yard" },
    { id: "garage", label: "Garage" },
    { id: "washer", label: "Washer" },
    { id: "inUnitLaundry", label: "In-unit laundry" },
    { id: "heating", label: "Heating" },
    { id: "fireplace", label: "Fireplace" },
    { id: "carpet", label: "Carpet" },
    { id: "walkInClosets", label: "Walk-in closets" },
    { id: "patio", label: "Patio" },
    { id: "fencedYard", label: "Fenced yard" },
    { id: "driveway", label: "Driveway" },
    { id: "dryer", label: "Dryer" },
    { id: "dishwasher", label: "Dishwasher" },
    { id: "refrigerator", label: "Refrigerator" },
    { id: "ovenRange", label: "Oven or range" },
    { id: "microwave", label: "Microwave" },
    { id: "securitySystem", label: "Security system" },
  ];
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "airConditioning",
    "ceilingFans",
    "balcony",
    "yard",
    "carpet",
  ]);

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleLeaseTerm = (term: string) => {
    setLeaseTerms((prev) =>
      prev.includes(term) ? prev.filter((t) => t !== term) : [...prev, term]
    );
  };

  // HOA / Tax
  const [hoaFees, setHoaFees] = useState("000");
  const [propertyTax, setPropertyTax] = useState("800");
  const [parkingType, setParkingType] = useState("covered");

  // ── Photos ─────────────────────────────────────────────────────────────────
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newPhotos: PhotoFile[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        url: URL.createObjectURL(f),
        name: f.name,
      }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  return (
    <div className="">
      {/* ── Top Nav ── */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 ">
        <Link
          href="/listing"
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Home className="w-4 h-4" />
          Go to Home Page
        </Link>
      </div>

      <div className="container mx-auto">
        {/* ── Page Title ── */}
        <div className="my-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Rental Property
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Update a rental listing (5 properties)
          </p>
        </div>

        {/* ── Basic Information ── */}
        <Section title="Basic Information">
          <div className="mb-4">
            <FieldLabel>Property Title*</FieldLabel>
            <Input
              value={propertyTitle}
              onChange={(e) => setPropertyTitle(e.target.value)}
              className="h-10 text-sm border-gray-200"
            />
          </div>
          <div className="mb-4">
            <FieldLabel>Details</FieldLabel>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="text-sm border-gray-200 resize-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <FieldLabel required>Property Type</FieldLabel>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="h-10 text-sm border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel required>Monthly Rent</FieldLabel>
              <Input
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                className="h-10 text-sm border-gray-200"
              />
            </div>
            <div>
              <FieldLabel required>Preferred Currency</FieldLabel>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-10 text-sm border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD - US Dollar</SelectItem>
                  <SelectItem value="eur">EUR - Euro</SelectItem>
                  <SelectItem value="gbp">GBP - British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Section>

        {/* ── Location ── */}
        <Section title="Location">
          <div className="flex items-start gap-2 mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
            <Checkbox
              id="hideLocation"
              checked={hideLocation}
              onCheckedChange={(v) => setHideLocation(!!v)}
              className="mt-0.5"
            />
            <div>
              <Label htmlFor="hideLocation" className="text-sm font-medium text-gray-800 cursor-pointer">
                Hide exact location until a viewing is confirmed
              </Label>
              <p className="text-xs text-gray-400 mt-0.5">
                When enabled, the listing page shows a blurred map with &quot;Book an appointment to reveal&quot;. The exact map links are always included in confirmation emails.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <FieldLabel required>Street Address</FieldLabel>
            <Input
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              className="h-10 text-sm border-gray-200"
            />
            <p className="text-xs text-gray-400 mt-1">
              If there&apos;s no formal street number or nearby landmark works great.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <FieldLabel required>City/Town</FieldLabel>
              <Input value={cityTown} onChange={(e) => setCityTown(e.target.value)} className="h-10 text-sm border-gray-200" />
            </div>
            <div>
              <FieldLabel required>Island</FieldLabel>
              <Input value={island} onChange={(e) => setIsland(e.target.value)} className="h-10 text-sm border-gray-200" />
            </div>
          </div>

          {/* ── Leaflet Map ── */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pinLocation"
                  checked={!!pinLocation}
                  onCheckedChange={() => { if (pinLocation) setPinLocation(null); }}
                />
                <Label htmlFor="pinLocation" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Pin Location (Required)
                </Label>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {pinLocation && (
                  <span className="text-green-600 font-medium">
                    {pinLocation.lat.toFixed(4)}, {pinLocation.lng.toFixed(4)}
                  </span>
                )}
                <button
                  onClick={() => setPinLocation(null)}
                  className="flex items-center gap-1 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear Pin
                </button>
              </div>
            </div>

            {/* Leaflet map rendered here */}
            <MapPicker pin={pinLocation} onPinChange={setPinLocation} />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Checkbox
              id="mapAccurate"
              checked={pinConfirmed}
              onCheckedChange={(v) => setPinConfirmed(!!v)}
            />
            <Label htmlFor="mapAccurate" className="text-xs text-gray-500 cursor-pointer">
              The map pin above accurately shows the property location.
              <br />
              Required before you can publish this listing.
            </Label>
          </div>
        </Section>

        {/* ── Property Details ── */}
        <Section title="Property Details">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <FieldLabel>Bedrooms</FieldLabel>
              <Input value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="h-10 text-sm border-gray-200" />
            </div>
            <div>
              <FieldLabel>Bathrooms</FieldLabel>
              <Input value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="h-10 text-sm border-gray-200" />
            </div>
            <div>
              <FieldLabel>Square Feet</FieldLabel>
              <Input value={squareFeet} onChange={(e) => setSquareFeet(e.target.value)} className="h-10 text-sm border-gray-200" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <FieldLabel>Lot Size (sq ft)</FieldLabel>
              <Input value={lotSize} onChange={(e) => setLotSize(e.target.value)} className="h-10 text-sm border-gray-200" />
            </div>
            <div>
              <FieldLabel>Year Built</FieldLabel>
              <Input value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} className="h-10 text-sm border-gray-200" />
            </div>
            <div>
              <FieldLabel>Parking Spaces</FieldLabel>
              <Input value={parkingSpaces} onChange={(e) => setParkingSpaces(e.target.value)} className="h-10 text-sm border-gray-200" />
            </div>
          </div>
        </Section>

        {/* ── Rental Terms ── */}
        <Section title="Rental Terms*">
          <p className="text-xs text-gray-500 mb-3">Lease Term (Select all that apply)</p>
          <div className="flex flex-col gap-2 mb-4">
            {[
              { id: "monthToMonth", label: "Month to Month" },
              { id: "6months", label: "6 months" },
              { id: "12months", label: "12 months" },
              { id: "other", label: "Other" },
            ].map((term) => (
              <div key={term.id} className="flex items-center gap-2">
                <Checkbox id={term.id} checked={leaseTerms.includes(term.id)} onCheckedChange={() => toggleLeaseTerm(term.id)} />
                <Label htmlFor={term.id} className="text-sm text-gray-700 cursor-pointer">{term.label}</Label>
              </div>
            ))}
          </div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Additional</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox id="utilities" checked={utilitiesIncluded} onCheckedChange={(v) => setUtilitiesIncluded(!!v)} />
              <Label htmlFor="utilities" className="text-sm text-gray-700 cursor-pointer">Utilities Included</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="furnished" checked={furnished} onCheckedChange={(v) => setFurnished(!!v)} />
              <Label htmlFor="furnished" className="text-sm text-gray-700 cursor-pointer">Furnished</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="petFriendly" checked={petFriendly} onCheckedChange={(v) => setPetFriendly(!!v)} />
              <Label htmlFor="petFriendly" className="text-sm text-gray-700 cursor-pointer">Pet Friendly</Label>
            </div>
          </div>
        </Section>

        {/* ── Amenities ── */}
        <Section title="Amenities">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {amenitiesList.map((amenity) => (
              <div key={amenity.id} className="flex items-center gap-2">
                <Checkbox
                  id={amenity.id}
                  checked={selectedAmenities.includes(amenity.id)}
                  onCheckedChange={() => toggleAmenity(amenity.id)}
                />
                <Label htmlFor={amenity.id} className="text-sm text-gray-700 cursor-pointer">
                  {amenity.label}
                </Label>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <FieldLabel>Parking Type</FieldLabel>
            <Select value={parkingType} onValueChange={setParkingType}>
              <SelectTrigger className="h-10 text-sm border-gray-200 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="covered">Covered Parking</SelectItem>
                <SelectItem value="street">Street Parking</SelectItem>
                <SelectItem value="garage">Garage</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <FieldLabel>HOA Fees (monthly)</FieldLabel>
              <Input value={hoaFees} onChange={(e) => setHoaFees(e.target.value)} className="h-10 text-sm border-gray-200" />
            </div>
            <div>
              <FieldLabel>Property Tax (Annual)</FieldLabel>
              <Input value={propertyTax} onChange={(e) => setPropertyTax(e.target.value)} className="h-10 text-sm border-gray-200" />
            </div>
          </div>
        </Section>

        {/* ── Photos ── */}
        <Section title="Photos*">
          <p className="text-xs text-gray-400 mb-3">
            The first image will be primary (shown above at listings). Drag images to reorder.
          </p>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />

          {/* Upload Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 cursor-pointer transition-all ${
              dragOver
                ? "border-[#DF2634] bg-red-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Upload className={`w-5 h-5 mx-auto mb-2 transition-colors ${dragOver ? "text-[#DF2634]" : "text-gray-400"}`} />
            <p className="text-sm font-medium text-gray-600">
              {dragOver ? "Drop images here" : "Upload Photos"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Click to browse or drag & drop — JPG, PNG, WEBP
            </p>
          </div>

          {/* Photo Previews Grid */}
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group shadow-sm"
                >
                  {/* Real image preview */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Primary label on first image */}
                  {idx === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5 font-semibold tracking-wide">
                      PRIMARY
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Action Buttons ── */}
        <div className="flex items-center justify-between mt-2 mb-8">
          <Button
            variant="outline"
            className="px-8 h-10 text-sm border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button className="px-8 h-10 text-sm bg-[#DF2634] hover:bg-[#c41f2c] text-white">
            Share Next to Live
          </Button>
        </div>
      </div>
    </div>
  );
}