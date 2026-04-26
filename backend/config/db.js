const mongoose = require('mongoose');
const dns = require('dns');

// Use Google DNS to bypass local DNS issues
const resolver = new dns.Resolver();
resolver.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

// Resolve SRV record via Google DNS
const resolveSrv = (hostname) => new Promise((resolve, reject) => {
  resolver.resolveSrv(hostname, (err, records) => {
    if (err) reject(err);
    else resolve(records);
  });
});

// Custom lookup: uses Google DNS for A records (keeps hostnames for SSL SNI)
const customLookup = (hostname, options, callback) => {
  resolver.resolve4(hostname, (err, addresses) => {
    if (err || !addresses?.length) {
      // Fallback to system DNS
      return dns.lookup(hostname, options, callback);
    }
    callback(null, addresses[0], 4);
  });
};

const connectDB = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");

    let uri = process.env.MONGO_URI;

    // If SRV string, manually resolve to get real hostnames (for connection string)
    if (uri.startsWith('mongodb+srv://')) {
      try {
        const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)(.*)/);
        if (match) {
          const [, user, pass, host, db] = match;
          console.log(`🔍 Resolving SRV for ${host} via Google DNS...`);

          const srvRecords = await resolveSrv(`_mongodb._tcp.${host}`);
          // Use HOSTNAMES (not IPs) so SSL/SNI works correctly
          const hosts = srvRecords.map(r => `${r.name}:${r.port}`).join(',');

          uri = `mongodb://${user}:${pass}@${hosts}/${db}?ssl=true&authSource=admin&replicaSet=atlas-umlymi-shard-0`;
          console.log(`✅ SRV resolved to ${srvRecords.length} server(s)`);
        }
      } catch (srvErr) {
        console.warn('⚠️  SRV resolve failed, using original URI:', srvErr.message);
      }
    }

    await mongoose.connect(uri, {
      family: 4,
      serverSelectionTimeoutMS: 20000,
      // Custom lookup uses Google DNS but keeps hostnames intact for SSL
      lookup: customLookup,
    });

    console.log("✅ Connected to MongoDB successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
