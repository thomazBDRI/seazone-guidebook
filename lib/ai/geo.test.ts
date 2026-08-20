import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchNearbyPois,
  formatDistance,
  geocodeAddress,
  hasPois,
  haversineMeters,
} from "@/lib/ai/geo";

/** Trindade, Florianópolis — the FLN001 street, as Nominatim returns it. */
const ORIGIN = { lat: -27.5865377, lon: -48.5248549 };

/** Same longitude, offset north: distance is a plain latitude arc. */
function northOf(meters: number) {
  return {
    lat: ORIGIN.lat + (meters / 6_371_000) * (180 / Math.PI),
    lon: ORIGIN.lon,
  };
}

/** The Overpass QL the module actually put on the wire. */
function overpassQueryOf(fetchMock: ReturnType<typeof vi.fn>): string {
  const body = fetchMock.mock.calls[0][1].body as string;
  return new URLSearchParams(body).get("data") ?? "";
}

function mockFetch(payload: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: async () => payload,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("formatDistance", () => {
  it("formats sub-kilometre distances in metres, rounded to 50", () => {
    expect(formatDistance(849)).toBe("≈ 850 m");
    expect(formatDistance(312)).toBe("≈ 300 m");
    expect(formatDistance(999)).toBe("≈ 1000 m");
  });

  it("never rounds a nearby place down to zero", () => {
    expect(formatDistance(12)).toBe("≈ 50 m");
  });

  it("formats kilometres with a pt-BR decimal comma", () => {
    expect(formatDistance(1200)).toBe("≈ 1,2 km");
    expect(formatDistance(2540)).toBe("≈ 2,5 km");
  });

  it("drops the decimal past ten kilometres", () => {
    expect(formatDistance(11_400)).toBe("≈ 11 km");
  });
});

describe("haversineMeters", () => {
  it("measures a latitude offset back to the metre it was built from", () => {
    expect(haversineMeters(ORIGIN, northOf(850))).toBe(850);
    expect(haversineMeters(ORIGIN, northOf(1200))).toBe(1200);
  });

  it("is zero for the same point", () => {
    expect(haversineMeters(ORIGIN, ORIGIN)).toBe(0);
  });
});

describe("geocodeAddress", () => {
  it("returns the first match as numbers", async () => {
    mockFetch([{ lat: "-27.5865377", lon: "-48.5248549" }]);

    await expect(geocodeAddress("Rua Lauro Linhares, 589")).resolves.toEqual(
      ORIGIN,
    );
  });

  it("identifies the application, as Nominatim's policy requires", async () => {
    const fetchMock = mockFetch([{ lat: "-27.5", lon: "-48.5" }]);
    await geocodeAddress("Florianópolis");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("nominatim.openstreetmap.org");
    expect(init.headers["User-Agent"]).toMatch(/seazone-guest-guide/);
  });

  it("returns null when nothing matches", async () => {
    mockFetch([]);
    await expect(geocodeAddress("Rua Inexistente")).resolves.toBeNull();
  });

  it("returns null instead of throwing when the service is down", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ENOTFOUND")));
    await expect(geocodeAddress("Florianópolis")).resolves.toBeNull();
  });
});

