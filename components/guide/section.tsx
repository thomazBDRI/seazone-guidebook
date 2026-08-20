import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Page section on the light background: centered 1080px column (mockup `.block.wrap`). */
export function GuideSection({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "mx-auto max-w-[1080px] px-[clamp(16px,4vw,40px)] pt-[clamp(44px,7vw,72px)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
