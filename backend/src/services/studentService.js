import mongoose from 'mongoose'
import { Enrollment } from '../models/Enrollment.js'
import { Student } from '../models/Student.js'
import { createHttpError } from '../utils/http.js'
import { escapeRegex } from '../utils/validation.js'

function serializeStudent(student) {
  return {
    id: student._id,
    fullName: student.fullName,
    email: student.email,
    phone: student.phone,
    studentCode: student.studentCode,
    isActive: student.isActive,
    deactivatedAt: student.deactivatedAt,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  }
}

async function ensureStudentExists(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw createHttpError(400, 'Invalid student id.', {
      errorCode: 'INVALID_IDENTIFIER',
      suggestion: 'Use a valid student identifier and try again.',
    })
  }

  const student = await Student.findById(id)

  if (!student) {
    throw createHttpError(404, 'Student not found.', {
      errorCode: 'STUDENT_NOT_FOUND',
      suggestion: 'Refresh the list and choose an existing student.',
    })
  }

  return student
}

async function ensureStudentUniqueness(payload, currentStudentId = null) {
  const exclusionFilter = currentStudentId
    ? { _id: { $ne: currentStudentId } }
    : {}

  if (payload.email) {
    const existingEmail = await Student.findOne({
      ...exclusionFilter,
      email: payload.email,
      isActive: true,
    }).select('_id')

    if (existingEmail) {
      throw createHttpError(409, 'An active student already uses this email address.', {
        errorCode: 'DUPLICATE_STUDENT_EMAIL',
        details: [
          {
            path: 'email',
            message: 'email must be unique for active students.',
          },
        ],
        suggestion: 'Use a different email or deactivate the conflicting student first.',
      })
    }
  }

  if (payload.studentCode) {
    const existingCode = await Student.findOne({
      ...exclusionFilter,
      studentCode: payload.studentCode,
      isActive: true,
    }).select('_id')

    if (existingCode) {
      throw createHttpError(409, 'An active student already uses this student code.', {
        errorCode: 'DUPLICATE_STUDENT_CODE',
        details: [
          {
            path: 'studentCode',
            message: 'studentCode must be unique for active students.',
          },
        ],
        suggestion: 'Use a different student code or clear the conflicting record first.',
      })
    }
  }
}

export async function createStudent(payload) {
  await ensureStudentUniqueness(payload)

  const student = await Student.create({
    ...payload,
    isActive: true,
  })

  return serializeStudent(student)
}

export async function getStudents(query) {
  const filters = {}

  if (query.isActive) {
    filters.isActive = query.isActive === 'true'
  }

  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i')

    filters.$or = [
      { fullName: pattern },
      { email: pattern },
      { phone: pattern },
      { studentCode: pattern },
    ]
  }

  const totalItems = await Student.countDocuments(filters)
  const skip = (query.page - 1) * query.limit
  const sort = {
    [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1,
  }

  const students = await Student.find(filters).sort(sort).skip(skip).limit(query.limit)

  return {
    items: students.map(serializeStudent),
    pagination: {
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / query.limit) || 0,
    },
  }
}

export async function getStudentById(id) {
  const student = await ensureStudentExists(id)

  const linkedEnrollments = await Enrollment.find({
    student: student._id,
  })
    .populate('classOffering')
    .sort({ createdAt: -1 })

  return {
    ...serializeStudent(student),
    linkedEnrollments: linkedEnrollments.map((enrollment) => ({
      id: enrollment._id,
      registrationReference: enrollment.registrationReference,
      paymentReference: enrollment.paymentReference,
      linkDeliveryStatus: enrollment.linkDeliveryStatus,
      createdAt: enrollment.createdAt,
      classOffering: enrollment.classOffering
        ? {
            id: enrollment.classOffering._id,
            title: enrollment.classOffering.title,
            kuppiSession: enrollment.classOffering.kuppiSession,
            status: enrollment.classOffering.status,
          }
        : null,
    })),
  }
}

export async function updateStudent(id, payload) {
  const existingStudent = await ensureStudentExists(id)
  await ensureStudentUniqueness(payload, existingStudent._id)

  const student = await Student.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    },
  )

  return serializeStudent(student)
}

export async function deactivateStudent(id) {
  const student = await ensureStudentExists(id)
  const linkedEnrollmentCount = await Enrollment.countDocuments({
    student: student._id,
  })

  if (!student.isActive) {
    return {
      item: serializeStudent(student),
      linkedEnrollmentCount,
    }
  }

  student.isActive = false
  student.deactivatedAt = new Date()
  await student.save()

  return {
    item: serializeStudent(student),
    linkedEnrollmentCount,
  }
}
