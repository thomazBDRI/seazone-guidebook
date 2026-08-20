import type { Property } from "@/lib/domain/property";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";

/**
 * Display dictionaries: turn raw database values (booleans, snake_case keys,
 * time strings) into guest-facing sentences in the active locale. The wording
 * lives in the message catalogs; this module only decides which entry a row
 * maps to. Icons are lucide icon names, resolved to components at the UI layer.
 *
 * Purely numeric formatters (times, phone digits, addresses) take no locale:
 * they render the same in every language.
 */

/** "15:00:00" (postgres time) → "15:00" */
export function formatTime(time: string): string {
  const match = /^(\d{2}):(\d{2})/.exec(time);
  return match ? `${match[1]}:${match[2]}` : time;
}

export type RuleLine = {
  key: string;
  icon: string;
  sentence: string;
  /** false renders the icon with a "not allowed" slash */
  allowed: boolean;
};

/** Rule booleans → full sentences ("Durante sua estadia" list). */
export function ruleLines(
  property: Pick<
    Property,
    | "guest_capacity"
    | "allow_pet"
    | "smoking_permitted"
    | "suitable_for_children"
    | "suitable_for_babies"
    | "events_permitted"
  >,
  locale: Locale,
): RuleLine[] {
  const rules = getMessages(locale).domain.rules;

  return [
    {
      key: "guests",
      icon: "users",
      sentence: rules.guests(property.guest_capacity),
      allowed: true,
    },
    property.allow_pet
      ? {
          key: "pets",
          icon: "paw-print",
          sentence: rules.petsAllowed,
          allowed: true,
        }
      : {
          key: "pets",
          icon: "paw-print",
          sentence: rules.petsForbidden,
          allowed: false,
        },
    property.smoking_permitted
      ? {
          key: "smoking",
          icon: "cigarette",
          sentence: rules.smokingAllowed,
          allowed: true,
        }
      : {
          key: "smoking",
          icon: "cigarette-off",
          sentence: rules.smokingForbidden,
          allowed: true, // cigarette-off already carries the slash
        },
    property.suitable_for_children
      ? {
          key: "children",
          icon: "person-standing",
          sentence: rules.childrenAllowed,
          allowed: true,
        }
      : {
          key: "children",
          icon: "person-standing",
          sentence: rules.childrenForbidden,
          allowed: false,
        },
    property.suitable_for_babies
      ? {
          key: "babies",
          icon: "baby",
          sentence: rules.babiesAllowed,
          allowed: true,
        }
      : {
          key: "babies",
          icon: "baby",
          sentence: rules.babiesForbidden,
          allowed: false,
        },
    property.events_permitted
      ? {
          key: "events",
          icon: "party-popper",
          sentence: rules.eventsAllowed,
          allowed: true,
        }
      : {
          key: "events",
          icon: "party-popper",
          sentence: rules.eventsForbidden,
          allowed: false,
        },
  ];
}

export type AmenityDisplay = { icon: string; label: string };

/** Icons are locale-independent; the labels come from the catalogs. */
const AMENITY_ICONS: Record<string, string> = {
  wifi: "wifi",
  tv: "tv",
  air_conditioning: "snowflake",
  kitchen: "cooking-pot",
  washing_machine: "washing-machine",
  elevator: "arrow-up-down",
  balcony: "fence",
  bbq_grill: "flame",
  dishwasher: "utensils",
  pool: "waves",
  heating: "thermometer",
  fireplace: "flame",
  gym: "dumbbell",
  parking: "car",
  jacuzzi: "bath",
  beach_access: "umbrella",
};

