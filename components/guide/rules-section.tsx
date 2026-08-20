import { Icon } from "@/components/guide/icon";
import { GuideSection } from "@/components/guide/section";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatTime, ruleLines } from "@/lib/domain/display";
import type { Property } from "@/lib/domain/property";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

type RulesSectionProps = { property: Property; locale: Locale };

export function RulesSection({ property, locale }: RulesSectionProps) {
  const messages = getMessages(locale).rules;

  return (
    <GuideSection id="regras">
      <SectionHeading eyebrow={messages.eyebrow} title={messages.title} />
      <div className="grid grid-cols-[300px_1fr] items-start gap-3 max-[880px]:grid-cols-1">
        <Card className="px-[30px] py-7 shadow-soft max-[880px]:px-7 max-[880px]:py-[22px]">
          <h3 className="mb-3.5 text-[11.5px] font-bold uppercase tracking-[.15em] text-muted-foreground">
            {messages.times}
          </h3>
          <TimeLine
            icon="log-in"
            label={messages.checkIn}
            time={formatTime(property.check_in_time)}
            hint={messages.checkInHint}
          />
          <TimeLine
            icon="log-out"
            label={messages.checkOut}
            time={formatTime(property.check_out_time)}
            hint={messages.checkOutHint}
          />
        </Card>

        <div>
          <h3 className="mb-3.5 text-[11.5px] font-bold uppercase tracking-[.15em] text-muted-foreground">
            {messages.duringStay}
          </h3>
          <div className="grid grid-cols-2 gap-3 max-[880px]:grid-cols-1">
            {ruleLines(property, locale).map((rule) => (
              <div
                key={rule.key}
                className="flex items-center gap-[13px] rounded-lg border border-border bg-white px-[18px] py-[17px] shadow-soft transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-card"
              >
                {/* the slash is the only marker for a forbidden rule: the
                    sentence already says no, so no red/green is needed */}
                <span
                  className={cn(
                    "relative grid size-[27px] flex-none place-items-center",
                    !rule.allowed &&
                      "after:absolute after:h-[1.8px] after:w-8 after:rotate-45 after:rounded-sm after:bg-slate-icon after:shadow-[0_0_0_1.5px_#fff] after:content-['']",
                  )}
                >
                  <Icon
                    name={rule.icon}
                    className="size-[25px] text-slate-icon"
                  />
                </span>
                <span className="text-sm font-semibold">{rule.sentence}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GuideSection>
  );
}

function TimeLine({
  icon,
  label,
  time,
  hint,
}: {
  icon: string;
  label: string;
  time: string;
  hint: string;
}) {
  return (
    <div className="flex items-start gap-3.5 py-2.5">
      <Icon name={icon} className="mt-1.5 size-5 flex-none opacity-70" />
      <div>
        <div className="text-[10.5px] font-bold uppercase tracking-[.14em] text-muted-foreground">
          {label}
        </div>
        <b className="block font-display text-[30px] font-semibold leading-[1.15] tracking-[-.02em]">
          {time}
        </b>
        <small className="text-[12.5px] text-muted-foreground">{hint}</small>
      </div>
    </div>
  );
}
