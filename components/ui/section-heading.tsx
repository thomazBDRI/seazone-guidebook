import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-[26px]", className)}>
      <p className="flex items-center gap-2.5 text-[11.5px] font-bold uppercase tracking-[.18em] text-primary before:h-0.5 before:w-[26px] before:rounded-sm before:bg-primary before:content-['']">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-[clamp(26px,3.6vw,36px)] font-medium leading-[1.12] tracking-[-.01em]">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-[56ch] text-[15px] text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
