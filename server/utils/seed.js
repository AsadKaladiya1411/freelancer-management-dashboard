/**
 * Database Migration & Seed Script
 *
 * This script handles:
 * 1. Migrating old data from the legacy schema (user_id → user, client_id → client, etc.)
 * 2. Hashing any plain-text passwords from the old database
 * 3. Seeding demo data for new Atlas deployments
 *
 * Usage:
 *   cd server
 *   node utils/seed.js --migrate    # Migrate old data
 *   node utils/seed.js --seed       # Seed demo data
 *   node utils/seed.js --hash       # Hash all plain-text passwords
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set. Check your .env file.');
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB');

    const args = process.argv.slice(2);

    if (args.includes('--migrate')) {
      await migrateOldData();
    } else if (args.includes('--seed')) {
      await seedDemoData();
    } else if (args.includes('--hash')) {
      await hashPlainPasswords();
    } else {
      console.log('Usage:');
      console.log('  node utils/seed.js --migrate  # Migrate old schema fields');
      console.log('  node utils/seed.js --seed     # Seed demo data');
      console.log('  node utils/seed.js --hash     # Hash plain-text passwords');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
};

/**
 * Migrate old data: rename user_id → user, client_id → client, etc.
 */
async function migrateOldData() {
  console.log('\n🔄 Starting data migration...\n');
  const db = mongoose.connection.db;

  // Migrate clients: user_id → user
  const clientResult = await db.collection('clients').updateMany(
    { user_id: { $exists: true } },
    [{ $set: { user: '$user_id' } }, { $unset: 'user_id' }]
  );
  console.log(`   Clients: ${clientResult.modifiedCount} documents migrated (user_id → user)`);

  // Migrate projects: user_id → user, client_id → client
  const projectResult = await db.collection('projects').updateMany(
    { user_id: { $exists: true } },
    [{ $set: { user: '$user_id', client: '$client_id' } }, { $unset: ['user_id', 'client_id'] }]
  );
  console.log(`   Projects: ${projectResult.modifiedCount} documents migrated (user_id → user, client_id → client)`);

  // Migrate payments: user_id → user, project_id → project
  const paymentResult = await db.collection('payments').updateMany(
    { user_id: { $exists: true } },
    [{ $set: { user: '$user_id', project: '$project_id' } }, { $unset: ['user_id', 'project_id'] }]
  );
  console.log(`   Payments: ${paymentResult.modifiedCount} documents migrated (user_id → user, project_id → project)`);

  // Add missing fields with defaults
  await db.collection('clients').updateMany(
    { status: { $exists: false } },
    { $set: { status: 'active' } }
  );

  await db.collection('projects').updateMany(
    { priority: { $exists: false } },
    { $set: { priority: 'medium', amountPaid: 0 } }
  );

  // Normalize status values: "Pending" → "pending", "In Progress" → "in_progress"
  const statusMap = {
    'Pending': 'pending',
    'In Progress': 'in_progress',
    'On Hold': 'on_hold',
    'Completed': 'completed',
    'Cancelled': 'cancelled',
  };

  for (const [old, newStatus] of Object.entries(statusMap)) {
    await db.collection('projects').updateMany(
      { status: old },
      { $set: { status: newStatus } }
    );
  }

  // Add client reference to payments (look up from project)
  const payments = await db.collection('payments').find({ client: { $exists: false } }).toArray();
  for (const payment of payments) {
    if (payment.project) {
      const project = await db.collection('projects').findOne({ _id: payment.project });
      if (project?.client) {
        await db.collection('payments').updateOne(
          { _id: payment._id },
          { $set: { client: project.client } }
        );
      }
    }
  }
  console.log(`   Payments: client references added from projects`);

  // Add payment_date → paymentDate migration
  await db.collection('payments').updateMany(
    { payment_date: { $exists: true } },
    [{ $set: { paymentDate: '$payment_date' } }, { $unset: 'payment_date' }]
  );
  console.log(`   Payments: payment_date → paymentDate migrated`);

  console.log('\n✅ Migration complete!');
}

