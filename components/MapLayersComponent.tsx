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
  year: number;
}

const getAerosolColor = (
  value: number,
  min: number,
  max: number,
  year: number,
  baseYear = 2025
) => {
  // If min exceeds 40, no green: start minHue from yellow (60 degrees)
  const minHueStart = min > 40 ? 60 : 120;

  // If max exceeds 60, no orange/yellow: maxHue start closer to red (10 degrees)
  const maxHueStart = max > 60 ? 10 : 20;

  // Normalize min and max factors (scaled 0 to 1)
  const minFactor = Math.min(min / 100, 1);
  const maxFactor = Math.min(max / 100, 1);

  // Adjust minHue: shift from green/yellow based on minFactor
  const minHue = minHueStart - minFactor * (min > 40 ? 30 : 60);

  // Adjust maxHue: shift from orange/red to pure red based on maxFactor
  const maxHue = maxHueStart - maxFactor * maxHueStart;

  // Calculate normalized value within range (avoid division by zero)
  const range = max - min || 1;
  const normValue = (value - min) / range;

  // Interpolate hue between minHue and maxHue
  let hue = minHue + normValue * (maxHue - minHue);

  // Add year shift pushing overall hue closer to red (0 degree)
  // Year factor capped at 1, adjust multiplier for speed of red shift
  const yearShift = Math.min((year - baseYear) * 5, 60); // max shift 60 degrees towards red
  hue = Math.max(0, hue - yearShift);

  // Optionally adjust saturation (reduce at higher years for subtle effect)
  const yearFactor = Math.min((year - baseYear) * 0.05, 0.5);
  const saturation = 100 - yearFactor * 100;

  return `hsl(${hue}, ${saturation}%, 50%)`;
};



const MapLayersComponent: React.FC<MapLayersProps> = ({ aerosolData, lat, long, year }) => {
  if (!aerosolData?.length) return null;
  console.log("Rendering aerosol data:", aerosolData);

  const aerosolBox = getBoundingBox(lat, long, 2);
  const circleOptions = { color: "green", fillOpacity: 0.1 };
  const rectangleSize = 0.005;
  const aerosols = aerosolData.map(p => p.predicted_aerosol);
const minAerosol = Math.min(...aerosols);
const maxAerosol = Math.max(...aerosols);

  return (
    <LayerGroup>
      {/* Large circle around the center */}
      <Circle
        center={[aerosolBox.center.lat, aerosolBox.center.lng]}
        pathOptions={circleOptions}
        radius={7000} // meters
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
              color: getAerosolColor(item.predicted_aerosol, minAerosol, maxAerosol, year),
              fillOpacity: 0.4,
              
            }}
          />
        );
      })}
    </LayerGroup>
  );
};

export default MapLayersComponent;
