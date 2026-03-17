const MAPBOX_KEY = process.env.EXPO_PUBLIC_MAPBOX_KEY ?? "";

export type Coordinates = { latitude: number; longitude: number };

export type GeocodeResult = {
  id: string;
  place_name: string;
  center: [number, number];
};

export type RouteResult = {
  distance: number;
  duration: number;
  coordinates: Coordinates[];
};

const GEOCODER_COUNTRY = "in";
const GEOCODER_BBOX = "76.8381,28.4042,77.3485,28.8835";
const DELHI_CENTER = "77.2090,28.6139";

export async function geocodePlace(query: string): Promise<GeocodeResult[]> {
  if (!query.trim() || !MAPBOX_KEY) return [];
  const encoded = encodeURIComponent(query);
  const url = [
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json`,
    `?access_token=${MAPBOX_KEY}`,
    `&limit=5`,
    `&types=place,address,poi,locality,neighborhood`,
    `&country=${GEOCODER_COUNTRY}`,
    `&bbox=${GEOCODER_BBOX}`,
    `&proximity=${DELHI_CENTER}`,
    `&language=en`,
  ].join("");
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.features ?? []).map((f: any) => ({
    id: f.id,
    place_name: f.place_name,
    center: f.center,
  }));
}

export async function getRoute(
  origin: Coordinates,
  destination: Coordinates
): Promise<RouteResult | null> {
  if (!MAPBOX_KEY) return null;
  const coords = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?access_token=${MAPBOX_KEY}&geometries=geojson&overview=full`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.routes?.length) return null;
  const route = data.routes[0];
  return {
    distance: route.distance,
    duration: route.duration,
    coordinates: route.geometry.coordinates.map(([lng, lat]: [number, number]) => ({
      latitude: lat,
      longitude: lng,
    })),
  };
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}
