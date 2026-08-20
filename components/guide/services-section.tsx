import { WhatsAppIcon } from "@/components/guide/brand";
import { Icon } from "@/components/guide/icon";
import { GuideSection } from "@/components/guide/section";
import { ActionLink } from "@/components/ui/action-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { firstName, phoneDigits, serviceLines } from "@/lib/domain/display";
import type { Property } from "@/lib/domain/property";
import { SEAZONE_WHATSAPP } from "@/lib/domain/seazone";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";

type ServicesSectionProps = { property: Property; locale: Locale };

/**
 * What the guest can ask for on top of the booking — every card is an offer
 * with one button, because a service nobody knows how to request is revenue
 * left on the table. The cards come from the property's `services` column; the
 * emergency strip below them is the same for every stay and lives in the
 * catalogs, not in the database.
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
        {lines.map((line) => {
          // the button points at whoever actually fulfils the service, with
          // the request already typed for them
          const cta =
            line.fulfilledBy === "seazone"
              ? {
                  variant: "primary" as const,
                  label: messages.cta.seazone,
                  href: whatsappLink(
                    SEAZONE_WHATSAPP,
                    messages.prefill.seazone({
                      property: property.name,
                      code: property.code,
                    }),
                  ),
                }
              : {
                  variant: "whatsapp" as const,
                  label: messages.cta.host(firstName(property.host_name)),
                  href: whatsappLink(
                    phoneDigits(property.host_phone),
                    messages.prefill.host({
                      host: property.host_name,
                      property: property.name,
                      code: property.code,
                      service: line.title,
                    }),
                  ),
                };

          return (
            <div
              key={line.key}
              className="flex flex-col rounded-lg border border-border bg-white p-[18px] shadow-soft transition-shadow hover:shadow-card"
            >
              <div className="flex flex-1 items-start gap-[13px]">
                <span className="grid size-10 flex-none place-items-center rounded-[12px] bg-sea-light text-primary">
                  <Icon name={line.icon} className="size-[19px]" />
                </span>
                <div>
                  <h3 className="text-[15px] font-bold tracking-[-.01em]">
                    {line.title}
                  </h3>
                  {line.sentence ? (
                    <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                      {line.sentence}
                    </p>
                  ) : null}
                  {line.note ? (
                    <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">
                      {line.note}
                    </p>
                  ) : null}
                </div>
              </div>
              <ActionLink
                variant={cta.variant}
                href={cta.href}
                target="_blank"
                rel="noopener"
                className="mt-4 w-full"
              >
                <WhatsAppIcon />
                {cta.label}
              </ActionLink>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-start gap-[13px] rounded-lg border border-border bg-sea-mist px-[18px] py-4">
        <Icon
          name="circle-alert"
          className="mt-px size-[19px] flex-none text-slate-icon"
        />
        <p className="text-[13px] leading-snug text-muted-foreground">
          <b className="font-bold text-foreground">
            {messages.emergency.title}: {messages.emergency.numbers}
          </b>{" "}
          — {messages.emergency.note(property.host_name)}
        </p>
      </div>
    </GuideSection>
  );
}

function whatsappLink(phoneDigitsOnly: string, prefill: string): string {
  return `https://wa.me/${phoneDigitsOnly}?text=${encodeURIComponent(prefill)}`;
}
