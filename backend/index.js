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
const adminDashboardRoutes = require('./routes/admin/adminDashboardRoutes');

// Models
const Message = require('./models/chat/Message');

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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const newMessage = await Message.create({
        sender: data.sender,
        receiver: data.receiver,
        itemId: data.itemId,
        content: data.content,
      });

      io.to(data.roomId).emit('receive_message', {
        ...data,
        id: newMessage._id,
        createdAt: newMessage.createdAt,
      });
    } catch (err) {
      console.error('Error saving message:', err);
    }
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
app.use('/admin-dashboard', adminDashboardRoutes);

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