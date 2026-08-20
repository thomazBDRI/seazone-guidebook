import type { Messages } from "@/lib/i18n/messages/pt-BR";

/** Spanish catalog. Typed against the reference so gaps are compile errors. */
const es: Messages = {
  metadata: {
    title: "Guía del Huésped — Seazone",
    description:
      "Guía digital personalizada de tu alojamiento: acceso, normas, servicios y recomendaciones de la zona.",
    propertyTitle: (name: string) => `${name} · Guía del Huésped — Seazone`,
    propertyDescription: (code: string, city: string) =>
      `Guía del alojamiento ${code}: llegada, acceso, wifi, normas de la estancia y planes en ${city}.`,
    notFoundTitle: "Alojamiento no encontrado · Guía del Huésped — Seazone",
  },

  brand: { tagline: "Guía del Huésped" },

  language: {
    label: "Idioma",
    switchTo: (name: string) => `Ver la guía en ${name}`,
  },

  topBar: { talkToHost: "Hablar con el anfitrión" },

  footer: {
    tagline: "Gestión inteligente de alquileres vacacionales",
    copyright: "© 2026 Seazone Serviços Ltda. · Guía del Huésped",
  },

  home: {
    title: "Guía del Huésped — Seazone",
    hint: "Entra en la guía de tu alojamiento con el enlace que recibiste al confirmar la reserva",
    example: "p. ej.:",
  },

  notFound: {
    badge: "ALOJAMIENTO NO ENCONTRADO",
    headingLead: "Parece que este alojamiento",
    headingEmphasis: "se fue navegando",
    bodyLead: "No encontramos ningún alojamiento con ese código. Revisa el",
    bodyStrong: "enlace que recibiste al confirmar la reserva",
    bodyTail: "— el código aparece al final de la dirección.",
    support: "Hablar con Seazone",
    example: (code: string) => `Ver ejemplo: ${code}`,
    linkFormat: "El enlace de tu guía tiene este formato:",
  },

  hero: {
    propertyBadge: (code: string) => `ALOJAMIENTO ${code}`,
    askAi: "Pregunta a la IA",
    stayGuide: "Guía del alojamiento",
    checkIn: "Check-in",
    checkOut: "Check-out",
    entry: "Entrada",
    checkInHint: "en adelante",
    checkOutHint: "como máximo",
    selfCheckin: "Self check-in",
  },

  toc: {
    label: "En esta página",
    current: "Sección",
    sections: {
      acesso: "Llegada y acceso",
      regras: "Normas de la estancia",
      comodidades: "Servicios",
      experiencias: "Explora la zona",
      contato: "Contacto",
    },
  },

  arrival: {
    eyebrow: "Tu llegada",
    title: "Llegada y acceso",
    description: "Cómo llegar, entrar y conectarte.",
    mapTitle: "Mapa — ubicación del alojamiento",
    postalCode: (code: string) => `CP ${code}`,
    uber: "Pedir un Uber",
    maps: "Google Maps",
    howToEnter: "Cómo entrar",
    accessCode: (code: string) => `Código: ${code}`,
    selfCheckinBadge: "Self check-in — entra a tu hora",
    parking: "Aparcamiento",
    wifi: {
      title: "Wifi",
      description: "Copia la contraseña o apunta la cámara al código.",
      network: "Red",
      password: "Contraseña",
      qrAlt: "Código QR para conectarse al wifi",
      qrCaption: "Apunta la cámara del móvil para conectarte automáticamente",
    },
  },

  copyField: {
    copy: "Copiar",
    copied: "✓ Copiado",
    ariaCopy: (label: string) => `Copiar ${label.toLowerCase()}`,
  },

  rules: {
    eyebrow: "Buena convivencia",
    title: "Normas de la estancia",
    times: "Horarios",
    duringStay: "Durante tu estancia",
    checkIn: "Check-in",
    checkOut: "Check-out",
    checkInHint: "a partir de esta hora",
    checkOutHint: "hasta esta hora",
  },

  amenities: {
    eyebrow: "Lo que ofrece el alojamiento",
    title: "Capacidad y servicios",
    bedrooms: (count: number) => (count === 1 ? "dormitorio" : "dormitorios"),
    bathrooms: (count: number) => (count === 1 ? "baño" : "baños"),
    guests: (count: number) =>
      count === 1 ? "huésped como máximo" : "huéspedes como máximo",
  },

  experience: {
    title: (neighborhood: string, city: string) =>
      `Explora ${neighborhood} y ${city}`,
    subtitle:
      "Una guía creada especialmente para tu estancia, con lo mejor de la zona alrededor del alojamiento.",
    restaurants: "🍽️ Restaurantes cerca",
    attractions: "🌊 Atracciones cerca",
    essentials: "🏥 Servicios esenciales",
    suggestions: (count: number) =>
      count === 1 ? `${count} sugerencia` : `${count} sugerencias`,
    seasonalTip: "Consejo de temporada",
    aiNotice:
      "Contenido generado por IA a partir de la ubicación del alojamiento",
    generatedOn: (date: string) => `generado el ${date}`,
    mapLink: "Ver en el mapa",
    instagram: "Instagram",
    skeleton: {
      title: "Preparando tu guía personalizada…",
      body: (neighborhood: string) =>
        `Nuestra IA está explorando ${neighborhood} para encontrar los mejores sitios cerca de ti. Tarda solo unos segundos.`,
    },
    failure: {
      title: "No pudimos preparar tu guía ahora",
      body: "Nuestra IA no respondió esta vez. Toda la demás información de tu estancia sigue disponible arriba — puedes intentarlo de nuevo.",
      retry: "Intentar de nuevo",
    },
  },

  host: {
    eyebrow: "Estamos cerca",
    title: "Habla con tu anfitrión",
    role: "Anfitrión Seazone de este alojamiento",
    whatsapp: "WhatsApp",
  },

  chat: {
    dialogLabel: "Asistente virtual",
    title: "Asistente Seazone",
    online: (code: string) => `En línea · conoce el ${code}`,
    close: "Cerrar chat",
    openLauncher: "Abrir el asistente virtual",
    closeLauncher: "Cerrar el asistente virtual",
    greetingLead: "¡Hola! 👋 Soy el asistente de",
    greetingTail:
      ". Puedo ayudarte con el wifi, las normas, los horarios y planes en la zona. ¿Qué necesitas?",
    errorLead: (hostName: string) =>
      `No pude responder ahora mismo. Inténtalo de nuevo en un momento o habla con ${hostName} por`,
    errorLink: "WhatsApp",
    suggestions: [
      "¿Cuál es la contraseña del wifi?",
      "¿Puedo traer a mi perro?",
      "¿A qué hora puedo hacer el check-in?",
      "¿Qué restaurantes hay cerca?",
    ],
    inputLabel: "Pregunta sobre el alojamiento",
    inputPlaceholder: "Pregunta sobre el alojamiento…",
    send: "Enviar",
    typing: "Escribiendo…",
    apology:
      "\n\n(Perdona, mi respuesta se cortó. ¿Puedes preguntarme otra vez?)",
  },

  domain: {
    rules: {
      guests: (capacity: number) => `Máximo de ${capacity} huéspedes`,
      petsAllowed: "Se admiten mascotas",
      petsForbidden: "No se admiten mascotas",
      smokingAllowed: "Se permite fumar en el alojamiento",
      smokingForbidden: "Prohibido fumar en el alojamiento",
      childrenAllowed: "Los niños son bienvenidos",
      childrenForbidden: "No recomendado para niños",
      babiesAllowed: "Apto para bebés",
      babiesForbidden: "No apto para bebés",
      eventsAllowed: "Se permiten fiestas y eventos",
      eventsForbidden: "No se permiten fiestas ni eventos",
    },
    amenities: {
      wifi: "Wifi",
      tv: "TV",
      air_conditioning: "Aire acondicionado",
      kitchen: "Cocina completa",
      washing_machine: "Lavadora",
      elevator: "Ascensor",
      balcony: "Balcón",
      bbq_grill: "Parrilla",
      dishwasher: "Lavavajillas",
      pool: "Piscina",
      heating: "Calefacción",
      fireplace: "Chimenea",
      gym: "Gimnasio",
      parking: "Aparcamiento",
    },
    accessTypes: {
      smart_lock: "Cerradura electrónica",
      keybox: "Caja de llaves",
      doorman: "Recepción",
    },
    accessTypeFallback: "Acceso al alojamiento",
    essentialTypes: {
      farmacia: "Farmacia",
      supermercado: "Supermercado",
      hospital: "Hospital",
    },
  },
};

export default es;
