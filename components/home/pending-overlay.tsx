"use client";

import { useLinkStatus } from "next/link";
import { Icon } from "@/components/guide/icon";

/**
 * Click acknowledgment for links into the guide: the route is fully dynamic
 * (no prefetch, no loading shell — the honest 404 depends on that), so without
 * this the click looks dead until the server answers. Always rendered at a
 * fixed size and toggled via opacity, so it cannot shift layout.
 */
export function PendingOverlay() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 grid place-items-center bg-white/[.65] backdrop-blur-[1px] transition-opacity duration-200 ${
        pending ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className="grid size-12 place-items-center rounded-full bg-navy text-white shadow-elevated">
        <Icon name="loader-circle" className="size-6 animate-spin" />
      </span>
    </span>
  );
}
