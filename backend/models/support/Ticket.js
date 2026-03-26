const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email']
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);
