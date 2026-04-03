const mongoose = require('mongoose');

const dispatchLogSchema = new mongoose.Schema(
  {
    classOffering: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassOffering',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student_SM',
      required: true,
    },
    channel: {
      type: String,
      enum: ['email'],
      default: 'email',
      required: true,
    },
    recipient: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['sent', 'failed'],
      required: true,
    },
    providerMessageId: {
      type: String,
      trim: true,
      default: '',
    },
    errorMessage: {
      type: String,
      trim: true,
      default: '',
    },
    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

dispatchLogSchema.index({ classOffering: 1, student: 1, createdAt: -1 });
dispatchLogSchema.index({ recipient: 1 });

const DispatchLog = mongoose.model('DispatchLog', dispatchLogSchema);

module.exports = DispatchLog;
