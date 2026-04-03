const mongoose = require('mongoose');
const { env } = require('../../utils/student-management/env');
const {
  buildAllowedClassLinkMessage,
  isAllowedClassLink,
  isValidDateTimeValue,
} = require('../../utils/student-management/validation');

const classOfferingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
    },
    kuppiSession: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    classLink: {
      type: String,
      trim: true,
      default: env.DEFAULT_CLASS_LINK,
      validate: {
        validator: isAllowedClassLink,
        message: buildAllowedClassLinkMessage,
      },
    },
    startDateTime: {
      type: Date,
      default: null,
      validate: {
        validator: isValidDateTimeValue,
        message: 'startDateTime must be a valid date.',
      },
    },
    status: {
      type: String,
      enum: ['draft', 'ready', 'active', 'completed'],
      default: 'ready',
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const ClassOffering = mongoose.model('ClassOffering', classOfferingSchema);

module.exports = ClassOffering;
