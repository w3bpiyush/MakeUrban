// Convert kilometers to degrees latitude
const kmToDeg = (km: number) => km / 111;

/**
 * Returns a bounding box around a point with specified increments in km
 */
export const increaseLatLng = (
  lat: number,
  lng: number,
  incrementLatKm = 5,
  incrementLngKm = 5
): { latStart: number; latEnd: number; lngStart: number; lngEnd: number } => {
  const latIncrement = kmToDeg(incrementLatKm);
  const lngIncrement = kmToDeg(incrementLngKm) / Math.cos((lat * Math.PI) / 180);

  return {
    latStart: lat - latIncrement / 2,
    latEnd: lat + latIncrement / 2,
    lngStart: lng - lngIncrement / 2,
    lngEnd: lng + lngIncrement / 2,
  };
};

/**
 * Returns a bounding box and center around a point with specified radius in km
 */
export const getBoundingBox = (
  lat: number,
  lng: number,
  radiusKm = 8
): {
  latStart: number;
  latEnd: number;
  lngStart: number;
  lngEnd: number;
  center: { lat: number; lng: number };
} => {
  const latOffset = kmToDeg(radiusKm);
  const lngOffset = kmToDeg(radiusKm) / Math.cos((lat * Math.PI) / 180);

  return {
    latStart: lat - latOffset,
    latEnd: lat + latOffset,
    lngStart: lng - lngOffset,
    lngEnd: lng + lngOffset,
    center: { lat, lng },
  };
};
