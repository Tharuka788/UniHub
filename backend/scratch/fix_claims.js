const mongoose = require('mongoose');
const crypto = require('crypto');
const QRCode = require('qrcode');
require('dotenv').config();

// Custom SRV resolver for connectivity issues
const dns = require('dns');
const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
  if (hostname.includes('mongodb.net')) {
    return originalLookup('8.8.8.8', options, (err) => {
      if (err) return originalLookup(hostname, options, callback);
      return originalLookup(hostname, options, callback);
    });
  }
  return originalLookup(hostname, options, callback);
};

const Claim = require('../models/lost-and-found/Claim');

const fixClaims = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB...');

    const acceptedClaims = await Claim.find({ status: 'Accepted', verificationToken: { $exists: false } });
    console.log(`Found ${acceptedClaims.length} accepted claims without tokens.`);

    for (const claim of acceptedClaims) {
      const token = crypto.randomBytes(16).toString('hex');
      let qrDataUrl = '';
      try {
        qrDataUrl = await QRCode.toDataURL(`http://localhost:5173/verify-claim/${token}`);
      } catch (err) {
        qrDataUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=http://localhost:5173/verify-claim/${token}`;
      }
      
      claim.verificationToken = token;
      claim.qrCode = qrDataUrl;
      await claim.save();
      console.log(`Fixed claim ${claim._id}`);
    }

    console.log('Done!');
    process.exit();
  } catch (error) {
    console.error('Error fixing claims:', error);
    process.exit(1);
  }
};

fixClaims();
