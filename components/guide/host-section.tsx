import { WhatsAppIcon } from "@/components/guide/brand";
import { Icon } from "@/components/guide/icon";
import { GuideSection } from "@/components/guide/section";
import { ActionLink } from "@/components/ui/action-link";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatPhone, hostInitials, phoneDigits } from "@/lib/domain/display";

type HostSectionProps = { hostName: string; hostPhone: string };

export function HostSection({ hostName, hostPhone }: HostSectionProps) {
  const digits = phoneDigits(hostPhone);

  return (
    <GuideSection id="contato">
      <SectionHeading
        eyebrow="Estamos por perto"
        title="Fale com sua anfitriã"
      />
      <Card className="flex flex-wrap items-center justify-between gap-5 p-[26px] shadow-soft">
        <div className="flex items-center gap-4">
          <span className="grid size-14 flex-none place-items-center rounded-full bg-navy text-[19px] font-bold tracking-[.02em] text-white">
            {hostInitials(hostName)}
          </span>
          <div>
            <div className="text-[17px] font-bold tracking-[-.01em]">
              {hostName}
            </div>
            <div className="text-[12.5px] font-medium text-muted-foreground">
              Anfitriã Seazone deste imóvel
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <ActionLink
            variant="whatsapp"
            href={`https://wa.me/${digits}`}
            target="_blank"
            rel="noopener"
          >
            <WhatsAppIcon />
            WhatsApp
          </ActionLink>
          <ActionLink variant="outline" href={`tel:+${digits}`}>
            <Icon name="phone" />
            {formatPhone(hostPhone)}
          </ActionLink>
        </div>
      </Card>
    </GuideSection>
  );
}
