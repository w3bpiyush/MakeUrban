"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapLayersComponent from "./MapLayersComponent";

interface Aerosol {
  lat: number;
  lon: number;
  predicted_aerosol: number;
  year: number;
}

interface MapProps {
  lat: number;
  long: number;
  zoom: number;
  aerosolData?: Aerosol[];
  year:number;
}

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
});

const FlyMarker: React.FC<{ lat: number; long: number }> = ({ lat, long }) => {
  const map = useMap();
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useEffect(() => {
    const newPos = new L.LatLng(lat, long);
    setPosition(newPos);
    map.flyTo(newPos, map.getZoom());
  }, [lat, long, map]);

  return position ? <Marker position={position} icon={markerIcon} /> : null;
};

const MapComponent = ({
  lat,
  long,
  zoom,
  aerosolData = [],
  year =new Date().getFullYear(),
}: MapProps) => {
  return (
    <MapContainer center={[lat, long]} zoom={zoom} className="h-screen w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapLayersComponent aerosolData={aerosolData} year={year} />
      <FlyMarker lat={lat} long={long} />
    </MapContainer>
  );
};

export default MapComponent;
