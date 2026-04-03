require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');

// Route imports
const itemRoutes = require('./routes/lost-and-found/itemRoutes');
const paymentRoutes = require('./routes/payment/paymentRoutes');
const kuppiRequestRoutes = require('./routes/kuppi/kuppiRequestRoutes');
const adminRoutes = require('./admin/routes/adminRoutes');
const userRoutes = require('./routes/user/userRoutes');
const ticketRoutes = require('./routes/support/ticketRoutes');
const notificationRoutes = require('./routes/chat/notificationRoutes');
const connectionRoutes = require('./routes/lost-and-found/connectionRoutes');
const studentManagementRoutes = require('./routes/student-management');

// Models
const Notification = require('./models/chat/Notification');

// Initialize the Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on('join_user_room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User joined private room: user-${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Serve the uploads folder statically (legacy support)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/items', itemRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/kuppi', kuppiRequestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/admin-support', ticketRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/students', studentManagementRoutes);

// Connect to Database
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5050;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to DB', err);
  });