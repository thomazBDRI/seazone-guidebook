import { Icon } from "@/components/guide/icon";
import { GuideSection } from "@/components/guide/section";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { serviceLines } from "@/lib/domain/display";
import type { Property } from "@/lib/domain/property";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";

type ServicesSectionProps = { property: Property; locale: Locale };

/**
 * What the guest can ask for on top of the booking. The rows come from the
 * property's `services` column; the emergency numbers below them are the same
 * for every stay and live in the catalogs, not in the database.
 *
 * Rendered only when the property offers at least one service — see
 * `hasServices` on the guide page, which also decides the TOC entry.
 */
export function ServicesSection({ property, locale }: ServicesSectionProps) {
  const messages = getMessages(locale).services;
  const lines = serviceLines(
    property.services,
    { hostName: property.host_name, checkIn: property.check_in_time },
    locale,
  );

  return (
    <GuideSection id="servicos">
      <SectionHeading
        eyebrow={messages.eyebrow}
        title={messages.title}
        description={messages.description}
      />
      <div className="grid grid-cols-2 gap-3 max-[880px]:grid-cols-1">
        {lines.map((line) => (
          <div
            key={line.key}
            className="flex items-start gap-[13px] rounded-lg border border-border bg-white px-[18px] py-[17px] shadow-soft"
          >
            <span className="grid size-10 flex-none place-items-center rounded-[12px] bg-sea-light text-primary">
              <Icon name={line.icon} className="size-[19px]" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-snug">
                {line.sentence}
              </p>
              {line.note ? (
                <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">
                  {line.note}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <Card className="mt-3 flex items-start gap-[13px] p-[18px] shadow-soft">
        <span className="grid size-10 flex-none place-items-center rounded-[12px] bg-sea-light text-primary">
          <Icon name="circle-alert" className="size-[19px]" />
        </span>
        <div>
          <p className="text-sm font-semibold leading-snug">
            {messages.emergency.title}: {messages.emergency.numbers}
          </p>
          <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">
            {messages.emergency.note(property.host_name)}
          </p>
        </div>
      </Card>
    </GuideSection>
  );
}
