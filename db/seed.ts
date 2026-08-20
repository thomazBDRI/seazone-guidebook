/**
 * Seeds the reference properties from the challenge brief plus four more that
 * exercise the conditional paths of the guide (no parking, no TV, doorman
 * access, pets and events allowed, unusual property types). Idempotent upsert.
 *
 * Every address is a real, geocodable one — the guide pipeline sends it to
 * Nominatim, so an invented street would silently fall back to the city
 * centre and the region guide would describe the wrong neighbourhood.
 *
 * Usage: bun run db:seed  (reads SUPABASE_DB_URL from the environment)
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { properties } from "./schema";

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error("SUPABASE_DB_URL is not set");
  process.exit(1);
}

type NewProperty = typeof properties.$inferInsert;

const seedProperties: NewProperty[] = [
  {
    code: "FLN001",
    name: "Apartamento Beira-Mar Florianópolis",
    propertyType: "Apartamento",
    bedroomQuantity: 2,
    bathroomQuantity: 1,
    guestCapacity: 4,
    street: "Rua Lauro Linhares",
    number: "589",
    complement: "Apto 301",
    neighborhood: "Trindade",
    city: "Florianópolis",
    state: "SC",
    postalCode: "88036-001",
    wifiNetwork: "SeaHome_FLN001",
    wifiPassword: "floripa2024",
    isSelfCheckin: true,
    propertyAccessType: "smart_lock",
    propertyAccessInstructions: "Use o código 4521 na fechadura eletrônica",
    propertyPassword: "4521",
    hasParkingSpot: true,
    parkingSpotIdentifier: "Vaga 12 — subsolo B1",
    parkingSpotInstructions: "Portão lateral, código 7890 no interfone",
    checkInTime: "15:00",
    checkOutTime: "11:00",
    allowPet: false,
    smokingPermitted: false,
    suitableForChildren: true,
    suitableForBabies: true,
    eventsPermitted: false,
    amenities: {
      wifi: true,
      tv: true,
      air_conditioning: true,
      kitchen: true,
      washing_machine: true,
      elevator: true,
      balcony: true,
    },
    services: { early_checkin: true, extend_stay: true, luggage_storage: true },
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    ],
    hostName: "Ana Paula",
    hostPhone: "+5548991234567",
  },
  {
    code: "GRM001",
    name: "Chalé Serra Gramado",
    propertyType: "Casa",
    bedroomQuantity: 3,
    bathroomQuantity: 2,
    guestCapacity: 6,
    street: "Rua das Hortênsias",
    number: "220",
    complement: null,
    neighborhood: "Planalto",
    city: "Gramado",
    state: "RS",
    postalCode: "95670-000",
    wifiNetwork: "ChaletSerra_GRM",
    wifiPassword: "gramado@2024",
    isSelfCheckin: false,
    propertyAccessType: "keybox",
    propertyAccessInstructions:
      "A chave está no cofre na entrada. Código: 1983",
    propertyPassword: "1983",
    hasParkingSpot: true,
    parkingSpotIdentifier: null,
    parkingSpotInstructions: "Garagem própria para 2 carros",
    checkInTime: "14:00",
    checkOutTime: "12:00",
    allowPet: true,
    smokingPermitted: false,
    suitableForChildren: true,
    suitableForBabies: false,
    eventsPermitted: false,
    amenities: {
      wifi: true,
      tv: true,
      kitchen: true,
      bbq_grill: true,
      balcony: true,
      dishwasher: true,
    },
    services: {
      late_checkout: true,
      extend_stay: true,
      airport_transfer:
        "Transfer particular até Canela e Gramado centro — combine com Carlos",
    },
    images: [
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800",
    ],
    hostName: "Carlos Eduardo",
    hostPhone: "+5554998765432",
  },
  {
    code: "BBN001",
    name: "Casa Pé na Areia Bombinhas",
    propertyType: "Casa",
    bedroomQuantity: 4,
    bathroomQuantity: 3,
    guestCapacity: 10,
    street: "Avenida Leopoldo Zarling",
    number: "780",
    complement: null,
    neighborhood: "Bombas",
    city: "Bombinhas",
    state: "SC",
    postalCode: "88215-000",
    wifiNetwork: "PeNaAreia_BBN001",
    wifiPassword: "bombinhas2026",
    isSelfCheckin: true,
    propertyAccessType: "smart_lock",
    propertyAccessInstructions:
      "Use o código 8317 na fechadura eletrônica do portão da frente",
    propertyPassword: "8317",
    hasParkingSpot: true,
    parkingSpotIdentifier: "2 vagas na garagem coberta",
    parkingSpotInstructions:
      "Portão automático — o controle fica na bancada da cozinha",
    checkInTime: "15:00",
    checkOutTime: "11:00",
    allowPet: true,
    smokingPermitted: false,
    suitableForChildren: true,
    suitableForBabies: true,
    eventsPermitted: true,
    amenities: {
      wifi: true,
      tv: true,
      air_conditioning: true,
      kitchen: true,
      washing_machine: true,
      pool: true,
      jacuzzi: true,
      bbq_grill: true,
      beach_access: true,
    },
    services: {
      early_checkin: true,
      late_checkout: true,
      midstay_cleaning: true,
    },
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800",
    ],
    hostName: "Juliana Prado",
    hostPhone: "+5547988112233",
  },
  {
    code: "BCB001",
    name: "Studio Vista Mar Balneário Camboriú",
    propertyType: "Studio",
    bedroomQuantity: 1,
    bathroomQuantity: 1,
    guestCapacity: 2,
    street: "Avenida Atlântica",
    number: "3150",
    complement: "Apto 1204",
    neighborhood: "Centro",
    city: "Balneário Camboriú",
    state: "SC",
    postalCode: "88332-135",
    wifiNetwork: "VistaMar_BCB001",
    wifiPassword: "camboriu@2026",
    isSelfCheckin: true,
    propertyAccessType: "keybox",
    propertyAccessInstructions:
      "A chave está no cofre ao lado da porta do apartamento. Código: 2077",
    propertyPassword: "2077",
    // exercises the conditional parking card: the building has no spot to let
    hasParkingSpot: false,
    parkingSpotIdentifier: null,
    parkingSpotInstructions: null,
    checkInTime: "15:00",
    checkOutTime: "11:00",
    allowPet: false,
    smokingPermitted: false,
    suitableForChildren: false,
    suitableForBabies: false,
    eventsPermitted: false,
    amenities: {
      wifi: true,
      tv: true,
      air_conditioning: true,
      pool: true,
      gym: true,
    },
    services: { extend_stay: true, luggage_storage: true },
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
    ],
    hostName: "Rafael Menezes",
    hostPhone: "+5547997654321",
  },
  {
    code: "ROS001",
    name: "Cabana Vista do Rosa",
    propertyType: "Cabana",
    bedroomQuantity: 1,
    bathroomQuantity: 1,
    guestCapacity: 3,
    street: "Avenida Central da Praia do Rosa",
    number: "155",
    complement: null,
    neighborhood: "Praia do Rosa",
    city: "Imbituba",
    state: "SC",
    postalCode: "88780-000",
    wifiNetwork: "VistaDoRosa",
    wifiPassword: "rosa2026surf",
    isSelfCheckin: true,
    propertyAccessType: "keybox",
    propertyAccessInstructions:
      "A chave está no cofre da varanda, atrás do vaso de bromélias. Código: 4409",
    propertyPassword: "4409",
    hasParkingSpot: true,
    parkingSpotIdentifier: null,
    parkingSpotInstructions: "Vaga descoberta em frente à cabana",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    allowPet: true,
    smokingPermitted: true,
    suitableForChildren: true,
    suitableForBabies: false,
    eventsPermitted: false,
    // no TV on purpose: the amenities grid has to read well while short
    amenities: {
      wifi: true,
      kitchen: true,
      fireplace: true,
      balcony: true,
    },
    services: {
      airport_transfer:
        "Buscamos em Florianópolis ou Jaguaruna — avise o voo com dois dias de antecedência",
    },
    images: [
      "https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    ],
    hostName: "Diego Ramos",
    hostPhone: "+5548996558877",
  },
  {
    code: "JUR001",
    name: "Apartamento Jurerê Internacional",
    propertyType: "Apartamento",
    bedroomQuantity: 3,
    bathroomQuantity: 2,
    guestCapacity: 6,
    street: "Avenida dos Búzios",
    number: "410",
    complement: "Bloco B, Apto 202",
    neighborhood: "Jurerê Internacional",
    city: "Florianópolis",
    state: "SC",
    postalCode: "88053-301",
    wifiNetwork: "Jurere_JUR001",
    wifiPassword: "jurere@2026",
    // the only property with a reception: no self check-in, no door code
    isSelfCheckin: false,
    propertyAccessType: "doorman",
    propertyAccessInstructions:
      "A portaria funciona 24h no térreo do bloco B. Apresente um documento com foto e o código da reserva: o porteiro entrega as chaves e acompanha até o apartamento.",
    propertyPassword: null,
    hasParkingSpot: true,
    parkingSpotIdentifier: "Vaga 34 — subsolo",
    parkingSpotInstructions: "Acesso pela rampa à direita da portaria",
    checkInTime: "15:00",
    checkOutTime: "11:00",
    allowPet: false,
    smokingPermitted: false,
    suitableForChildren: true,
    suitableForBabies: true,
    eventsPermitted: false,
    amenities: {
      wifi: true,
      tv: true,
      air_conditioning: true,
      kitchen: true,
      elevator: true,
      pool: true,
    },
    services: {
      early_checkin: true,
      extend_stay: true,
      midstay_cleaning: true,
    },
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    ],
    hostName: "Marina Costa",
    hostPhone: "+5548991445566",
  },
];

const client = postgres(dbUrl, { max: 1, prepare: false });
const db = drizzle(client);

try {
  for (const property of seedProperties) {
    const { code, ...rest } = property;
    await db
      .insert(properties)
      .values(property)
      .onConflictDoUpdate({ target: properties.code, set: rest });
    console.log(`upsert ${code}`);
  }
  console.log("seed complete");
} finally {
  await client.end();
}