describe("fetchNearbyPois", () => {
  it("formats distances and sorts each category nearest first", async () => {
    mockFetch({
      elements: [
        {
          ...northOf(1200),
          tags: { name: "Armazém Vieira", amenity: "restaurant" },
        },
        { ...northOf(850), tags: { name: "Café Cultura", amenity: "cafe" } },
      ],
    });

    const pois = await fetchNearbyPois(ORIGIN.lat, ORIGIN.lon);

    expect(pois.restaurants).toEqual([
      { name: "Café Cultura", distance: "≈ 850 m", meters: 850 },
      { name: "Armazém Vieira", distance: "≈ 1,2 km", meters: 1200 },
    ]);
  });

  it("drops elements without a name tag", async () => {
    mockFetch({
      elements: [
        { ...northOf(300), tags: { amenity: "restaurant" } },
        { ...northOf(400), tags: { name: "   ", amenity: "restaurant" } },
        { ...northOf(500), tags: { name: "Box 32", amenity: "restaurant" } },
      ],
    });

    const pois = await fetchNearbyPois(ORIGIN.lat, ORIGIN.lon);

    expect(pois.restaurants.map((poi) => poi.name)).toEqual(["Box 32"]);
  });

  it("groups by category, essentials taking precedence over food tags", async () => {
    mockFetch({
      elements: [
        {
          ...northOf(300),
          tags: { name: "Farmácia Panvel", amenity: "pharmacy" },
        },
        {
          ...northOf(700),
          tags: { name: "Angeloni", shop: "supermarket", amenity: "cafe" },
        },
        {
          ...northOf(950),
          tags: { name: "Hospital Universitário", amenity: "hospital" },
        },
        {
          ...northOf(2100),
          tags: { name: "Morro da Cruz", tourism: "viewpoint" },
        },
        { ...northOf(1500), tags: { name: "Parque da Luz", leisure: "park" } },
        { ...northOf(1800), tags: { name: "Praia de Fora", natural: "beach" } },
      ],
    });

    const pois = await fetchNearbyPois(ORIGIN.lat, ORIGIN.lon);

    expect(pois.pharmacies.map((p) => p.name)).toEqual(["Farmácia Panvel"]);
    expect(pois.supermarkets.map((p) => p.name)).toEqual(["Angeloni"]);
    expect(pois.hospitals.map((p) => p.name)).toEqual([
      "Hospital Universitário",
    ]);
    expect(pois.attractions.map((p) => p.name)).toEqual([
      "Parque da Luz",
      "Praia de Fora",
      "Morro da Cruz",
    ]);
    expect(pois.restaurants).toEqual([]);
  });

  it("reads the centre of ways, which have no lat/lon of their own", async () => {
    mockFetch({
      elements: [
        {
          type: "way",
          center: northOf(850),
          tags: { name: "Mercado Público", amenity: "restaurant" },
        },
      ],
    });

    const pois = await fetchNearbyPois(ORIGIN.lat, ORIGIN.lon);

    expect(pois.restaurants[0]).toMatchObject({
      name: "Mercado Público",
      distance: "≈ 850 m",
    });
  });

  it("keeps one entry per name, as OSM splits venues across elements", async () => {
    mockFetch({
      elements: [
        { ...northOf(850), tags: { name: "Box 32", amenity: "restaurant" } },
        { ...northOf(870), tags: { name: "box 32", amenity: "restaurant" } },
      ],
    });

    const pois = await fetchNearbyPois(ORIGIN.lat, ORIGIN.lon);

    expect(pois.restaurants).toHaveLength(1);
  });

  it("caps the candidate list so the prompt stays bounded", async () => {
    mockFetch({
      elements: Array.from({ length: 30 }, (_, index) => ({
        ...northOf(100 + index * 10),
        tags: { name: `Restaurante ${index}`, amenity: "restaurant" },
      })),
    });

    const pois = await fetchNearbyPois(ORIGIN.lat, ORIGIN.lon);

    expect(pois.restaurants).toHaveLength(12);
    expect(pois.restaurants[0].name).toBe("Restaurante 0");
  });

  it("returns empty lists when Overpass fails, so generation can degrade", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));

    const pois = await fetchNearbyPois(ORIGIN.lat, ORIGIN.lon);

    expect(hasPois(pois)).toBe(false);
  });

  it("asks Overpass for every guide category in one query", async () => {
    const fetchMock = mockFetch({ elements: [] });
    await fetchNearbyPois(ORIGIN.lat, ORIGIN.lon);

    const query = overpassQueryOf(fetchMock);
    expect(query).toContain("restaurant|cafe|bar");
    expect(query).toContain("attraction|museum|viewpoint|artwork");
    expect(query).toContain("pharmacy");
    expect(query).toContain("supermarket");
    expect(query).toContain("hospital|clinic");
    expect(query).toContain(`around:2500,${ORIGIN.lat},${ORIGIN.lon}`);
  });

  it("sends the query form-encoded, the only shape Overpass accepts", async () => {
    const fetchMock = mockFetch({ elements: [] });
    await fetchNearbyPois(ORIGIN.lat, ORIGIN.lon);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe(
      "application/x-www-form-urlencoded",
    );
    expect(overpassQueryOf(fetchMock)).toContain("[out:json]");
  });

  it("keeps the query cheap enough for Overpass to answer it", async () => {
    const fetchMock = mockFetch({ elements: [] });
    await fetchNearbyPois(ORIGIN.lat, ORIGIN.lon);

    const query = overpassQueryOf(fetchMock);
    // leading with ["name"] makes Overpass scan every named object and time
    // out; relations cost seconds and add virtually no named venues
    expect(query).not.toContain('["name"]');
    expect(query).not.toContain("nwr");
  });
});
