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

  brand: { name: "Seazone", tagline: "Guía del Huésped" },

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
    eyebrow: "Guía del Huésped",
    titleLead: "Todo sobre tu",
    titleEmphasis: "alojamiento",
    subtitle:
      "Llegada, acceso, Wi-Fi, normas y comodidades del alojamiento — más una guía de la zona creada por IA y un asistente para resolver dudas a cualquier hora.",
    notice: {
      title: "Este listado existe solo para la evaluación técnica",
      body: (example: string) =>
        `Está aquí para que quien evalúa esta prueba pueda abrir cualquier alojamiento rápidamente. El huésped real recibe un enlace directo a su alojamiento (${example}) y nunca ve un listado.`,
    },
    list: {
      eyebrow: "Alojamientos registrados",
      title: "Elige un alojamiento",
      description:
        "Las tarjetas de abajo vienen de la base de datos: nada en esta página está escrito en el código.",
    },
    guests: (count: number): string => (count === 1 ? "huésped" : "huéspedes"),
    openGuide: "Abrir la guía",
    empty:
      "No hay alojamientos en la base de datos. Ejecuta `bun run db:seed` para cargar los alojamientos de referencia.",
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
      // "Comodidades" rather than "Servicios": the section below owns that word
      comodidades: "Comodidades",
      servicos: "Servicios",
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
    title: "Capacidad y comodidades",
    bedrooms: (count: number) => (count === 1 ? "dormitorio" : "dormitorios"),
    bathrooms: (count: number) => (count === 1 ? "baño" : "baños"),
    guests: (count: number) =>
      count === 1 ? "huésped como máximo" : "huéspedes como máximo",
  },

  services: {
    eyebrow: "Servicios a petición",
    title: "¿Necesitas algo más?",
    description:
      "Acuérdalo directamente con quien cuida el alojamiento — todo sujeto a disponibilidad.",
    emergency: {
      title: "Emergencias",
      numbers: "Ambulancia 192 · Bomberos 193 · Policía 190",
      note: (hostName: string) =>
        `Para problemas en el alojamiento — una fuga, un corte de luz, una cerradura atascada — habla primero con ${hostName}.`,
    },
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
      jacuzzi: "Jacuzzi",
      beach_access: "Acceso a la playa",
    },
    services: {
      early_checkin: ({ host, checkIn }) =>
        `¿Quieres entrar antes de las ${checkIn}? Habla con ${host} — sujeto a disponibilidad.`,
      late_checkout: ({ host }) =>
        `¿Necesitas salir más tarde? Acuérdalo con ${host} — sujeto a disponibilidad.`,
      extend_stay: () =>
        "¿Quieres quedarte más días? Habla con el equipo de Seazone y consigue descuento en las noches extra.",
      midstay_cleaning: ({ host }) =>
        `¿Limpieza extra durante la estancia? Pídesela a ${host}.`,
      luggage_storage: ({ host }) =>
        `¿Sales demasiado temprano? Pregúntale a ${host} por la guarda de equipaje.`,
      airport_transfer: ({ host }) =>
        `Traslado del aeropuerto: consulta precios y horarios con ${host}.`,
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
