"use client";

/**
 * Represents events that are synchronized across browser tabs.
 */
export type CrossTabSyncEvent =
  | { type: "credential:selected"; credentialId: string; at: number }
  | { type: "credential:activated"; credentialId: string; at: number }
  | { type: "logout"; at: number }
  | { type: "login"; at: number };

const CHANNEL_NAME = "akina-sync";
const CHANNEL_KEY = "__akina_bc__" as const;

type WindowWithChannel = Window & {
  [CHANNEL_KEY]?: BroadcastChannel;
};

/**
 * Returns a shared BroadcastChannel instance scoped to the window.
 * Ensures only one instance exists per tab and handles cleanup on page unload.
 *
 * @returns {BroadcastChannel | null} The broadcast channel or null if unsupported.
 */
function getChannel(): BroadcastChannel | null {
  if (
    typeof window === "undefined" ||
    typeof BroadcastChannel === "undefined"
  ) {
    return null;
  }

  const win = window as WindowWithChannel;

  if (!win[CHANNEL_KEY]) {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    win[CHANNEL_KEY] = channel;

    // Cleanup when the page is being unloaded
    const cleanup = () => {
      channel.close();
      win[CHANNEL_KEY] = undefined;
      window.removeEventListener("pagehide", cleanup);
    };

    window.addEventListener("pagehide", cleanup);
  }

  return win[CHANNEL_KEY] ?? null;
}

/**
 * Publishes a cross-tab synchronization event.
 *
 * @param {CrossTabSyncEvent} event - The event to broadcast.
 */
export function publishCrossTabSyncEvent(event: CrossTabSyncEvent): void {
  const channel = getChannel();
  if (!channel) return;

  channel.postMessage(event);
}

/**
 * Subscribes to cross-tab synchronization events.
 *
 * @param {(event: CrossTabSyncEvent) => void} handler - Callback executed when an event is received.
 * @returns {() => void} Function to unsubscribe from events.
 */
export function subscribeCrossTabSyncEvents(
  handler: (event: CrossTabSyncEvent) => void,
): () => void {
  const channel = getChannel();
  if (!channel) return () => {};

  /**
   * Internal message handler with basic validation.
   */
  const onMessage = (e: MessageEvent<unknown>) => {
    const data = e?.data as Partial<CrossTabSyncEvent>;

    if (!data || typeof data !== "object" || !("type" in data)) {
      return;
    }

    handler(data as CrossTabSyncEvent);
  };

  channel.addEventListener("message", onMessage);

  return () => {
    channel.removeEventListener("message", onMessage);
  };
}
