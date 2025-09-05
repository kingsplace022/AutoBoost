require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Service = require('./models/Service');

// Connect to database
connectDB(process.env.MONGODB_URI);

const seed = async () => {
  try {
    // Delete old data
    await User.deleteMany();
    await Service.deleteMany();

    // Create admin user
    await User.create({
      name: "Admin",
      email: process.env.SEED_ADMIN_EMAIL,
      password: process.env.SEED_ADMIN_PASSWORD,
      role: "admin",
      balance: 0
    });

    // Insert sample services
    await Service.insertMany([
      {
        name: "Airtime Recharge",
        category: "Airtime",
        price: 100,
        description: "Instant airtime topup"
      },
      {
        name: "Data Bundle",
        category: "Data",
        price: 500,
        description: "Affordable internet bundles"
      },
      {
        name: "Electricity Bill",
        category: "Utility",
        price: 2000,
        description: "Pay your electricity bills instantly"
      }
    ]);

    console.log("✅ Database seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
};

seed();