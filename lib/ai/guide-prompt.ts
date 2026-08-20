import type { NearbyPois, Poi, PoiCategory } from "@/lib/ai/geo";
import { hasPois } from "@/lib/ai/geo";
import type { ChatMessage } from "@/lib/ai/openrouter";
import type { Property } from "@/lib/domain/property";

/**
 * Prompt assembly for the experiences guide. Pure functions — no network, no
 * env — so the grounding data and the guardrails are unit-testable.
 */

export type PromptProperty = Pick<
  Property,
  "name" | "property_type" | "neighborhood" | "city" | "state"
>;

export type GuidePromptInput = {
  property: PromptProperty;
  /** Null or empty when OSM grounding was unavailable. */
  pois: NearbyPois | null;
  /** Injected for deterministic tests; defaults to now. */
  now?: Date;
};

/** The exact shape GuideContentSchema accepts, shown to the model verbatim. */
export const JSON_CONTRACT = `{
  "welcome_message": "string",
  "restaurants": [{ "name": "string", "distance": "string", "description": "string" }],
  "attractions": [{ "name": "string", "distance": "string", "description": "string" }],
  "essentials": [{ "name": "string", "type": "farmácia | supermercado | hospital", "distance": "string", "description": "string" }],
  "seasonal_tip": "string"
}`;

const SYSTEM_PROMPT = `Você é um concierge local brasileiro que escreve guias de bairro para hóspedes de aluguel por temporada.

Regras invioláveis:
- Escreva sempre em português do Brasil, com tom acolhedor, direto e sem clichês de folheto turístico.
- Responda APENAS com um único objeto JSON válido. Sem markdown, sem cercas de código, sem comentários, sem texto antes ou depois.
- Nunca invente nomes de estabelecimentos. Se não tiver certeza de que um lugar existe, não o inclua.
- Descrições de uma única frase, específicas (o que o hóspede encontra ali), nunca genéricas.`;

export function buildGuideMessages({
  property,
  pois,
  now = new Date(),
}: GuidePromptInput): ChatMessage[] {
  const grounded = pois !== null && hasPois(pois);

  return [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: [
        propertyBlock(property, now),
        grounded ? candidatesBlock(pois) : "",
        grounded ? groundedRules(property) : fallbackRules(property),
        contractBlock(),
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
  ];
}

/**
 * Retry turn: replays the model's invalid answer and asks for a corrected one,
 * keeping the original instructions in context.
 */
export function buildCorrectionMessages(
  messages: ChatMessage[],
  invalidOutput: string,
  issues: string,
): ChatMessage[] {
  return [
    ...messages,
    { role: "assistant", content: invalidOutput.slice(0, 4000) },
    {
      role: "user",
      content: `Sua resposta anterior não respeitou o contrato JSON e foi rejeitada pela validação.

Problemas encontrados:
${issues}

Responda novamente com o JSON completo e válido, exatamente neste formato:
${JSON_CONTRACT}

Apenas o objeto JSON, sem markdown e sem nenhum texto fora dele.`,
    },
  ];
}

function propertyBlock(property: PromptProperty, now: Date): string {
  return `Imóvel: ${property.name} (${property.property_type})
Bairro: ${property.neighborhood}
Cidade: ${property.city} - ${property.state}
Mês atual: ${monthName(now)} (${seasonName(now)} no hemisfério sul)`;
}

const CATEGORY_LABELS: Record<PoiCategory, string> = {
  restaurants: "Restaurantes, cafés e bares",
  attractions: "Atrações, parques e praias",
  pharmacies: "Farmácias",
  supermarkets: "Supermercados",
  hospitals: "Hospitais e clínicas",
};

const CATEGORY_ORDER: PoiCategory[] = [
  "restaurants",
  "attractions",
  "pharmacies",
  "supermarkets",
  "hospitals",
];

function candidatesBlock(pois: NearbyPois): string {
  const blocks = CATEGORY_ORDER.filter(
    (category) => pois[category].length > 0,
  ).map(
    (category) =>
      `${CATEGORY_LABELS[category]}:\n${pois[category].map(poiLine).join("\n")}`,
  );

  return `Lugares reais mapeados ao redor do imóvel (dados do OpenStreetMap, com a distância já calculada a partir do endereço):

${blocks.join("\n\n")}`;
}

function poiLine(poi: Poi): string {
  return `- ${poi.name} | ${poi.distance}`;
}

function groundedRules(property: PromptProperty): string {
  return `O que escrever:
1. welcome_message: 2 a 3 frases dando boas-vindas, citando o imóvel e o bairro ${property.neighborhood} e o que caracteriza a região.
2. restaurants: escolha de 4 a 5 opções DA LISTA acima, priorizando as mais conhecidas e estabelecidas, com variedade de tipo e distância.
3. attractions: escolha de 3 a 4 opções DA LISTA acima.
4. essentials: exatamente três itens — uma farmácia (type "farmácia"), um supermercado (type "supermercado") e um hospital (type "hospital") — escolhidos da lista. Se alguma dessas categorias não aparecer na lista, omita apenas o item correspondente.
5. seasonal_tip: uma dica prática e específica para quem está em ${property.city} neste mês (clima, temporada, eventos típicos da época).

Restrições:
- Use SOMENTE nomes que aparecem na lista acima. Não acrescente lugares de fora dela.
- Copie a distância de cada lugar EXATAMENTE como está na lista, incluindo o "≈".
- Escreva você mesmo a descrição de cada lugar, com o que você sabe sobre ele; se não souber nada específico, descreva o que se espera do tipo de lugar sem inventar fatos (prêmios, datas, especialidades duvidosas).`;
}

function fallbackRules(property: PromptProperty): string {
  return `Não há lista de lugares mapeados desta vez — use apenas o seu conhecimento sobre ${property.city}.

O que escrever:
1. welcome_message: 2 a 3 frases dando boas-vindas, citando o imóvel e o bairro ${property.neighborhood} e o que caracteriza a região.
2. restaurants: 4 a 5 lugares FAMOSOS e consolidados de ${property.city}, que existem há anos e são fáceis de verificar.
3. attractions: 3 a 4 atrações reconhecidas de ${property.city} ou arredores.
4. essentials: uma farmácia (type "farmácia"), um supermercado (type "supermercado") e um hospital (type "hospital") — prefira redes e instituições conhecidas de ${property.city}.
5. seasonal_tip: dica prática para quem está em ${property.city} neste mês.

Restrições:
- Nada de estabelecimentos incertos, recém-abertos ou de existência duvidosa: apenas lugares notórios.
- As distâncias são aproximadas a partir do bairro ${property.neighborhood}: seja honesto, use faixas plausíveis no formato "≈ 800 m" ou "≈ 3,5 km" e nunca precise mais do que sabe.`;
}

function contractBlock(): string {
  return `Formato da resposta (JSON estrito, exatamente estas chaves):
${JSON_CONTRACT}`;
}

/** "agosto" — lowercase, as it appears mid-sentence in the prompt. */
export function monthName(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

/** Southern-hemisphere season, which is what both test cities live in. */
export function seasonName(date: Date): string {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const dayOfYear = month * 100 + day;

  if (dayOfYear >= 1221 || dayOfYear < 321) return "verão";
  if (dayOfYear < 621) return "outono";
  if (dayOfYear < 923) return "inverno";
  return "primavera";
}
