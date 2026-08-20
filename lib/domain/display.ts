import type { Property } from "@/lib/domain/property";

/**
 * Display dictionaries: turn raw database values (booleans, snake_case keys,
 * time strings) into guest-facing Portuguese. Icons are lucide icon names,
 * resolved to components at the UI layer.
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
): RuleLine[] {
  return [
    {
      key: "guests",
      icon: "users",
      sentence: `Máximo de ${property.guest_capacity} hóspedes`,
      allowed: true,
    },
    property.allow_pet
      ? {
          key: "pets",
          icon: "paw-print",
          sentence: "Animais de estimação são bem-vindos",
          allowed: true,
        }
      : {
          key: "pets",
          icon: "paw-print",
          sentence: "Não é permitido animais de estimação",
          allowed: false,
        },
    property.smoking_permitted
      ? {
          key: "smoking",
          icon: "cigarette",
          sentence: "É permitido fumar no imóvel",
          allowed: true,
        }
      : {
          key: "smoking",
          icon: "cigarette-off",
          sentence: "Proibido fumar no imóvel",
          allowed: true, // cigarette-off already carries the slash
        },
    property.suitable_for_children
      ? {
          key: "children",
          icon: "person-standing",
          sentence: "Crianças são bem-vindas",
          allowed: true,
        }
      : {
          key: "children",
          icon: "person-standing",
          sentence: "Não recomendado para crianças",
          allowed: false,
        },
    property.suitable_for_babies
      ? {
          key: "babies",
          icon: "baby",
          sentence: "Adequado para bebês",
          allowed: true,
        }
      : {
          key: "babies",
          icon: "baby",
          sentence: "Não adequado para bebês",
          allowed: false,
        },
    property.events_permitted
      ? {
          key: "events",
          icon: "party-popper",
          sentence: "Festas e eventos são permitidos",
          allowed: true,
        }
      : {
          key: "events",
          icon: "party-popper",
          sentence: "Festas e eventos não são permitidos",
          allowed: false,
        },
  ];
}

export type AmenityDisplay = { icon: string; label: string };

const AMENITY_DICTIONARY: Record<string, AmenityDisplay> = {
  wifi: { icon: "wifi", label: "Wi-Fi" },
  tv: { icon: "tv", label: "TV" },
  air_conditioning: { icon: "snowflake", label: "Ar-condicionado" },
  kitchen: { icon: "cooking-pot", label: "Cozinha completa" },
  washing_machine: { icon: "washing-machine", label: "Máquina de lavar" },
  elevator: { icon: "arrow-up-down", label: "Elevador" },
  balcony: { icon: "fence", label: "Varanda" },
  bbq_grill: { icon: "flame", label: "Churrasqueira" },
  dishwasher: { icon: "utensils", label: "Lava-louças" },
  pool: { icon: "waves", label: "Piscina" },
  heating: { icon: "thermometer", label: "Aquecimento" },
  fireplace: { icon: "flame", label: "Lareira" },
  gym: { icon: "dumbbell", label: "Academia" },
  parking: { icon: "car", label: "Estacionamento" },
};

/** Humanizes unknown keys so new backend amenities never break the UI. */
function humanize(key: string): string {
  const words = key.replace(/[_-]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function amenityDisplay(key: string): AmenityDisplay {
  return AMENITY_DICTIONARY[key] ?? { icon: "check", label: humanize(key) };
}

/** amenities jsonb → displayable list (only truthy entries, stable order). */
export function amenityList(
  amenities: Record<string, boolean>,
): (AmenityDisplay & { key: string })[] {
  return Object.keys(amenities)
    .filter((key) => amenities[key])
    .sort(
      (a, b) =>
        (AMENITY_DICTIONARY[b] ? 1 : 0) - (AMENITY_DICTIONARY[a] ? 1 : 0),
    )
    .map((key) => ({ key, ...amenityDisplay(key) }));
}

const ACCESS_TYPE_DICTIONARY: Record<string, AmenityDisplay> = {
  smart_lock: { icon: "lock-keyhole", label: "Fechadura eletrônica" },
  keybox: { icon: "key-round", label: "Cofre de chaves" },
  doorman: { icon: "bell", label: "Portaria" },
};

export function accessTypeDisplay(type: string | null): AmenityDisplay {
  if (!type) return { icon: "key-round", label: "Acesso ao imóvel" };
  return (
    ACCESS_TYPE_DICTIONARY[type] ?? { icon: "key-round", label: humanize(type) }
  );
}

/** Full display address, e.g. "Rua Lauro Linhares, 589 — Apto 301". */
export function addressLine(
  property: Pick<Property, "street" | "number" | "complement">,
): string {
  const base = `${property.street}, ${property.number}`;
  return property.complement ? `${base} — ${property.complement}` : base;
}
