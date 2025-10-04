"use client"
import { MapContainer, TileLayer, useMapEvents, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import React, { useState } from "react";
import L from "leaflet";

interface MapProps {
  lat: number;
  long: number;
  zoom: number;
  onLocationChange?: (latlng: L.LatLng) => void;
}

import type { LatLng } from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
});

function LocationMarker({ onLocationChange }: { onLocationChange?: (latlng: L.LatLng) => void }) {
  const [position, setPosition] = useState<LatLng | null>(null)
  const map = useMapEvents({
    click() {
      map.locate()  // trigger browser geolocation on click
    },
    locationfound(e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, map.getZoom()) // smoothly center map to found location
      if (onLocationChange) onLocationChange(e.latlng);
    },
  })

    return position ? <Marker position={position} icon={markerIcon} /> : null;
}

const MapComponent = ({ lat, long, zoom, onLocationChange }: MapProps) => {
  const [center, setCenter] = useState<[number, number]>([lat, long]);

  return (
    <MapContainer center={center} zoom={zoom} className="h-screen w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onLocationChange={onLocationChange} />
    </MapContainer>
  );
};

export default MapComponent;
