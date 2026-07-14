import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.invoice.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.stockLog.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.seller.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("admin123", 10);
  const staffPassword = await bcrypt.hash("staff123", 10);

  await prisma.user.createMany({
    data: [
      { name: "Admin Hoodwood", email: "admin@hoodwood.com", password: adminPassword, role: "ADMIN" },
      { name: "Staff Hoodwood", email: "staff@hoodwood.com", password: staffPassword, role: "STAFF" },
    ],
  });

  const categories = await Promise.all(
    ["Furniture", "Home Decor", "Lighting", "Kitchenware"].map((name) =>
      prisma.category.create({ data: { name } })
    )
  );

  const suppliers = await Promise.all([
    prisma.supplier.create({ data: { name: "PT Kayu Abadi", phone: "081234567890", email: "sales@kayuabadi.id", address: "Bandung", notes: "Supplier utama kayu solid" } }),
    prisma.supplier.create({ data: { name: "CV Lampu Nusantara", phone: "081234567891", email: "hello@lampunusantara.id", address: "Semarang", notes: "Spesialis lampu dekorasi" } }),
    prisma.supplier.create({ data: { name: "UD Dapur Maju", phone: "081234567892", email: "order@dapurmaju.id", address: "Surabaya", notes: "Aksesoris dapur dan rumah" } }),
  ]);

  const sellers = await Promise.all([
    prisma.seller.create({ data: { name: "Hoodwood Official Shopee", marketplace: "Shopee", phone: "081111111111", email: "shopee@hoodwood.com", address: "Jakarta", notes: "Akun penjualan utama" } }),
    prisma.seller.create({ data: { name: "Hoodwood Tokopedia", marketplace: "Tokopedia", phone: "082222222222", email: "tokopedia@hoodwood.com", address: "Jakarta", notes: "Akun flash sale" } }),
    prisma.seller.create({ data: { name: "Reseller Bumi Home", marketplace: "Offline", phone: "083333333333", email: "bumi@home.id", address: "Bekasi", notes: "Pelanggan grosir" } }),
  ]);

  const products = await Promise.all([
    prisma.product.create({ data: { code: "HW-CHAIR-001", name: "Kursi Kayu Scandinavian", categoryId: categories[0].id, supplierId: suppliers[0].id, buyPrice: 250000, sellPrice: 425000, stock: 36, unit: "pcs", lowStockAt: 8 } }),
    prisma.product.create({ data: { code: "HW-TABLE-002", name: "Meja Kopi Minimalis", categoryId: categories[0].id, supplierId: suppliers[0].id, buyPrice: 400000, sellPrice: 650000, stock: 18, unit: "pcs", lowStockAt: 5 } }),
    prisma.product.create({ data: { code: "HW-LAMP-003", name: "Lampu Gantung Rotan", categoryId: categories[2].id, supplierId: suppliers[1].id, buyPrice: 150000, sellPrice: 275000, stock: 25, unit: "pcs", lowStockAt: 7 } }),
    prisma.product.create({ data: { code: "HW-TRAY-004", name: "Nampan Dapur Bambu", categoryId: categories[3].id, supplierId: suppliers[2].id, buyPrice: 45000, sellPrice: 85000, stock: 60, unit: "pcs", lowStockAt: 15 } }),
    prisma.product.create({ data: { code: "HW-VASE-005", name: "Vas Keramik Putih", categoryId: categories[1].id, supplierId: suppliers[2].id, buyPrice: 55000, sellPrice: 110000, stock: 12, unit: "pcs", lowStockAt: 6 } }),
    prisma.product.create({ data: { code: "HW-SHELF-006", name: "Rak Dinding Oak", categoryId: categories[0].id, supplierId: suppliers[0].id, buyPrice: 175000, sellPrice: 310000, stock: 9, unit: "pcs", lowStockAt: 4 } }),
  ]);

  await prisma.stockLog.createMany({
    data: products.map((product) => ({
      productId: product.id,
      type: "IN",
      qty: product.stock,
      notes: "Initial seeded stock",
      refType: "PRODUCT",
      refId: product.id,
    })),
  });

  const orderOne = await prisma.order.create({
    data: {
      orderNumber: "ORD-20260707-A1B2C",
      sellerId: sellers[0].id,
      status: "PROCESSING",
      expedition: "SPX",
      trackingNumber: "SPX12345678",
      notes: "Prioritas same day pickup",
      items: {
        create: [
          { productId: products[0].id, qty: 2, price: products[0].sellPrice },
          { productId: products[2].id, qty: 1, price: products[2].sellPrice },
        ],
      },
    },
    include: { items: true },
  });

  const orderTwo = await prisma.order.create({
    data: {
      orderNumber: "ORD-20260707-D4E5F",
      sellerId: sellers[1].id,
      status: "SHIPPED",
      expedition: "JNE",
      trackingNumber: "JNE99887766",
      notes: "Bundling promo marketplace",
      items: {
        create: [
          { productId: products[1].id, qty: 1, price: products[1].sellPrice },
          { productId: products[3].id, qty: 3, price: products[3].sellPrice },
        ],
      },
    },
    include: { items: true },
  });

  const orderThree = await prisma.order.create({
    data: {
      orderNumber: "ORD-20260707-G7H8I",
      sellerId: sellers[2].id,
      status: "DONE",
      expedition: "SiCepat",
      trackingNumber: "SICEPAT445566",
      notes: "Reseller order bulanan",
      items: {
        create: [
          { productId: products[5].id, qty: 2, price: products[5].sellPrice },
          { productId: products[4].id, qty: 4, price: products[4].sellPrice },
        ],
      },
    },
    include: { items: true },
  });

  const orderAdjustments = [
    { order: orderOne, items: [{ productId: products[0].id, qty: 2 }, { productId: products[2].id, qty: 1 }] },
    { order: orderTwo, items: [{ productId: products[1].id, qty: 1 }, { productId: products[3].id, qty: 3 }] },
    { order: orderThree, items: [{ productId: products[5].id, qty: 2 }, { productId: products[4].id, qty: 4 }] },
  ];

  for (const entry of orderAdjustments) {
    for (const item of entry.items) {
      await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.qty } } });
      await prisma.stockLog.create({
        data: {
          productId: item.productId,
          type: "OUT",
          qty: item.qty,
          notes: `Order ${entry.order.orderNumber}`,
          refType: "ORDER",
          refId: entry.order.id,
        },
      });
    }
  }

  await prisma.invoice.createMany({
    data: [
      {
        invoiceNumber: "INV-20260707-SELLR-00001",
        type: "FOR_SELLER",
        sellerId: sellers[0].id,
        orderId: orderOne.id,
        status: "UNPAID",
        totalAmount: orderOne.items.reduce((sum, item) => sum + item.qty * item.price, 0),
        notes: "Tagihan seller mingguan",
      },
      {
        invoiceNumber: "INV-20260707-ORDLT-00002",
        type: "ORDER_LETTER",
        sellerId: sellers[1].id,
        orderId: orderTwo.id,
        status: "PAID",
        totalAmount: orderTwo.items.reduce((sum, item) => sum + item.qty * item.price, 0),
        notes: "Surat jalan marketplace",
        printedAt: new Date(),
      },
      {
        invoiceNumber: "INV-20260707-SUPLR-00003",
        type: "FOR_SUPPLIER",
        status: "UNPAID",
        totalAmount: 1850000,
        notes: "Supplier: PT Kayu Abadi\nPO restock minggu ini",
      },
    ],
  });

  console.log("Seed completed successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
