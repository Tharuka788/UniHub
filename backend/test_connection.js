// Test connection directly - run: node test_connection.js
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
require('dotenv').config();

console.log('MONGO_URI:', process.env.MONGO_URI?.substring(0, 60) + '...');
console.log('DNS Servers:', dns.getServers());

async function test() {
  try {
    console.log('Testing DNS resolution...');
    dns.resolve('cluster0.6wtzz.mongodb.net', (err, addrs) => {
      if (err) console.log('DNS resolve failed:', err.message);
      else console.log('DNS resolved OK:', addrs);
    });

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ SUCCESS! Connected!');
    process.exit(0);
  } catch (err) {
    console.log('❌ FAILED:', err.message);
    process.exit(1);
  }
}

test();
