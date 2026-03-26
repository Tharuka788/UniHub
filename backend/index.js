require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Route imports
const itemRoutes = require('./routes/lost-and-found/itemRoutes');
const paymentRoutes = require('./routes/payment/paymentRoutes');
const adminRoutes = require('./routes/admin/adminRoutes');

// Initialize the Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the uploads folder statically (legacy support)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/items', itemRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Connect to Database
connectDB().then(() => {
  // Start the server after DB connection
  const PORT = process.env.PORT || 5050; // default to 5050 as per previous runs
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to connect to DB', err);
});
