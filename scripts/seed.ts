import "dotenv/config";
import { db } from "../src/db";
import { users, products, activities } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Seeding database…");

  await db.execute(sql`TRUNCATE TABLE ${activities} RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE ${products} RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE ${users} RESTART IDENTITY CASCADE`);

  const ownerPassword = await hashPassword("owner123456");

  const [owner] = await db
    .insert(users)
    .values({
      name: "Wei Zhang",
      email: "owner@cantonsupply.com",
      passwordHash: ownerPassword,
      role: "OWNER",
    })
    .returning();

  const productData = [
    {
      name: "Nike Tech Fleece Hoodie",
      description:
        "Midweight tech fleece hoodie with a brushed interior. Popular reorder item across sizes M–XL.",
      category: "Clothing",
      sku: "NK-TFH-001",
      supplier: "Guangzhou Yida Garment Co.",
      costPrice: "25.00",
      sellingPrice: "45.00",
      stock: 24,
      unitsSold: 138,
      imageUrl:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
    },
    {
      name: "AirPods Pro Silicone Case",
      description:
        "Slim-fit protective silicone case with carabiner clip. Compatible with AirPods Pro (2nd gen).",
      category: "Accessories",
      sku: "APC-SIL-014",
      supplier: "Shenzhen Kaiyuan Electronics",
      costPrice: "1.80",
      sellingPrice: "8.99",
      stock: 6,
      unitsSold: 412,
      imageUrl:
        "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80",
    },
    {
      name: "New Balance 550 Sneakers",
      description:
        "Retro leather sneaker, white/green colorway. Runs true to size.",
      category: "Shoes",
      sku: "NB-550-WG",
      supplier: "Fujian Anta Footwear",
      costPrice: "34.00",
      sellingPrice: "68.00",
      stock: 0,
      unitsSold: 57,
      imageUrl:
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
    },
    {
      name: "Anker 20W USB-C Fast Charger",
      description:
        "Compact PD fast charger, compatible with iPhone and most USB-C devices.",
      category: "Electronics",
      sku: "ANK-PD20-A",
      supplier: "Shenzhen Anker Innovations",
      costPrice: "4.20",
      sellingPrice: "14.99",
      stock: 85,
      unitsSold: 621,
      imageUrl:
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80",
    },
    {
      name: "Stanley Quencher 40oz Tumbler",
      description:
        "Insulated stainless steel tumbler with handle and straw. Keeps drinks cold up to 11 hours.",
      category: "Home",
      sku: "STN-QT40-BLK",
      supplier: "Ningbo Homeware Trading",
      costPrice: "9.50",
      sellingPrice: "28.00",
      stock: 3,
      unitsSold: 210,
      imageUrl:
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
    },
    {
      name: "Levi's 501 Original Jeans",
      description:
        "Classic straight-leg denim, mid-rise. Stocked in indigo wash, sizes 28–38.",
      category: "Clothing",
      sku: "LV-501-IND",
      supplier: "Guangzhou Yida Garment Co.",
      costPrice: "18.00",
      sellingPrice: "42.00",
      stock: 41,
      unitsSold: 96,
      imageUrl:
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
    },
    {
      name: "JBL Clip 4 Bluetooth Speaker",
      description:
        "Portable waterproof speaker with carabiner clip, 10-hour battery life.",
      category: "Electronics",
      sku: "JBL-CLP4-BLU",
      supplier: "Shenzhen Kaiyuan Electronics",
      costPrice: "16.00",
      sellingPrice: "39.99",
      stock: 18,
      unitsSold: 74,
      imageUrl:
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
    },
    {
      name: "Ray-Ban Wayfarer Sunglasses",
      description:
        "Classic acetate frame with polarized lenses. Includes hard case and cleaning cloth.",
      category: "Accessories",
      sku: "RB-WAY-BLK",
      supplier: "Wenzhou Eyewear Trading Co.",
      costPrice: "22.00",
      sellingPrice: "55.00",
      stock: 12,
      unitsSold: 33,
      imageUrl:
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
    },
    {
      name: "Adidas Ultraboost Running Shoes",
      description:
        "Responsive Boost midsole with Primeknit upper. Available in core black.",
      category: "Shoes",
      sku: "AD-UB22-BLK",
      supplier: "Fujian Anta Footwear",
      costPrice: "45.00",
      sellingPrice: "89.00",
      stock: 4,
      unitsSold: 61,
      imageUrl:
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
    },
    {
      name: "Dyson-Style Cordless Vacuum",
      description:
        "Lightweight cordless stick vacuum with detachable handheld unit and HEPA filter.",
      category: "Home",
      sku: "VAC-CL-V2",
      supplier: "Ningbo Homeware Trading",
      costPrice: "58.00",
      sellingPrice: "129.00",
      stock: 9,
      unitsSold: 27,
      imageUrl:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    },
    {
      name: "Baseus 10000mAh Power Bank",
      description:
        "Slim power bank with dual USB-C ports and digital charge display.",
      category: "Electronics",
      sku: "BAS-PB10-D",
      supplier: "Shenzhen Anker Innovations",
      costPrice: "6.50",
      sellingPrice: "19.99",
      stock: 60,
      unitsSold: 288,
      imageUrl:
        "https://images.unsplash.com/photo-1609592806596-4d1b5f0d5a30?w=800&q=80",
    },
    {
      name: "Leather Card Holder Wallet",
      description:
        "Minimalist genuine leather card holder with RFID-blocking lining. 6-card capacity.",
      category: "Accessories",
      sku: "LTH-CH-BRN",
      supplier: "Wenzhou Eyewear Trading Co.",
      costPrice: "3.20",
      sellingPrice: "13.50",
      stock: 0,
      unitsSold: 145,
      imageUrl:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
    },
  ];

  const inserted = await db.insert(products).values(productData).returning();

  const activityLog: (typeof activities.$inferInsert)[] = [];
  for (const p of inserted) {
    activityLog.push({
      userId: owner.id,
      productId: p.id,
      productName: p.name,
      action: "PRODUCT_ADDED",
      newValue: `${p.sellingPrice}, ${p.stock} units`,
    });
  }

  // A few realistic follow-up events for the activity feed.
  const hoodie = inserted.find((p) => p.sku === "NK-TFH-001")!;
  const tumbler = inserted.find((p) => p.sku === "STN-QT40-BLK")!;
  const shoes = inserted.find((p) => p.sku === "NB-550-WG")!;

  activityLog.push(
    {
      userId: owner.id,
      productId: hoodie.id,
      productName: hoodie.name,
      action: "PRICE_CHANGED",
      previousValue: "$40.00",
      newValue: "$45.00",
    },
    {
      userId: owner.id,
      productId: tumbler.id,
      productName: tumbler.name,
      action: "INVENTORY_CHANGED",
      previousValue: "20 units",
      newValue: "3 units",
    },
    {
      userId: owner.id,
      productId: shoes.id,
      productName: shoes.name,
      action: "INVENTORY_CHANGED",
      previousValue: "12 units",
      newValue: "0 units",
    }
  );

  await db.insert(activities).values(activityLog);

  console.log(`Seeded ${inserted.length} products.`);
  console.log("Owner login:  owner@cantonsupply.com / owner123456");
  console.log("The catalog itself is public — no login needed to browse it.");

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
