import { Icon } from "@/components/guide/icon";
import { GuideSection } from "@/components/guide/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { amenityList } from "@/lib/domain/display";
import type { Property } from "@/lib/domain/property";
import type { Locale } from "@/lib/i18n/locales";

function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}

type AmenitiesSectionProps = { property: Property; locale: Locale };

export function AmenitiesSection({ property, locale }: AmenitiesSectionProps) {
  return (
    <GuideSection id="comodidades">
      <SectionHeading
        eyebrow="O que o imóvel oferece"
        title="Capacidade & comodidades"
      />
      <div className="mb-3.5 grid grid-cols-3 gap-3 max-[640px]:grid-cols-1 max-[640px]:gap-2.5">
        <CapStat
          icon="bed-double"
          value={property.bedroom_quantity}
          label={plural(property.bedroom_quantity, "quarto", "quartos")}
        />
        <CapStat
          icon="bath"
          value={property.bathroom_quantity}
          label={plural(property.bathroom_quantity, "banheiro", "banheiros")}
        />
        <CapStat
          icon="users"
          value={property.guest_capacity}
          label={`${plural(property.guest_capacity, "hóspede", "hóspedes")} no máximo`}
        />
      </div>
      <div className="grid grid-cols-4 gap-3 max-[880px]:grid-cols-2">
        {amenityList(property.amenities, locale).map((amenity) => (
          <div
            key={amenity.key}
            className="flex items-center gap-[13px] rounded-lg border border-border bg-white px-[18px] py-[17px] shadow-soft transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-card"
          >
            <Icon name={amenity.icon} className="size-[25px] text-slate-icon" />
            <span className="text-sm font-semibold">{amenity.label}</span>
          </div>
        ))}
      </div>
    </GuideSection>
  );
}

function CapStat({
  icon,
  value,
  label,
}: {
  icon: string;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-lg border border-border bg-white p-5 shadow-soft">
      <span className="grid size-11 flex-none place-items-center rounded-[12px] bg-navy text-white">
        <Icon name={icon} className="size-[21px]" />
      </span>
      <div>
        <b className="block font-display text-[22px] font-bold leading-[1.1] tracking-[-.03em]">
          {value}
        </b>
        <span className="text-[12.5px] font-semibold text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}
