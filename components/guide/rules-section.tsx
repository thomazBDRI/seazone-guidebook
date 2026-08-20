import { Icon } from "@/components/guide/icon";
import { GuideSection } from "@/components/guide/section";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatTime, ruleLines } from "@/lib/domain/display";
import type { Property } from "@/lib/domain/property";
import type { Locale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

type RulesSectionProps = { property: Property; locale: Locale };

export function RulesSection({ property, locale }: RulesSectionProps) {
  return (
    <GuideSection id="regras">
      <SectionHeading eyebrow="Boa convivência" title="Regras da estadia" />
      <Card className="grid grid-cols-[300px_1px_1fr] items-stretch p-0 shadow-soft max-[880px]:grid-cols-1">
        <div className="px-[30px] py-7 max-[880px]:px-7 max-[880px]:py-[22px]">
          <h3 className="mb-3.5 text-[11.5px] font-bold uppercase tracking-[.15em] text-muted-foreground">
            Horários
          </h3>
          <TimeLine
            icon="log-in"
            label="Check-in"
            time={formatTime(property.check_in_time)}
            hint="a partir deste horário"
          />
          <TimeLine
            icon="log-out"
            label="Check-out"
            time={formatTime(property.check_out_time)}
            hint="até este horário"
          />
        </div>

        <div className="my-[26px] w-px bg-border max-[880px]:mx-7 max-[880px]:my-0 max-[880px]:h-px max-[880px]:w-auto" />

        <div className="px-[30px] py-7 max-[880px]:px-7 max-[880px]:py-[22px]">
          <h3 className="mb-3.5 text-[11.5px] font-bold uppercase tracking-[.15em] text-muted-foreground">
            Durante sua estadia
          </h3>
          {ruleLines(property, locale).map((rule) => (
            <p
              key={rule.key}
              className="flex items-center gap-[15px] py-[9px] text-[15px] font-medium"
            >
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
              {rule.sentence}
            </p>
          ))}
        </div>
      </Card>
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
