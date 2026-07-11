import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting realistic database seed...");

  // 1. CLEAR EXISTING DATA (Reverse dependency order)
  console.log("🧹 Clearing old data...");
  await prisma.loyaltyTransaction.deleteMany({});
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.advanceOrderItem.deleteMany({});
  await prisma.advanceOrder.deleteMany({});
  await prisma.customerNote.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.productPriceHistory.deleteMany({});
  await prisma.stockHistory.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.offer.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.setting.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. SETTINGS
  console.log("⚙️  Creating settings...");
  const setting = await prisma.setting.create({
    data: {
      id: "1",
      shopName: "Premium Sweets & Co.",
      address: "123 Sweet Market, Delhi",
      gstNumber: "22AAAAA0000A1Z5",
      phone: "+91 98765 43210",
      invoicePrefix: "INV-",
      goldSpending: 20000,
      goldVisits: 10,
      platinumSpending: 50000,
      platinumVisits: 20,
      diamondSpending: 100000,
      diamondVisits: 40,
      pointsPerRupee: 1,
      pointsRedemption: 0.1,
    }
  });

  // 3. ADMIN USER
  console.log("👤 Creating demo account (demo@sweetbook.com / demo123)...");
  const hashedPassword = await bcrypt.hash("demo123", 10);
  await prisma.user.create({
    data: {
      name: "Shop Owner",
      email: "demo@sweetbook.com",
      password: hashedPassword,
      role: "OWNER"
    }
  });

  // 4. PRODUCTS (Premium Sweet Shop Items)
  console.log("🍬 Creating products...");
  const productData = [
    { name: "Kaju Katli", category: "SWEETS", unit: "KG", price: 1200, gst: 5, stock: 50 },
    { name: "Rasgulla", category: "SWEETS", unit: "PIECE", price: 30, gst: 5, stock: 200 },
    { name: "Gulab Jamun", category: "SWEETS", unit: "PIECE", price: 35, gst: 5, stock: 150 },
    { name: "Milk Cake", category: "SWEETS", unit: "KG", price: 800, gst: 5, stock: 30 },
    { name: "Motichoor Laddu", category: "SWEETS", unit: "KG", price: 600, gst: 5, stock: 100 },
    { name: "Soan Papdi", category: "SWEETS", unit: "KG", price: 400, gst: 5, stock: 80 },
    { name: "Dry Fruit Laddu", category: "SWEETS", unit: "KG", price: 1400, gst: 5, stock: 20 },
    { name: "Rasmalai", category: "SWEETS", unit: "PIECE", price: 45, gst: 5, stock: 120 },
    { name: "Peda", category: "SWEETS", unit: "KG", price: 700, gst: 5, stock: 60 },
    { name: "Barfi", category: "SWEETS", unit: "KG", price: 650, gst: 5, stock: 75 },
    { name: "Aloo Bhujia", category: "NAMKEEN", unit: "KG", price: 300, gst: 12, stock: 150 },
    { name: "Mix Mixture", category: "NAMKEEN", unit: "KG", price: 350, gst: 12, stock: 100 },
    { name: "Moong Dal", category: "NAMKEEN", unit: "KG", price: 320, gst: 12, stock: 120 },
    { name: "Paneer Patties", category: "BAKERY", unit: "PIECE", price: 40, gst: 18, stock: 50 },
    { name: "Samosa", category: "BAKERY", unit: "PIECE", price: 20, gst: 18, stock: 300 },
    { name: "Kachori", category: "BAKERY", unit: "PIECE", price: 25, gst: 18, stock: 200 },
    { name: "Chocolate Cake", category: "BAKERY", unit: "KG", price: 900, gst: 18, stock: 10 },
    { name: "Lassi", category: "BEVERAGES", unit: "PIECE", price: 60, gst: 18, stock: 100 },
    { name: "Cold Coffee", category: "BEVERAGES", unit: "PIECE", price: 120, gst: 18, stock: 50 },
  ];

  const dbProducts: any[] = [];
  for (const p of productData) {
    const prod = await prisma.product.create({ data: p });
    dbProducts.push(prod);
  }

  // 5. CUSTOMERS (Realistic Indian Names, 100+)
  console.log("👥 Creating 100+ customers...");
  const firstNames = ["Aarav", "Priya", "Rohan", "Sneha", "Vikram", "Ananya", "Rahul", "Neha", "Amit", "Pooja", "Karan", "Meera", "Siddharth", "Kavya", "Aditya", "Riya", "Arjun", "Nisha", "Kabir", "Aisha", "Dhruv", "Ishita", "Yash", "Kriti", "Ravi"];
  const lastNames = ["Sharma", "Patel", "Singh", "Gupta", "Verma", "Iyer", "Desai", "Reddy", "Kumar", "Joshi", "Malhotra", "Nair", "Das", "Menon", "Bose", "Kapoor", "Mehta", "Jain", "Bhatia", "Khan"];
  
  const customerNames = [];
  for (let i = 0; i < 110; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    customerNames.push(`${fName} ${lName}`);
  }
  
  const dbCustomers: any[] = [];
  for (let i = 0; i < customerNames.length; i++) {
    const cust = await prisma.customer.create({
      data: {
        name: customerNames[i],
        phone: `98${String(i).padStart(8, '0')}`,
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // Created 6 months ago
      }
    });
    dbCustomers.push(cust);
  }

  // 6. INVOICES & SIMULATED BUSINESS DATA (6 months history)
  console.log("📊 Simulating 6 months of business history...");
  
  let invoiceCounter = 1;
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  
  // Total ~550 invoices over 180 days
  for (let i = 0; i < 550; i++) {
    // Generate random date between 6 months ago and now, heavily weighted towards weekends
    const randomDaysOff = Math.floor(Math.random() * 180);
    const invoiceDate = new Date(sixMonthsAgo.getTime() + randomDaysOff * 24 * 60 * 60 * 1000);
    // Random hour between 10 AM and 9 PM (Peak evening hours)
    let hour = 10 + Math.floor(Math.random() * 11);
    if (Math.random() > 0.6) hour = 17 + Math.floor(Math.random() * 4); // Peak evening 5 PM - 9 PM
    invoiceDate.setHours(hour, Math.floor(Math.random() * 60));

    // Select 1 to 4 random products
    const numItems = 1 + Math.floor(Math.random() * 4);
    const selectedProducts: any[] = [];
    for (let j = 0; j < numItems; j++) {
      const prod = dbProducts[Math.floor(Math.random() * dbProducts.length)];
      if (!selectedProducts.find(p => p.id === prod.id)) {
        selectedProducts.push(prod);
      }
    }

    let subtotal = 0;
    let totalGst = 0;
    const items = [];

    for (const prod of selectedProducts) {
      const quantity = prod.unit === "KG" ? (0.25 + (Math.floor(Math.random() * 4) * 0.25)) : (1 + Math.floor(Math.random() * 5));
      const itemSub = quantity * prod.price;
      const itemGst = itemSub * (prod.gst / 100);
      subtotal += itemSub;
      totalGst += itemGst;
      
      items.push({
        productId: prod.id,
        quantity,
        price: prod.price,
        gst: itemGst,
        discount: 0,
        total: itemSub + itemGst
      });
    }

    const grandTotal = subtotal + totalGst;
    
    // Assign to a customer (70% chance of returning customer, 30% guest)
    let customerId = null;
    let customer = null;
    if (Math.random() > 0.3) {
      customer = dbCustomers[Math.floor(Math.random() * dbCustomers.length)];
      customerId = customer.id;
      
      // Update customer stats
      customer.totalSpending += grandTotal;
      customer.totalVisits += 1;
      customer.averageBill = customer.totalSpending / customer.totalVisits;
      
      // Calculate VIP level
      if (customer.totalSpending >= setting.diamondSpending || customer.totalVisits >= setting.diamondVisits) {
        customer.vipLevel = "DIAMOND";
      } else if (customer.totalSpending >= setting.platinumSpending || customer.totalVisits >= setting.platinumVisits) {
        customer.vipLevel = "PLATINUM";
      } else if (customer.totalSpending >= setting.goldSpending || customer.totalVisits >= setting.goldVisits) {
        customer.vipLevel = "GOLD";
      }
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `${setting.invoicePrefix}${invoiceCounter.toString().padStart(5, '0')}`,
        customerId,
        billingType: "DINE_IN",
        subtotal,
        discount: 0,
        gst: totalGst,
        additionalCharges: 0,
        grandTotal,
        paymentMethod: Math.random() > 0.4 ? "UPI" : "CASH",
        status: "COMPLETED",
        createdAt: invoiceDate,
        items: {
          create: items
        }
      }
    });

    if (customer) {
      // Award loyalty points
      const points = Math.floor(grandTotal * setting.pointsPerRupee);
      customer.loyaltyPoints += points;
      await prisma.loyaltyTransaction.create({
        data: {
          customerId: customer.id,
          invoiceId: invoice.id,
          pointsEarned: points,
          pointsRedeemed: 0,
          createdAt: invoiceDate
        }
      });
    }

    invoiceCounter++;
  }

  // Save updated customer stats
  for (const c of dbCustomers) {
    await prisma.customer.update({
      where: { id: c.id },
      data: {
        totalSpending: c.totalSpending,
        totalVisits: c.totalVisits,
        averageBill: c.averageBill,
        vipLevel: c.vipLevel,
        loyaltyPoints: c.loyaltyPoints
      }
    });
  }

  console.log("✅ Database seeding complete!");
  console.log(`Created ${productData.length} products`);
  console.log(`Created ${customerNames.length} customers`);
  console.log(`Generated ${invoiceCounter - 1} invoices`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
