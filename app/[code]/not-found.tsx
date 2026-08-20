import Link from "next/link";
import { BrandLockup, WhatsAppIcon } from "@/components/guide/brand";
import { Icon } from "@/components/guide/icon";
import { COPYRIGHT } from "@/components/guide/site-footer";
import { ActionLink } from "@/components/ui/action-link";

/** Seazone's own support line (the guest has no host to reach here). */
const SUPPORT_WHATSAPP = "554891234567";

export default function PropertyNotFound() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-sea-deep text-white">
      <header className="flex items-center px-[clamp(16px,4vw,40px)] py-[18px]">
        <Link href="/">
          <BrandLockup />
        </Link>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-[clamp(16px,4vw,40px)] pb-20 pt-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(560px_340px_at_80%_10%,hsla(220,100%,55%,.22),transparent_65%),radial-gradient(480px_300px_at_10%_90%,hsla(2,97%,66%,.12),transparent_65%)]"
        />
        <div className="relative max-w-[520px] animate-rise text-center">
          <LostIsland />

          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-coral/[.45] bg-coral/[.14] px-[15px] py-1.5 text-xs font-bold tracking-[.16em] text-[hsl(2_100%_80%)]">
            <Icon
              name="circle-alert"
              className="size-[13px]"
              strokeWidth={2.4}
            />
            IMÓVEL NÃO ENCONTRADO
          </span>
          <h1 className="mb-3.5 font-display text-[clamp(30px,5.6vw,44px)] font-medium leading-[1.1] tracking-[-.01em]">
            Parece que este imóvel{" "}
            <em className="italic text-[hsl(225_90%_78%)]">
              navegou para longe
            </em>
          </h1>
          <p className="mx-auto mb-[30px] max-w-[42ch] text-base leading-relaxed text-sea-light/[.68]">
            Não encontramos nenhum imóvel com esse código. Confira o{" "}
            <b className="font-semibold text-white">
              link enviado na sua confirmação de reserva
            </b>{" "}
            — o código aparece no final do endereço.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <ActionLink
              href={`https://wa.me/${SUPPORT_WHATSAPP}`}
              target="_blank"
              rel="noopener"
              className="px-6 py-[13px] text-[14.5px] shadow-[0_10px_30px_-8px_hsla(220,100%,50%,.5)] hover:shadow-[0_10px_30px_-8px_hsla(220,100%,50%,.5)]"
            >
              <WhatsAppIcon />
              Falar com a Seazone
            </ActionLink>
            <Link
              href="/FLN001"
              className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-white/20 bg-white/[.09] px-6 py-[13px] text-[14.5px] font-semibold text-white transition-[transform,background-color] hover:bg-white/[.16]"
            >
              Ver exemplo: FLN001
            </Link>
          </div>
          <p className="mt-[34px] text-[13px] text-sea-light/[.45]">
            O link do seu guia tem este formato:{" "}
            <code className="rounded-md border border-white/[.14] bg-white/[.08] px-2 py-0.5 font-mono text-[12.5px] text-[hsl(225_90%_80%)]">
              guia.seazone.com.br/FLN001
            </code>
          </p>
        </div>
      </main>

      <footer className="px-[clamp(16px,4vw,40px)] pb-[calc(22px+env(safe-area-inset-bottom))] pt-[22px] text-center text-xs text-sea-light/40">
        {COPYRIGHT}
      </footer>
    </div>
  );
}

/** Floating island art from the mockup's error page. */
function LostIsland() {
  return (
    <div className="relative mx-auto mb-2 h-[150px] w-[190px]">
      <div className="absolute right-[22px] top-1.5 size-[38px] animate-float-slow rounded-full bg-coral opacity-90 shadow-[0_0_40px_hsla(2,97%,66%,.5)]" />
      <svg
        viewBox="0 0 190 90"
        fill="none"
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-full"
      >
        <g className="animate-float">
          <ellipse cx="95" cy="62" rx="46" ry="12" fill="hsl(35 60% 72%)" />
          <path
            d="M95 62V30"
            stroke="hsl(25 40% 40%)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M95 32c-3-9 5-15 13-14-6 3-7 7-6 9 7-5 16-2 18 4-7-2-11 0-13 2 8 1 12 7 10 12-5-6-10-6-14-5"
            fill="hsl(150 45% 42%)"
          />
          <path
            d="M95 32c3-8-4-14-12-13 5 3 6 6 5 8-7-4-14-1-16 5 6-2 10 0 12 2-7 1-10 6-8 10 4-5 9-5 13-4"
            fill="hsl(150 50% 35%)"
          />
        </g>
        <path
          d="M0 78c14 0 14-7 27-7s14 7 27 7 14-7 27-7 14 7 27 7 14-7 27-7 14 7 28 7 13-7 27-7"
          stroke="hsl(220 100% 55%)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity=".85"
        />
        <path
          d="M0 88c14 0 14-7 27-7s14 7 27 7 14-7 27-7 14 7 27 7 14-7 27-7 14 7 28 7 13-7 27-7"
          stroke="hsl(220 100% 50%)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity=".4"
        />
      </svg>
    </div>
  );
}
