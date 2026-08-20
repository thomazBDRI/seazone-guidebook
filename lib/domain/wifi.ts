/**
 * Wi-Fi join payload for QR codes (the format Android and iOS cameras
 * understand). Special characters must be escaped or the scanner reads the
 * password as the end of the field.
 */
function escapeField(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

export function wifiQrPayload(network: string, password: string): string {
  return `WIFI:T:WPA;S:${escapeField(network)};P:${escapeField(password)};;`;
}
