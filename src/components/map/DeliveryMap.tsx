"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface SimpleMapProps {
  position: [number, number]; // Customer
  riderPosition?: [number, number] | null; // Rider
  zoom?: number;
}

/* ---------- Fix map size inside modal ---------- */
const FixMapSize = () => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
};

/* ---------- Fit map bounds ---------- */
const FitBounds = ({
  customerPos,
  riderPos,
  myPos,
}: {
  customerPos: [number, number];
  riderPos?: [number, number] | null;
  myPos?: [number, number] | null;
}) => {
  const map = useMap();

  useEffect(() => {
    const points: L.LatLngExpression[] = [customerPos];

    if (riderPos) points.push(riderPos);
    if (myPos) points.push(myPos);

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    } else {
      map.setView(customerPos, 13);
    }
  }, [map, customerPos, riderPos, myPos]);

  return null;
};

/* ---------- Distance function ---------- */
function getDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const SimpleMap: React.FC<SimpleMapProps> = ({
  position,
  riderPosition,
  zoom = 13,
}) => {
  /* ---------- My Location ---------- */
  const [myPosition, setMyPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyPosition([
          pos.coords.latitude,
          pos.coords.longitude,
        ]);
      },
      (err) => {
        console.error("Location error:", err);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  /* ---------- Icons ---------- */
  const customerIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
  });

  const riderIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  const myIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149060.png",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });

  /* ---------- Distance ---------- */
  const riderDistance = riderPosition
    ? getDistanceInKm(
        riderPosition[0],
        riderPosition[1],
        position[0],
        position[1]
      )
    : null;

  const myDistance = myPosition
    ? getDistanceInKm(
        myPosition[0],
        myPosition[1],
        position[0],
        position[1]
      )
    : null;

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
      >
        <FixMapSize />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* ---------- Customer ---------- */}
        <Marker position={position} icon={customerIcon}>
          <Popup>
            <b style={{ color: "#dc2626" }}>📍 Customer Location</b>
          </Popup>
        </Marker>

        {/* ---------- Rider ---------- */}
        {riderPosition && (
          <>
            <Marker position={riderPosition} icon={riderIcon}>
              <Popup>
                <b style={{ color: "#2563eb" }}>🏍️ Rider Location</b>
                {riderDistance && (
                  <p style={{ marginTop: 6 }}>
                    Distance: {riderDistance.toFixed(2)} km
                  </p>
                )}
              </Popup>
            </Marker>

            <Polyline
              positions={[riderPosition, position]}
              color="#6366f1"
              weight={3}
              dashArray="8, 8"
            />
          </>
        )}

        {/* ---------- My Location ---------- */}
        {myPosition && (
          <>
            <Marker position={myPosition} icon={myIcon}>
              <Popup>
                <b style={{ color: "#16a34a" }}>🧍 Your Location</b>
                {myDistance && (
                  <p style={{ marginTop: 6 }}>
                    Distance: {myDistance.toFixed(2)} km
                  </p>
                )}
              </Popup>
            </Marker>

            <Polyline
              positions={[myPosition, position]}
              color="#16a34a"
              weight={2}
              opacity={0.6}
            />
          </>
        )}

        {/* ---------- Fit All Markers ---------- */}
        <FitBounds
          customerPos={position}
          riderPos={riderPosition}
          myPos={myPosition}
        />
      </MapContainer>
    </div>
  );
};

export default SimpleMap;