/** Humanizes unknown keys so new backend amenities never break the UI. */
function humanize(key: string): string {
  const words = key.replace(/[_-]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** DB keys are open-ended, so every catalog lookup here is a maybe-hit. */
type Dictionary = Record<string, string | undefined>;

export function amenityDisplay(key: string, locale: Locale): AmenityDisplay {
  const labels: Dictionary = getMessages(locale).domain.amenities;
  const label = labels[key];
  return label
    ? { icon: AMENITY_ICONS[key] ?? "check", label }
    : // an amenity the catalog does not know is still worth showing, in
      // whatever shape the backend spelled it
      { icon: "check", label: humanize(key) };
}

/** amenities jsonb → displayable list (only truthy entries, stable order). */
export function amenityList(
  amenities: Record<string, boolean>,
  locale: Locale,
): (AmenityDisplay & { key: string })[] {
  const known: Dictionary = getMessages(locale).domain.amenities;
  return Object.keys(amenities)
    .filter((key) => amenities[key])
    .sort((a, b) => (known[b] ? 1 : 0) - (known[a] ? 1 : 0))
    .map((key) => ({ key, ...amenityDisplay(key, locale) }));
}

export type ServiceLine = {
  key: string;
  icon: string;
  /** Offer headline; the humanized key when the catalog does not know it. */
  title: string;
  /** Localized pitch. Null for an unknown key — the title is all we have. */
  sentence: string | null;
  /** Text authored on the row, shown as written — never translated. */
  note: string | null;
  /**
   * Who the guest has to talk to. Extending a stay is priced by the Seazone
   * team; everything else is arranged with the host, so the card's button and
   * the assistant both have to point at the same person.
   */
  fulfilledBy: "host" | "seazone";
};

/** What the sentence templates may interpolate. */
export type ServiceContext = { hostName: string; checkIn: string };

/**
 * Declaration order doubles as display order, so the section reads the same
 * for every property. Keys the catalog does not know come after these.
 */
const SERVICE_ICONS: Record<string, string> = {
  early_checkin: "clock",
  late_checkout: "log-out",
  extend_stay: "calendar-plus",
  midstay_cleaning: "brush-cleaning",
  luggage_storage: "luggage",
  airport_transfer: "plane",
};

const SERVICE_ORDER = Object.keys(SERVICE_ICONS);

/** Services the Seazone team fulfils instead of the host. */
const SEAZONE_SERVICES = new Set(["extend_stay"]);

type ServiceTemplates = Record<
  string,
  ((context: { host: string; checkIn: string }) => string) | undefined
>;

/**
 * services jsonb → guest-facing lines. A `false` (or empty) value means the
 * service is not offered and never reaches the page; the chat prompt relies on
 * that so it can tell a guest honestly that something is unavailable.
 */
export function serviceLines(
  services: Record<string, boolean | string>,
  { hostName, checkIn }: ServiceContext,
  locale: Locale,
): ServiceLine[] {
  const messages = getMessages(locale);
  const templates: ServiceTemplates = messages.domain.services;
  const titles: Dictionary = messages.services.titles;
  const context = { host: hostName, checkIn: formatTime(checkIn) };

  return Object.keys(services)
    .filter((key) => services[key] !== false && services[key] !== "")
    .sort((a, b) => serviceRank(a) - serviceRank(b))
    .map((key) => {
      const value = services[key];
      const template = templates[key];
      return {
        key,
        icon: SERVICE_ICONS[key] ?? "concierge-bell",
        title: titles[key] ?? humanize(key),
        sentence: template ? template(context) : null,
        note: typeof value === "string" ? value : null,
        fulfilledBy: SEAZONE_SERVICES.has(key)
          ? ("seazone" as const)
          : ("host" as const),
      };
    });
}

function serviceRank(key: string): number {
  const index = SERVICE_ORDER.indexOf(key);
  return index === -1 ? SERVICE_ORDER.length : index;
}

const ACCESS_TYPE_ICONS: Record<string, string> = {
  smart_lock: "lock-keyhole",
  keybox: "key-round",
  doorman: "bell",
};

export function accessTypeDisplay(
  type: string | null,
  locale: Locale,
): AmenityDisplay {
  const domain = getMessages(locale).domain;
  if (!type) return { icon: "key-round", label: domain.accessTypeFallback };

  const labels: Dictionary = domain.accessTypes;
  const label = labels[type];
  return {
    icon: ACCESS_TYPE_ICONS[type] ?? "key-round",
    label: label ?? humanize(type),
  };
}

/**
 * Essentials carry a schema literal ("farmácia" | "supermercado" |
 * "hospital") persisted with the guide; it is data, translated only here at
 * display time. Anything else the model invented passes through untouched.
 */
export function essentialTypeLabel(type: string, locale: Locale): string {
  const types: Dictionary = getMessages(locale).domain.essentialTypes;
  const key = type
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  return types[key] ?? type;
}

/** Digits only, as required by wa.me links. */
export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** "+5548991234567" → "+55 48 99123-4567" (unknown shapes pass through). */
export function formatPhone(phone: string): string {
  const match = /^(\d{2})(\d{2})(\d{4,5})(\d{4})$/.exec(phoneDigits(phone));
  return match ? `+${match[1]} ${match[2]} ${match[3]}-${match[4]}` : phone;
}

/** "Ana Paula" → "Ana" (a button that says the full name reads formal). */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/** "Ana Paula" → "AP" (avatar fallback when there is no photo). */
export function hostInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const letters = parts.length === 1 ? [parts[0]] : [parts[0], parts.at(-1)];
  return letters.map((part) => part?.charAt(0).toUpperCase() ?? "").join("");
}

/** Full display address, e.g. "Rua Lauro Linhares, 589 — Apto 301". */
export function addressLine(
  property: Pick<Property, "street" | "number" | "complement">,
): string {
  const base = `${property.street}, ${property.number}`;
  return property.complement ? `${base} — ${property.complement}` : base;
}

/** "Trindade, Florianópolis — SC" */
export function locationLine(
  property: Pick<Property, "neighborhood" | "city" | "state">,
): string {
  return `${property.neighborhood}, ${property.city} — ${property.state}`;
}

/**
 * Geocoding-friendly address for maps and ride apps: no complement (an
 * apartment number only confuses geocoders) and the plain "City - ST" form.
 */
export function mapAddress(
  property: Pick<
    Property,
    "street" | "number" | "neighborhood" | "city" | "state"
  >,
): string {
  return `${property.street}, ${property.number}, ${property.neighborhood}, ${property.city} - ${property.state}`;
}
