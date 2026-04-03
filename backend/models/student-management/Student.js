const mongoose = require('mongoose');
const {
  isValidEmail,
  isNonNumericName,
  sriLankanPhonePattern,
} = require('../../utils/student-management/validation');

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      validate: {
        validator: isNonNumericName,
        message: 'Full name cannot be purely numeric.',
      },
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: isValidEmail,
        message: 'Email must be a valid email address.',
      },
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator(value) {
          if (!value) {
            return true;
          }

          return sriLankanPhonePattern.test(value);
        },
        message: 'Phone must be a valid Sri Lankan local or international number.',
      },
    },
    studentCode: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

studentSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isActive: true,
    },
  },
);

studentSchema.index(
  { studentCode: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isActive: true,
      studentCode: {
        $exists: true,
        $ne: '',
      },
    },
  },
);

// Standard name for compatibility with original aggregates
const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
