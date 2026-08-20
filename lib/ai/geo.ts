import "server-only";

/**
 * OpenStreetMap grounding: free and keyless, so the guide can name real places
 * with real distances instead of trusting the model's geography.
 *
 * Both services are best-effort — every failure returns null/empty and the
 * pipeline falls back to model knowledge alone.
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
/** Nominatim's usage policy requires identifying the application. */
const USER_AGENT =
  "seazone-guest-guide/1.0 (+https://github.com/seazone/guest-guide)";
const NOMINATIM_TIMEOUT_MS = 8_000;
/** Overpass is slower than Nominatim, especially under load. */
const OVERPASS_TIMEOUT_MS = 12_000;
const SEARCH_RADIUS_M = 2500;

export type GeoPoint = { lat: number; lon: number };

export type PoiCategory =
  | "restaurants"
  | "attractions"
  | "pharmacies"
  | "supermarkets"
  | "hospitals";

export type Poi = {
  name: string;
  /** Straight-line distance, pre-formatted in pt-BR ("≈ 1,2 km"). */
  distance: string;
  meters: number;
};

export type NearbyPois = Record<PoiCategory, Poi[]>;

/** How many candidates per category reach the prompt. */
const CATEGORY_LIMITS: Record<PoiCategory, number> = {
  restaurants: 12,
  attractions: 10,
  pharmacies: 3,
  supermarkets: 3,
  hospitals: 2,
};

export function emptyPois(): NearbyPois {
  return {
    restaurants: [],
    attractions: [],
    pharmacies: [],
    supermarkets: [],
    hospitals: [],
  };
}

export function hasPois(pois: NearbyPois): boolean {
  return Object.values(pois).some((list) => list.length > 0);
}

/** Address → coordinates. Returns null when nothing matches or on failure. */
export async function geocodeAddress(query: string): Promise<GeoPoint | null> {
  const url = `${NOMINATIM_URL}?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;

  const results = await fetchJson<NominatimResult[]>(url, NOMINATIM_TIMEOUT_MS);
  const first = Array.isArray(results) ? results[0] : undefined;
  if (!first) return null;

  const lat = Number(first.lat);
  const lon = Number(first.lon);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
}

/**
 * Named POIs around a point, grouped by category, nearest first. Returns empty
 * lists when Overpass is unavailable.
 */
export async function fetchNearbyPois(
  lat: number,
  lon: number,
): Promise<NearbyPois> {
  const payload = await fetchJson<OverpassResponse>(
    OVERPASS_URL,
    OVERPASS_TIMEOUT_MS,
    { method: "POST", body: overpassQuery(lat, lon) },
  );

  const elements = payload?.elements;
  if (!Array.isArray(elements)) return emptyPois();

  const grouped = emptyPois();
  const seen = new Set<string>();

  for (const element of elements) {
    const name = element.tags?.name?.trim();
    if (!name) continue; // unnamed features are useless in a guide

    const category = categorize(element.tags);
    if (!category) continue;

    const key = `${category}:${name.toLowerCase()}`;
    if (seen.has(key)) continue; // OSM splits some venues across nodes/ways
    seen.add(key);

    const point = element.center ?? coordsOf(element);
    if (!point) continue;

    const meters = haversineMeters({ lat, lon }, point);
    grouped[category].push({ name, meters, distance: formatDistance(meters) });
  }

  for (const category of Object.keys(grouped) as PoiCategory[]) {
    grouped[category] = grouped[category]
      .sort((a, b) => a.meters - b.meters)
      .slice(0, CATEGORY_LIMITS[category]);
  }
  return grouped;
}

/** Single union query so one round trip covers every category. */
function overpassQuery(lat: number, lon: number): string {
  const around = `(around:${SEARCH_RADIUS_M},${lat},${lon})`;
  const filters = [
    '["amenity"~"^(restaurant|cafe|bar)$"]',
    '["tourism"~"^(attraction|museum|viewpoint|artwork)$"]',
    '["leisure"="park"]',
    '["natural"="beach"]',
    '["amenity"="pharmacy"]',
    '["shop"="supermarket"]',
    '["amenity"~"^(hospital|clinic)$"]',
  ];
  const body = filters
    .map((filter) => `  nwr["name"]${filter}${around};`)
    .join("\n");

  return `[out:json][timeout:${Math.floor(OVERPASS_TIMEOUT_MS / 1000)}];\n(\n${body}\n);\nout tags center;`;
}

/** Essentials win over food/leisure tags so a pharmacy is never a restaurant. */
function categorize(tags: OverpassTags | undefined): PoiCategory | null {
  if (!tags) return null;
  const { amenity, shop, tourism, leisure, natural } = tags;

  if (amenity === "pharmacy") return "pharmacies";
  if (shop === "supermarket") return "supermarkets";
  if (amenity === "hospital" || amenity === "clinic") return "hospitals";
  if (amenity === "restaurant" || amenity === "cafe" || amenity === "bar") {
    return "restaurants";
  }
  if (
    tourism === "attraction" ||
    tourism === "museum" ||
    tourism === "viewpoint" ||
    tourism === "artwork" ||
    leisure === "park" ||
    natural === "beach"
  ) {
    return "attractions";
  }
  return null;
}

/** "≈ 850 m" below 1 km, "≈ 1,2 km" above (pt-BR decimal comma). */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    const rounded = Math.max(50, Math.round(meters / 50) * 50);
    return `≈ ${rounded} m`;
  }
  const km = meters / 1000;
  const digits = km < 10 ? 1 : 0;
  return `≈ ${km.toFixed(digits).replace(".", ",")} km`;
}

/** Great-circle distance in metres. */
export function haversineMeters(from: GeoPoint, to: GeoPoint): number {
  const earthRadius = 6_371_000;
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lon - from.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLon / 2) ** 2;

  return Math.round(2 * earthRadius * Math.asin(Math.sqrt(a)));
}

function coordsOf(element: OverpassElement): GeoPoint | null {
  return typeof element.lat === "number" && typeof element.lon === "number"
    ? { lat: element.lat, lon: element.lon }
    : null;
}

async function fetchJson<T>(
  url: string,
  timeoutMs: number,
  init?: { method: "POST"; body: string },
): Promise<T | null> {
  try {
    const response = await fetch(url, {
      method: init?.method ?? "GET",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
        ...(init ? { "Content-Type": "text/plain;charset=UTF-8" } : {}),
      },
      body: init?.body,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null; // grounding is optional; the pipeline degrades without it
  }
}

type NominatimResult = { lat?: string; lon?: string };

type OverpassTags = {
  name?: string;
  amenity?: string;
  shop?: string;
  tourism?: string;
  leisure?: string;
  natural?: string;
};

type OverpassElement = {
  lat?: number;
  lon?: number;
  center?: GeoPoint;
  tags?: OverpassTags;
};

type OverpassResponse = { elements?: OverpassElement[] };
