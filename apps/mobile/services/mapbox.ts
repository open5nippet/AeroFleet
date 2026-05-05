import Constants from "expo-constants";

export type Coordinates = { latitude: number; longitude: number };

export type GeocodeResult = {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
};

export type RouteResult = {
  distance: number;
  duration: number;
  coordinates: Coordinates[];
};

// ─── Backend URL resolution ───────────────────────────────────────────────────
// Strategy:
//   1. Use EXPO_PUBLIC_API_URL if explicitly set and looks like a real address
//   2. Auto-derive from Expo dev server host (so physical devices always connect)
//   3. Fall back to localhost (for simulators / web)

function getApiBase(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  // Use the env var only if it looks like a real IP/hostname (not a placeholder)
  if (envUrl && !envUrl.includes("192.168.1.10")) {
    return envUrl.replace(/\/+$/, "");
  }

  // Expo injects the dev-server host (e.g. "10.18.24.92:8081") into all clients.
  // Extracting just the IP and appending port 3000 gives us the backend.
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).manifest?.debuggerHost ??
    (Constants as any).manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const ip = hostUri.split(":")[0];
    console.log(`[API] Derived backend IP from Expo hostUri: ${ip}`);
    return `http://${ip}:3000/api`;
  }

  // Web browser fallback
  if (typeof window !== "undefined" && window.location) {
    return `http://${window.location.hostname}:3000/api`;
  }

  return "http://localhost:3000/api";
}

function apiUrl(pathname: string): string {
  const base = getApiBase();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

// ─── Geocoding — via backend (Google Places API key is server-side) ───────────
const DEFAULT_COUNTRY = process.env.EXPO_PUBLIC_LOCATION_COUNTRY ?? "in";
const DEFAULT_BBOX =
  process.env.EXPO_PUBLIC_LOCATION_BBOX ?? "76.8381,28.4042,77.3485,28.8835";

/**
 * Geocode a place name via the backend proxy (which calls Google Places API).
 * The API key never leaves the server.
 */
export async function geocodePlace(query: string): Promise<GeocodeResult[]> {
  if (!query.trim() || query.trim().length < 2) return [];

  const url = apiUrl("/mapbox/geocode");

  try {
    console.log(`[Geocode] Calling: ${url}  query="${query}"`);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: query.trim(),
        country: DEFAULT_COUNTRY,
        bbox: DEFAULT_BBOX,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[Geocode] Backend error ${res.status}: ${body}`);
      return [];
    }

    const data = await res.json();
    return data.results ?? [];
  } catch (error) {
    console.error(`[Geocode] Request failed (url=${url}):`, error);
    return [];
  }
}

// ─── Routing — via backend (Mapbox secret key is server-side) ─────────────────

/**
 * Get a driving route between two coordinates via the backend Mapbox proxy.
 */
export async function getRoute(
  origin: Coordinates,
  destination: Coordinates
): Promise<RouteResult | null> {
  const url = apiUrl("/mapbox/route");

  try {
    console.log(`[Route] Calling: ${url}`);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originLat: origin.latitude,
        originLng: origin.longitude,
        destLat: destination.latitude,
        destLng: destination.longitude,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[Route] Backend error ${res.status}: ${body}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error(`[Route] Request failed (url=${url}):`, error);
    return null;
  }
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

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
