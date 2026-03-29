/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";

interface Props {
  pin: { lat: number; lng: number } | null;
  onPinChange: (pin: { lat: number; lng: number } | null) => void;
}

export default function MapPicker({ pin, onPinChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const initializedRef = useRef(false); // guard against StrictMode double-call

  useEffect(() => {
    // Prevent double-init (React StrictMode runs effects twice in dev)
    if (initializedRef.current) return;
    if (!containerRef.current) return;

    initializedRef.current = true;

    let map: any = null;

    import("leaflet").then((L) => {
      // Guard: container may already have a Leaflet instance (HMR / SSR edge cases)
      if ((containerRef.current as any)?._leaflet_id) return;
      if (!containerRef.current) return;

      // Fix Leaflet default icon path broken by webpack
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      map = L.map(containerRef.current, {
        center: [17.12, -61.85], // Caribbean / Aruba area
        zoom: 5,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Click on map → drop/move pin
      map.on("click", (e: any) => {
        onPinChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    });

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
      initializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync pin prop → marker on map
  useEffect(() => {
    if (!mapRef.current) return;

    import("leaflet").then((L) => {
      if (!mapRef.current) return;

      if (pin) {
        if (markerRef.current) {
          // Move existing marker
          markerRef.current.setLatLng([pin.lat, pin.lng]);
        } else {
          // Create new marker
          markerRef.current = L.marker([pin.lat, pin.lng], {
            draggable: true,
          })
            .addTo(mapRef.current)
            .bindPopup("📍 Property Location")
            .openPopup();

          // Allow dragging the marker to adjust pin
          markerRef.current.on("dragend", (e: any) => {
            const { lat, lng } = e.target.getLatLng();
            onPinChange({ lat, lng });
          });
        }
        mapRef.current.setView(
          [pin.lat, pin.lng],
          Math.max(mapRef.current.getZoom(), 10),
          { animate: true },
        );
      } else {
        // Clear marker
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  return (
    <>
      {/* Leaflet CSS loaded once */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      {/* Map container */}
      <div ref={containerRef} className="h-52 w-full" style={{ zIndex: 0 }} />

      {/* Helper hint */}
      {!pin && (
        <div className="px-3 py-2 bg-amber-50 border-t border-amber-100 text-xs text-amber-700 flex items-center gap-1.5">
          <span>👆</span>
          Click anywhere on the map to drop a pin. You can drag it to fine-tune
          the location.
        </div>
      )}
      {pin && (
        <div className="px-3 py-2 bg-green-50 border-t border-green-100 text-xs text-green-700 flex items-center gap-1.5">
          <span>✅</span>
          Pin set at {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)} — drag the
          marker to adjust.
        </div>
      )}
    </>
  );
}
