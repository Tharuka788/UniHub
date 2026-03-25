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
    throw createHttpError(400, 'Invalid student id.')
  }

  const student = await Student.findById(id)

  if (!student) {
    throw createHttpError(404, 'Student not found.')
  }

  return student
}

export async function createStudent(payload) {
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
  await ensureStudentExists(id)

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
