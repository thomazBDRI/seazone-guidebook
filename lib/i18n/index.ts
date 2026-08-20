import type { Locale } from "@/lib/i18n/locales";
import en from "@/lib/i18n/messages/en";
import es from "@/lib/i18n/messages/es";
import ptBR, { type Messages } from "@/lib/i18n/messages/pt-BR";

const CATALOGS: Record<Locale, Messages> = {
  "pt-BR": ptBR,
  en,
  es,
};

/**
 * The whole catalog for a locale. Statically imported (no dynamic import) so
 * client components can resolve their own strings from a `locale` prop —
 * message functions cannot cross the server/client boundary as props.
 */
export function getMessages(locale: Locale): Messages {
  return CATALOGS[locale];
}

export type { Messages };
