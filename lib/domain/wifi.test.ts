import { describe, expect, it } from "vitest";
import { wifiQrPayload } from "@/lib/domain/wifi";

describe("wifiQrPayload", () => {
  it("builds the WIFI: join string", () => {
    expect(wifiQrPayload("SeaHome_FLN001", "floripa2024")).toBe(
      "WIFI:T:WPA;S:SeaHome_FLN001;P:floripa2024;;",
    );
  });

  it("escapes separators so scanners read the whole password", () => {
    expect(wifiQrPayload("Casa; 2", 'senha:"a,b\\c')).toBe(
      'WIFI:T:WPA;S:Casa\\; 2;P:senha\\:\\"a\\,b\\\\c;;',
    );
  });
});
