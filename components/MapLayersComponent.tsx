"use client";

import React from "react";
import { LayerGroup, Circle, Rectangle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getBoundingBox } from "@/lib/coordsUtils";

interface AerosolPrediction {
  lat: number;
  lon: number;
  predicted_aerosol: number;
  year: number;
}

interface MapLayersProps {
  aerosolData: AerosolPrediction[];
  lat: number;
  long: number;
}

const getAerosolColor = (value: number) => {
  if (value <= 40) return "green";
  if (value <= 50) return "yellow";
  return "red";
};

const MapLayersComponent: React.FC<MapLayersProps> = ({ aerosolData, lat, long }) => {
  if (!aerosolData?.length) return null;

  const aerosolBox = getBoundingBox(lat, long, 2);
  const circleOptions = { color: "lightgreen", fillOpacity: 0.1 };
  const rectangleSize = 0.0075;

  return (
    <LayerGroup>
      {/* Large circle around the center */}
      <Circle
        center={[aerosolBox.center.lat, aerosolBox.center.lng]}
        pathOptions={circleOptions}
        radius={4500} // meters
      />

      {/* Rectangles for aerosol predictions */}
      {aerosolData.map((item, idx) => {
        const bounds: [[number, number], [number, number]] = [
          [item.lat - rectangleSize, item.lon - rectangleSize],
          [item.lat + rectangleSize, item.lon + rectangleSize],
        ];

        return (
          <Rectangle
            key={idx}
            bounds={bounds}
            pathOptions={{
              color: getAerosolColor(item.predicted_aerosol),
              fillOpacity: 0.4,
              weight: 1,
            }}
          />
        );
      })}
    </LayerGroup>
  );
};

export default MapLayersComponent;
