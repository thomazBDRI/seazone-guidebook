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

  brand: { tagline: "Guest Guide" },

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
    title: "Guest Guide — Seazone",
    hint: "Open your stay guide using the link sent in your booking confirmation",
    example: "e.g.",
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
