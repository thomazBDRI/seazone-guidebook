/**
 * Reference catalog. Every guest-facing string in the app lives here (or in a
 * sibling locale file); nothing is written inline in a component.
 *
 * The exported `Messages` type is inferred from this object, so `en.ts` and
 * `es.ts` cannot compile while a key is missing or renamed. Parameterized
 * strings are functions — interpolation and pluralization differ per language,
 * so they belong to the catalog, not to the caller.
 */
const ptBR = {
  metadata: {
    title: "Guia do Hóspede — Seazone",
    description:
      "Guia digital personalizado da sua hospedagem: acesso, regras, comodidades e dicas da região.",
    propertyTitle: (name: string) => `${name} · Guia do Hóspede — Seazone`,
    propertyDescription: (code: string, city: string) =>
      `Guia da hospedagem ${code}: chegada, acesso, Wi-Fi, regras da estadia e dicas em ${city}.`,
    notFoundTitle: "Imóvel não encontrado · Guia do Hóspede — Seazone",
  },

  brand: { tagline: "Guia do Hóspede" },

  language: {
    label: "Idioma",
    switchTo: (name: string) => `Ver o guia em ${name}`,
  },

  topBar: { talkToHost: "Falar com anfitrião" },

  footer: {
    tagline: "Gestão inteligente de imóveis por temporada",
    copyright: "© 2026 Seazone Serviços Ltda. · Guia do Hóspede",
  },

  home: {
    title: "Guia do Hóspede — Seazone",
    hint: "Acesse o guia do seu imóvel pelo link enviado na confirmação da reserva",
    example: "ex.:",
  },

  notFound: {
    badge: "IMÓVEL NÃO ENCONTRADO",
    headingLead: "Parece que este imóvel",
    headingEmphasis: "navegou para longe",
    bodyLead: "Não encontramos nenhum imóvel com esse código. Confira o",
    bodyStrong: "link enviado na sua confirmação de reserva",
    bodyTail: "— o código aparece no final do endereço.",
    support: "Falar com a Seazone",
    example: (code: string) => `Ver exemplo: ${code}`,
    linkFormat: "O link do seu guia tem este formato:",
  },

  hero: {
    propertyBadge: (code: string) => `IMÓVEL ${code}`,
    askAi: "Tire dúvidas com a IA",
    stayGuide: "Guia da hospedagem",
    checkIn: "Check-in",
    checkOut: "Check-out",
    entry: "Entrada",
    checkInHint: "em diante",
    checkOutHint: "no máximo",
    selfCheckin: "Self check-in",
  },

  toc: {
    label: "Nesta página",
    current: "Seção",
    sections: {
      acesso: "Chegada & acesso",
      regras: "Regras da estadia",
      comodidades: "Comodidades",
      experiencias: "Explore a região",
      contato: "Contato",
    },
  },

  arrival: {
    eyebrow: "Sua chegada",
    title: "Chegada & acesso",
    description: "Como chegar, entrar e se conectar.",
    mapTitle: "Mapa — localização do imóvel",
    postalCode: (code: string) => `CEP ${code}`,
    uber: "Chamar Uber",
    maps: "Google Maps",
    howToEnter: "Como entrar",
    accessCode: (code: string) => `Código: ${code}`,
    selfCheckinBadge: "Self check-in — entre no seu horário",
    parking: "Estacionamento",
    wifi: {
      title: "Wi-Fi",
      description: "Copie a senha ou aponte a câmera para o código.",
      network: "Rede",
      password: "Senha",
      qrAlt: "QR code para conectar ao Wi-Fi",
      qrCaption: "Aponte a câmera do celular para conectar automaticamente",
    },
  },

  copyField: {
    copy: "Copiar",
    copied: "✓ Copiado",
    ariaCopy: (label: string) => `Copiar ${label.toLowerCase()}`,
  },

  rules: {
    eyebrow: "Boa convivência",
    title: "Regras da estadia",
    times: "Horários",
    duringStay: "Durante sua estadia",
    checkIn: "Check-in",
    checkOut: "Check-out",
    checkInHint: "a partir deste horário",
    checkOutHint: "até este horário",
  },

  amenities: {
    eyebrow: "O que o imóvel oferece",
    title: "Capacidade & comodidades",
    // the `: string` annotations keep a ternary from narrowing the inferred
    // Messages type down to the pt-BR literals
    bedrooms: (count: number): string => (count === 1 ? "quarto" : "quartos"),
    bathrooms: (count: number): string =>
      count === 1 ? "banheiro" : "banheiros",
    guests: (count: number): string =>
      count === 1 ? "hóspede no máximo" : "hóspedes no máximo",
  },

  experience: {
    title: (neighborhood: string, city: string) =>
      `Explore ${neighborhood} e ${city}`,
    subtitle:
      "Um guia criado especialmente para a sua estadia, com o melhor da região ao redor da sua hospedagem.",
    restaurants: "🍽️ Restaurantes próximos",
    attractions: "🌊 Atrações próximas",
    essentials: "🏥 Serviços essenciais",
    suggestions: (count: number) =>
      count === 1 ? `${count} sugestão` : `${count} sugestões`,
    seasonalTip: "Dica da estação",
    aiNotice: "Conteúdo gerado por IA com base na localização do imóvel",
    generatedOn: (date: string) => `gerado em ${date}`,
    mapLink: "Ver no mapa",
    instagram: "Instagram",
    skeleton: {
      title: "Preparando seu guia personalizado…",
      body: (neighborhood: string) =>
        `Nossa IA está explorando ${neighborhood} para encontrar os melhores lugares perto de você. Isso leva só alguns segundos.`,
    },
    failure: {
      title: "Não conseguimos gerar seu guia agora",
      body: "Nossa IA não respondeu desta vez. Todas as outras informações da sua hospedagem seguem disponíveis acima — pode tentar de novo.",
      retry: "Tentar novamente",
    },
  },

  host: {
    eyebrow: "Estamos por perto",
    title: "Fale com sua anfitriã",
    role: "Anfitriã Seazone deste imóvel",
    whatsapp: "WhatsApp",
  },

  chat: {
    dialogLabel: "Assistente virtual",
    title: "Assistente Seazone",
    online: (code: string) => `Online · conhece o ${code}`,
    close: "Fechar chat",
    openLauncher: "Abrir assistente virtual",
    closeLauncher: "Fechar assistente virtual",
    greetingLead: "Oi! 👋 Sou o assistente do",
    greetingTail:
      ". Posso ajudar com Wi-Fi, regras, horários e dicas da região. O que você precisa?",
    errorLead: (hostName: string) =>
      `Não consegui responder agora. Tente de novo em instantes ou fale com ${hostName} no`,
    errorLink: "WhatsApp",
    suggestions: [
      "Qual a senha do WiFi?",
      "Posso trazer meu cachorro?",
      "A que horas posso fazer check-in?",
      "Que restaurantes tem perto?",
    ],
    inputLabel: "Pergunte sobre o imóvel",
    inputPlaceholder: "Pergunte sobre o imóvel…",
    send: "Enviar",
    typing: "Digitando…",
    /** Appended when the stream breaks mid-answer (server-side, /api/chat). */
    apology:
      "\n\n(Desculpe, minha resposta foi interrompida. Pode perguntar de novo?)",
  },

  /** Database values → guest-facing sentences and labels (lib/domain/display). */
  domain: {
    rules: {
      guests: (capacity: number) => `Máximo de ${capacity} hóspedes`,
      petsAllowed: "Animais de estimação são bem-vindos",
      petsForbidden: "Não é permitido animais de estimação",
      smokingAllowed: "É permitido fumar no imóvel",
      smokingForbidden: "Proibido fumar no imóvel",
      childrenAllowed: "Crianças são bem-vindas",
      childrenForbidden: "Não recomendado para crianças",
      babiesAllowed: "Adequado para bebês",
      babiesForbidden: "Não adequado para bebês",
      eventsAllowed: "Festas e eventos são permitidos",
      eventsForbidden: "Festas e eventos não são permitidos",
    },
    amenities: {
      wifi: "Wi-Fi",
      tv: "TV",
      air_conditioning: "Ar-condicionado",
      kitchen: "Cozinha completa",
      washing_machine: "Máquina de lavar",
      elevator: "Elevador",
      balcony: "Varanda",
      bbq_grill: "Churrasqueira",
      dishwasher: "Lava-louças",
      pool: "Piscina",
      heating: "Aquecimento",
      fireplace: "Lareira",
      gym: "Academia",
      parking: "Estacionamento",
    },
    accessTypes: {
      smart_lock: "Fechadura eletrônica",
      keybox: "Cofre de chaves",
      doorman: "Portaria",
      fallback: "Acesso ao imóvel",
    },
    /**
     * Essentials `type` values are schema literals persisted in the guide
     * ("farmácia | supermercado | hospital"); keys are accent-free so a model
     * that drops the cedilla still resolves.
     */
    essentialTypes: {
      farmacia: "Farmácia",
      supermercado: "Supermercado",
      hospital: "Hospital",
    },
  },
};

export type Messages = typeof ptBR;

export default ptBR;
