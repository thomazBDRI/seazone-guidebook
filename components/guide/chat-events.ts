/**
 * Opening the assistant is a page-wide action triggered from places that do not
 * own the widget (the hero CTA today). A window event keeps those call sites
 * free of prop drilling through the server-rendered tree; the declaration below
 * makes the channel typed for both ends.
 */
export const OPEN_CHAT_EVENT = "seazone:open-chat";

declare global {
  interface WindowEventMap {
    "seazone:open-chat": CustomEvent<void>;
  }
}

export function requestOpenChat(): void {
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT));
}