/**
 * Hash any plain-text passwords (passwords not starting with $2)
 */
async function hashPlainPasswords() {
  console.log('\n🔐 Hashing plain-text passwords...\n');
  const db = mongoose.connection.db;

  const users = await db.collection('users').find({}).toArray();
  let hashed = 0;

  for (const user of users) {
    // bcrypt hashes always start with $2a$ or $2b$
    if (user.password && !user.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
      console.log(`   ✅ Hashed password for: ${user.email}`);
      hashed++;
    }
  }

  if (hashed === 0) {
    console.log('   All passwords are already hashed.');
  } else {
    console.log(`\n✅ ${hashed} password(s) hashed successfully`);
  }
}

/**
 * Seed demo data for fresh Atlas deployments
 */
async function seedDemoData() {
  console.log('\n🌱 Seeding demo data...\n');
  const User = require('../models/User');
  const Client = require('../models/Client');
  const Project = require('../models/Project');
  const Payment = require('../models/Payment');

  // Check if data already exists
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) {
    console.log('   ⚠️  Database already has data. Skipping seed.');
    console.log('   To seed fresh, drop the database first.');
    return;
  }

  // Create demo user
  const user = await User.create({
    name: 'Demo User',
    email: 'demo@freelanceflow.com',
    password: 'demo123456',
    role: 'freelancer',
    preferences: { currency: 'INR', theme: 'light' },
  });
  console.log(`   ✅ Created demo user: ${user.email} (password: demo123456)`);

  // Create demo clients
  const clients = await Client.insertMany([
    { user: user._id, name: 'Acme Corp', email: 'contact@acme.com', company: 'Acme Corporation', status: 'active', phone: '9876543210' },
    { user: user._id, name: 'TechStart Inc', email: 'hello@techstart.io', company: 'TechStart Inc', status: 'active', phone: '8765432109' },
    { user: user._id, name: 'Design Studio', email: 'info@designstudio.com', company: 'Design Studio Pvt Ltd', status: 'lead' },
  ]);
  console.log(`   ✅ Created ${clients.length} demo clients`);

  // Create demo projects
  const projects = await Project.insertMany([
    { user: user._id, client: clients[0]._id, title: 'E-commerce Website', budget: 50000, status: 'in_progress', priority: 'high', deadline: new Date('2026-06-15') },
    { user: user._id, client: clients[0]._id, title: 'Mobile App MVP', budget: 80000, status: 'pending', priority: 'urgent', deadline: new Date('2026-07-01') },
    { user: user._id, client: clients[1]._id, title: 'Dashboard Redesign', budget: 25000, status: 'completed', priority: 'medium', amountPaid: 25000 },
    { user: user._id, client: clients[2]._id, title: 'Brand Identity Package', budget: 15000, status: 'pending', priority: 'low', deadline: new Date('2026-08-01') },
  ]);
  console.log(`   ✅ Created ${projects.length} demo projects`);

  // Create demo payments
  const payments = await Payment.insertMany([
    { user: user._id, project: projects[0]._id, client: clients[0]._id, amount: 20000, paymentDate: new Date('2026-04-15'), paymentMethod: 'bank_transfer', status: 'completed' },
    { user: user._id, project: projects[0]._id, client: clients[0]._id, amount: 10000, paymentDate: new Date('2026-05-01'), paymentMethod: 'upi', status: 'completed' },
    { user: user._id, project: projects[2]._id, client: clients[1]._id, amount: 25000, paymentDate: new Date('2026-03-20'), paymentMethod: 'bank_transfer', status: 'completed' },
    { user: user._id, project: projects[0]._id, client: clients[0]._id, amount: 5000, paymentDate: new Date('2026-05-07'), paymentMethod: 'cash', status: 'pending' },
  ]);
  console.log(`   ✅ Created ${payments.length} demo payments`);

  console.log('\n✅ Demo data seeded successfully!');
  console.log('   Login: demo@freelanceflow.com / demo123456');
}

run();
