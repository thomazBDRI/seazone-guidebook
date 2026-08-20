import Link from "next/link";
import { Icon } from "@/components/guide/icon";
import { PendingOverlay } from "@/components/home/pending-overlay";
import { Card } from "@/components/ui/card";
import type { PropertySummary } from "@/lib/domain/property";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";

type PropertyCardProps = { property: PropertySummary; locale: Locale };

/** One unit on the reviewer index: the whole card is the link to its guide. */
export function PropertyCard({ property, locale }: PropertyCardProps) {
  const messages = getMessages(locale);

  return (
    <Link href={`/${property.code}`} className="group block">
      <Card className="relative h-full overflow-hidden border-border shadow-soft transition-[transform,box-shadow] group-hover:-translate-y-1 group-hover:shadow-card">
        <div className="relative aspect-[16/10] overflow-hidden bg-sea-light">
          {property.image ? (
            // biome-ignore lint/performance/noImgElement: photo hosts come from the database, so next/image would need a wildcard remote allowlist
            <img
              src={property.image}
              alt={property.name}
              className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <span className="grid size-full place-items-center text-primary/40">
              <Icon name="waves" className="size-10" />
            </span>
          )}
          <span className="absolute left-3.5 top-3.5 rounded-full bg-navy px-3 py-1.5 text-[11px] font-bold tracking-[.16em] text-white">
            {property.code}
          </span>
        </div>

        <div className="p-[22px]">
          <h3 className="font-display text-[20px] font-medium leading-[1.2] tracking-[-.01em]">
            {property.name}
          </h3>
          <p className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{property.property_type}</span>
            <span className="size-1 rounded-full bg-muted-foreground/40" />
            <span>
              {property.city} — {property.state}
            </span>
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-[13px] font-semibold text-slate-icon">
            <Capacity
              icon="bed-double"
              value={property.bedroom_quantity}
              label={messages.amenities.bedrooms(property.bedroom_quantity)}
            />
            <Capacity
              icon="bath"
              value={property.bathroom_quantity}
              label={messages.amenities.bathrooms(property.bathroom_quantity)}
            />
            <Capacity
              icon="users"
              value={property.guest_capacity}
              label={messages.home.guests(property.guest_capacity)}
            />
          </div>

          <span className="mt-[18px] flex items-center gap-1.5 text-sm font-semibold text-primary">
            {messages.home.openGuide}
            <Icon
              name="arrow-right"
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </div>
        <PendingOverlay />
      </Card>
    </Link>
  );
}

function Capacity({
  icon,
  value,
  label,
}: {
  icon: string;
  value: number;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon name={icon} className="size-[17px] text-primary" />
      {value} {label}
    </span>
  );
}
