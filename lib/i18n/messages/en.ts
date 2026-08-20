import type { Messages } from "@/lib/i18n/messages/pt-BR";

/** English catalog. Typed against the reference so gaps are compile errors. */
const en: Messages = {
  metadata: {
    title: "Guest Guide — Seazone",
    description:
      "Your personal digital stay guide: access, house rules, amenities and local tips.",
    propertyTitle: (name: string) => `${name} · Guest Guide — Seazone`,
    propertyDescription: (code: string, city: string) =>
      `Guide for stay ${code}: arrival, access, Wi-Fi, house rules and things to do in ${city}.`,
    notFoundTitle: "Property not found · Guest Guide — Seazone",
  },

  brand: { name: "Seazone", tagline: "Guest Guide" },

  language: {
    label: "Language",
    switchTo: (name: string) => `View the guide in ${name}`,
  },

  topBar: { talkToHost: "Message your host" },

  footer: {
    tagline: "Smart management for short-term rentals",
    copyright: "© 2026 Seazone Serviços Ltda. · Guest Guide",
  },

  home: {
    eyebrow: "Guest Guide",
    titleLead: "Everything about your",
    titleEmphasis: "stay",
    subtitle:
      "Arrival, access, Wi-Fi, house rules and amenities — plus an AI-written guide to the neighbourhood and an assistant ready to answer anything, any time.",
    notice: {
      title: "This listing is here only for the technical review",
      body: (example: string) =>
        `It exists so whoever is reviewing this test can open any property quickly. A real guest gets a direct link to their own stay (${example}) and never sees a list of properties.`,
    },
    list: {
      eyebrow: "Properties on record",
      title: "Pick a property",
      description:
        "The cards below come from the database: nothing on this page is hardcoded.",
    },
    guests: (count: number): string => (count === 1 ? "guest" : "guests"),
    openGuide: "Open the guide",
    empty:
      "No properties in the database. Run `bun run db:seed` to load the reference properties.",
  },

  notFound: {
    badge: "PROPERTY NOT FOUND",
    headingLead: "Looks like this property",
    headingEmphasis: "sailed away",
    bodyLead: "We could not find any property with that code. Check the",
    bodyStrong: "link sent in your booking confirmation",
    bodyTail: "— the code is at the end of the address.",
    support: "Message Seazone",
    example: (code: string) => `See an example: ${code}`,
    linkFormat: "Your guide link looks like this:",
  },

  hero: {
    propertyBadge: (code: string) => `PROPERTY ${code}`,
    askAi: "Ask the AI assistant",
    stayGuide: "Stay guide",
    checkIn: "Check-in",
    checkOut: "Check-out",
    entry: "Entry",
    checkInHint: "onwards",
    checkOutHint: "at the latest",
    selfCheckin: "Self check-in",
  },

  toc: {
    label: "On this page",
    current: "Section",
    sections: {
      acesso: "Arrival & access",
      regras: "House rules",
      comodidades: "Amenities",
      servicos: "Services",
      experiencias: "Explore the area",
      contato: "Contact",
    },
  },

  arrival: {
    eyebrow: "Your arrival",
    title: "Arrival & access",
    description: "How to get there, get in and get online.",
    mapTitle: "Map — property location",
    postalCode: (code: string) => `ZIP ${code}`,
    uber: "Get an Uber",
    maps: "Google Maps",
    howToEnter: "How to get in",
    accessCode: (code: string) => `Code: ${code}`,
    selfCheckinBadge: "Self check-in — arrive on your own schedule",
    parking: "Parking",
    wifi: {
      title: "Wi-Fi",
      description: "Copy the password or point your camera at the code.",
      network: "Network",
      password: "Password",
      qrAlt: "QR code to join the Wi-Fi",
      qrCaption: "Point your phone camera at it to connect automatically",
    },
  },

  copyField: {
    copy: "Copy",
    copied: "✓ Copied",
    ariaCopy: (label: string) => `Copy ${label.toLowerCase()}`,
  },

  rules: {
    eyebrow: "Good neighbours",
    title: "House rules",
    times: "Times",
    duringStay: "During your stay",
    checkIn: "Check-in",
    checkOut: "Check-out",
    checkInHint: "from this time onwards",
    checkOutHint: "by this time",
  },

  amenities: {
    eyebrow: "What the property offers",
    title: "Capacity & amenities",
    bedrooms: (count: number) => (count === 1 ? "bedroom" : "bedrooms"),
    bathrooms: (count: number) => (count === 1 ? "bathroom" : "bathrooms"),
    guests: (count: number) =>
      count === 1 ? "guest maximum" : "guests maximum",
  },

  services: {
    eyebrow: "Services on request",
    title: "Need anything else?",
    description:
      "Arrange it directly with whoever looks after the place — all subject to availability.",
    titles: {
      early_checkin: "Arrive earlier",
      late_checkout: "Leave later",
      extend_stay: "Extend your stay",
      midstay_cleaning: "Extra cleaning",
      luggage_storage: "Luggage storage",
      airport_transfer: "Airport transfer",
    },
    cta: {
      host: (firstName: string) => `Message ${firstName}`,
      seazone: "Message Seazone",
    },
    prefill: {
      host: ({ host, property, code, service }) =>
        `Hi ${host}! I'm staying at ${property} (${code}) and I'd like to know about: ${service}.`,
      seazone: ({ property, code }) =>
        `Hi! I'm staying at ${property} (${code}) and I'd like to extend my stay.`,
    },
    directBooking: {
      title: "Already thinking about the next trip?",
      body: "Book direct with Seazone and get exclusive rates on your next stay.",
      cta: "Book with Seazone",
    },
  },

  experience: {
    title: (neighborhood: string, city: string) =>
      `Explore ${neighborhood} and ${city}`,
    subtitle:
      "A guide put together for your stay, with the best of the area around your place.",
    restaurants: "🍽️ Restaurants nearby",
    attractions: "🌊 Attractions nearby",
    essentials: "🏥 Essential services",
    suggestions: (count: number) =>
      count === 1 ? `${count} suggestion` : `${count} suggestions`,
    seasonalTip: "Seasonal tip",
    aiNotice: "AI-generated content based on the property location",
    generatedOn: (date: string) => `generated on ${date}`,
    mapLink: "View on map",
    instagram: "Instagram",
    skeleton: {
      title: "Putting your personal guide together…",
      body: (neighborhood: string) =>
        `Our AI is exploring ${neighborhood} to find the best places near you. This only takes a few seconds.`,
    },
    failure: {
      title: "We could not put your guide together right now",
      body: "Our AI did not answer this time. Everything else about your stay is still available above — feel free to try again.",
      retry: "Try again",
    },
  },

  host: {
    eyebrow: "We are nearby",
    title: "Talk to your host",
    role: "Seazone host for this property",
    whatsapp: "WhatsApp",
  },

  chat: {
    dialogLabel: "Virtual assistant",
    title: "Seazone Assistant",
    online: (code: string) => `Online · knows ${code}`,
    close: "Close chat",
    openLauncher: "Open the virtual assistant",
    closeLauncher: "Close the virtual assistant",
    greetingLead: "Hi! 👋 I am the assistant for",
    greetingTail:
      ". I can help with Wi-Fi, house rules, times and local tips. What do you need?",
    errorLead: (hostName: string) =>
      `I could not answer just now. Try again in a moment or reach ${hostName} on`,
    errorLink: "WhatsApp",
    suggestions: [
      "What is the Wi-Fi password?",
      "Can I bring my dog?",
      "What time can I check in?",
      "Which restaurants are nearby?",
    ],
    inputLabel: "Ask about the property",
    inputPlaceholder: "Ask about the property…",
    send: "Send",
    typing: "Typing…",
    apology: "\n\n(Sorry, my answer was cut off. Could you ask again?)",
  },

  domain: {
    rules: {
      guests: (capacity: number) => `Up to ${capacity} guests`,
      petsAllowed: "Pets are welcome",
      petsForbidden: "Pets are not allowed",
      smokingAllowed: "Smoking is allowed indoors",
      smokingForbidden: "No smoking indoors",
      childrenAllowed: "Children are welcome",
      childrenForbidden: "Not recommended for children",
      babiesAllowed: "Suitable for babies",
      babiesForbidden: "Not suitable for babies",
      eventsAllowed: "Parties and events are allowed",
      eventsForbidden: "Parties and events are not allowed",
    },
    amenities: {
      wifi: "Wi-Fi",
      tv: "TV",
      air_conditioning: "Air conditioning",
      kitchen: "Full kitchen",
      washing_machine: "Washing machine",
      elevator: "Elevator",
      balcony: "Balcony",
      bbq_grill: "Barbecue grill",
      dishwasher: "Dishwasher",
      pool: "Pool",
      heating: "Heating",
      fireplace: "Fireplace",
      gym: "Gym",
      parking: "Parking",
      jacuzzi: "Hot tub",
      beach_access: "Beach access",
    },
    services: {
      early_checkin: ({ host, checkIn }) =>
        `Want to get in before ${checkIn}? Ask ${host} — subject to availability.`,
      late_checkout: ({ host }) =>
        `Need to leave later? Arrange it with ${host} — subject to availability.`,
      extend_stay: () =>
        "Thinking of staying longer? Talk to the Seazone team and get a discount on the extra nights.",
      midstay_cleaning: ({ host }) =>
        `Extra cleaning during your stay? Just ask ${host}.`,
      luggage_storage: ({ host }) =>
        `Late flight? Leave your bags with ${host} and enjoy the day.`,
      airport_transfer: ({ host }) =>
        `Airport transfer: check prices and times with ${host}.`,
    },
    accessTypes: {
      smart_lock: "Smart lock",
      keybox: "Key box",
      doorman: "Front desk",
    },
    accessTypeFallback: "Property access",
    essentialTypes: {
      farmacia: "Pharmacy",
      supermercado: "Supermarket",
      hospital: "Hospital",
    },
  },
};

export default en;
