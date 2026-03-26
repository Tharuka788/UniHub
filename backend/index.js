require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const itemRoutes = require('./routes/lost-and-found/itemRoutes');
const paymentRoutes = require('./routes/payment/paymentRoutes');

// Initialize the Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/items', itemRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/support/tickets', require('./routes/support/ticketRoutes'));
app.use('/api/support/admin', require('./routes/support/adminRoutes'));

// Connect to Database
connectDB().then(() => {
  // Start the server after DB connection
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to string to DB', err);
});
