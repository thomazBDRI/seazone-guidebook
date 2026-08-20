import { beforeEach, describe, expect, it, vi } from "vitest";

const order = vi.fn();
const select = vi.fn((_columns: string) => ({ order }));
const from = vi.fn((_table: string) => ({ select }));

vi.mock("@/lib/supabase/server", () => ({
  supabase: { from: (table: string) => from(table) },
}));

const { listProperties } = await import("@/lib/repositories/properties");

const row = {
  code: "FLN001",
  name: "Apartamento Beira-Mar Florianópolis",
  property_type: "Apartamento",
  city: "Florianópolis",
  state: "SC",
  bedroom_quantity: 2,
  bathroom_quantity: 1,
  guest_capacity: 4,
  images: ["https://example.test/cover.jpg", "https://example.test/b.jpg"],
};

beforeEach(() => {
  vi.clearAllMocks();
  order.mockResolvedValue({ data: [row], error: null });
});

describe("listProperties", () => {
  it("keeps only the cover photo and the card columns", async () => {
    const properties = await listProperties();

    expect(properties).toEqual([
      {
        code: "FLN001",
        name: "Apartamento Beira-Mar Florianópolis",
        property_type: "Apartamento",
        city: "Florianópolis",
        state: "SC",
        bedroom_quantity: 2,
        bathroom_quantity: 1,
        guest_capacity: 4,
        image: "https://example.test/cover.jpg",
      },
    ]);
  });

  it("reads only the properties table, ordered by code", async () => {
    await listProperties();

    expect(from).toHaveBeenCalledExactlyOnceWith("properties");
    expect(order).toHaveBeenCalledWith("code");
  });

  it("does not pull secrets a listing has no use for", async () => {
    await listProperties();

    const columns = select.mock.calls[0]?.[0] ?? "";
    expect(columns).not.toContain("wifi_password");
    expect(columns).not.toContain("property_password");
  });

  it("maps a property without photos to a null cover", async () => {
    order.mockResolvedValue({ data: [{ ...row, images: [] }], error: null });

    expect((await listProperties())[0]?.image).toBeNull();
  });

  it("returns an empty list when the table is empty", async () => {
    order.mockResolvedValue({ data: null, error: null });

    await expect(listProperties()).resolves.toEqual([]);
  });

  it("fails loudly when the query errors", async () => {
    order.mockResolvedValue({ data: null, error: { message: "boom" } });

    await expect(listProperties()).rejects.toThrow(
      "properties listing failed: boom",
    );
  });

  it("rejects a row that does not match the schema", async () => {
    order.mockResolvedValue({
      data: [{ ...row, guest_capacity: "four" }],
      error: null,
    });

    await expect(listProperties()).rejects.toThrow();
  });
});
