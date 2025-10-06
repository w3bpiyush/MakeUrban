"use client";

import React from "react";
import { LayerGroup, Rectangle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface AerosolPrediction {
  lat: number;
  lon: number;
  predicted_aerosol: number;
  year: number;
}

interface MapLayersProps {
  aerosolData: AerosolPrediction[];
  year: number;
}

const getAerosolColor = (
  value: number,
  min: number,
  max: number,
  year: number,
  baseYear = 2025
) => {
  const minHueStart = min > 40 ? 60 : 120;

  const maxHueStart = max > 60 ? 10 : 20;


  const minFactor = Math.min(min / 100, 1);
  const maxFactor = Math.min(max / 100, 1);


  const minHue = minHueStart - minFactor * (min > 40 ? 30 : 60);


  const maxHue = maxHueStart - maxFactor * maxHueStart;


  const range = max - min || 1;
  const normValue = (value - min) / range;


  let hue = minHue + normValue * (maxHue - minHue);

  const yearShift = Math.min((year - baseYear) * 5, 60); 
  hue = Math.max(0, hue - yearShift);


  const yearFactor = Math.min((year - baseYear) * 0.05, 0.5);
  const saturation = 100 - yearFactor * 100;

  return `hsl(${hue}, ${saturation}%, 50%)`;
};



const MapLayersComponent: React.FC<MapLayersProps> = ({ aerosolData, year }) => {
  if (!aerosolData?.length) return null;
  console.log("Rendering aerosol data:", aerosolData);

  const rectangleSize = 0.005;
  const aerosols = aerosolData.map(p => p.predicted_aerosol);
  const minAerosol = Math.min(...aerosols);
  const maxAerosol = Math.max(...aerosols);

  return (
    <LayerGroup>
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
              stroke: false
              
            }}
          />
        );
      })}
    </LayerGroup>
  );
};

export default MapLayersComponent;
