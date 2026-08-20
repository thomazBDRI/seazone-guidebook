/**
 * Seeds the reference properties from the challenge brief (idempotent upsert).
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
    images: [
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800",
    ],
    hostName: "Carlos Eduardo",
    hostPhone: "+5554998765432",
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
