import { cva, type VariantProps } from "class-variance-authority";
import type { AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Button-shaped links from the mockup's `.btn` family. */
const actionLinkVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[12px] px-5 py-3 text-sm font-semibold transition-[transform,background-color,box-shadow] [&_svg]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-sea text-white shadow-card hover:-translate-y-px hover:shadow-elevated",
        sea: "bg-sea-light text-primary-strong hover:bg-[hsl(225_70%_91%)]",
        uber: "bg-black text-white hover:-translate-y-px hover:bg-[hsl(0_0%_15%)]",
        whatsapp:
          "bg-[hsl(142_65%_42%)] text-white shadow-[0_4px_18px_-4px_hsla(142,65%,35%,.5)] hover:-translate-y-px hover:bg-[hsl(142_65%_36%)]",
        outline:
          "border border-border bg-white text-foreground hover:bg-sea-mist",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export type ActionLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof actionLinkVariants>;

export function ActionLink({ className, variant, ...props }: ActionLinkProps) {
  return (
    <a className={cn(actionLinkVariants({ variant }), className)} {...props} />
  );
}

export { actionLinkVariants };
