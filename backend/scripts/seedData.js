import mongoose from 'mongoose'
import { connectDb } from '../src/db/connectDb.js'
import { ClassOffering } from '../src/models/ClassOffering.js'
import { DispatchLog } from '../src/models/DispatchLog.js'
import { Enrollment } from '../src/models/Enrollment.js'
import { Student } from '../src/models/Student.js'

const baseOfferings = [
  {
    title: '2026 A/L Physics Support',
    kuppiSession: '2026 A/L Physics Support - Batch 01',
    classLink: 'https://meet.google.com/phy-batch-01',
    status: 'active',
    startDateTime: '2026-03-28T09:00:00.000Z',
  },
  {
    title: '2026 A/L Chemistry Clinic',
    kuppiSession: '2026 A/L Chemistry Clinic - Batch 02',
    classLink: 'https://meet.google.com/chem-batch-02',
    status: 'ready',
    startDateTime: '2026-03-29T11:00:00.000Z',
  },
  {
    title: '2026 A/L Biology Revision Lab',
    kuppiSession: '2026 A/L Biology Revision Lab - Batch 01',
    classLink: '',
    status: 'draft',
  },
  {
    title: '2026 Combined Maths Intensive',
    kuppiSession: '2026 Combined Maths Intensive - Batch 03',
    classLink: 'https://meet.google.com/maths-intensive-03',
    status: 'draft',
    startDateTime: '2026-04-03T10:30:00.000Z',
  },
  {
    title: '2026 ICT Masterclass',
    kuppiSession: '2026 ICT Masterclass - Batch 01',
    classLink: 'https://meet.google.com/ict-batch-01',
    status: 'active',
    startDateTime: '2026-03-26T15:00:00.000Z',
    isArchived: true,
    archivedAt: '2026-03-24T08:00:00.000Z',
  },
]

const baseEnrollments = [
  {
    fullName: 'Nimal Perera',
    email: 'nimal.perera@example.com',
    phone: '0771234567',
    studentCode: 'STU-1001',
    kuppiSession: '2026 A/L Physics Support - Batch 01',
    registrationReference: 'REG-1001',
    paymentReference: 'PAY-9001',
    linkDeliveryStatus: 'pending',
    createdAt: '2026-03-20T08:30:00.000Z',
  },
  {
    fullName: 'Tharushi De Silva',
    email: 'tharushi.desilva@example.com',
    phone: '0712345678',
    studentCode: 'STU-1002',
    kuppiSession: '2026 A/L Physics Support - Batch 01',
    registrationReference: 'REG-1002',
    paymentReference: 'PAY-9002',
    linkDeliveryStatus: 'sent',
    createdAt: '2026-03-21T09:00:00.000Z',
    linkSentAt: '2026-03-22T08:30:00.000Z',
    extraDispatches: [
      {
        status: 'failed',
        createdAt: '2026-03-21T12:15:00.000Z',
        errorMessage: 'Mailbox unavailable during seed simulation.',
      },
    ],
  },
  {
    fullName: 'Isuru Madushan',
    email: 'isuru.madushan@example.com',
    phone: '0759988776',
    studentCode: 'STU-1003',
    kuppiSession: '2026 A/L Chemistry Clinic - Batch 02',
    registrationReference: 'REG-1003',
    paymentReference: 'PAY-9003',
    linkDeliveryStatus: 'failed',
    createdAt: '2026-03-18T07:45:00.000Z',
    extraDispatches: [
      {
        status: 'failed',
        createdAt: '2026-03-19T10:00:00.000Z',
        errorMessage: 'Mailbox unavailable during seed simulation.',
      },
    ],
  },
  {
    fullName: 'Piumi Fernando',
    email: 'piumi.fernando@example.com',
    phone: '0762233445',
    studentCode: 'STU-1004',
    kuppiSession: '2026 A/L Chemistry Clinic - Batch 02',
    registrationReference: 'REG-1004',
    paymentReference: 'PAY-9004',
    linkDeliveryStatus: 'pending',
    createdAt: '2026-03-24T09:30:00.000Z',
  },
  {
    fullName: 'Kavindu Senanayake',
    email: 'kavindu.senanayake@example.com',
    phone: '0705566778',
    studentCode: 'STU-1005',
    kuppiSession: '2026 A/L Physics Support - Batch 01',
    registrationReference: 'REG-1005',
    paymentReference: 'PAY-9005',
    linkDeliveryStatus: 'sent',
    createdAt: '2026-03-23T11:00:00.000Z',
    linkSentAt: '2026-03-23T14:15:00.000Z',
  },
  {
    fullName: 'Harini Wickramasinghe',
    email: 'harini.wickramasinghe@example.com',
    phone: '0774455667',
    studentCode: 'STU-1006',
    kuppiSession: '2026 A/L Chemistry Clinic - Batch 02',
    registrationReference: 'REG-1006',
    paymentReference: 'PAY-9006',
    linkDeliveryStatus: 'sent',
    isActive: false,
    deactivatedAt: '2026-03-25T08:00:00.000Z',
    createdAt: '2026-03-17T08:00:00.000Z',
    linkSentAt: '2026-03-18T09:10:00.000Z',
  },
  {
    fullName: 'Sadeeqa Nafeel',
    email: 'sadeeqa.nafeel@example.com',
    phone: '0712233445',
    studentCode: 'STU-1007',
    kuppiSession: '2026 ICT Masterclass - Batch 01',
    registrationReference: 'REG-1007',
    paymentReference: 'PAY-9007',
    linkDeliveryStatus: 'sent',
    createdAt: '2026-03-16T10:45:00.000Z',
    linkSentAt: '2026-03-17T13:00:00.000Z',
  },
]

const standaloneOfferings = [
  ...baseOfferings,
  {
    title: '2026 Combined Maths Sprint',
    kuppiSession: '2026 Combined Maths Sprint - Batch 01',
    classLink: 'https://meet.google.com/maths-batch-01',
    status: 'active',
    startDateTime: '2026-03-30T13:30:00.000Z',
  },
]

const standaloneEnrollments = [
  ...baseEnrollments,
  {
    fullName: 'Sachini Rathnayake',
    email: 'sachini.rathnayake@example.com',
    phone: '0723355779',
    studentCode: 'STU-1008',
    kuppiSession: '2026 Combined Maths Sprint - Batch 01',
    registrationReference: 'REG-1008',
    paymentReference: 'PAY-9008',
    linkDeliveryStatus: 'pending',
    createdAt: '2026-03-25T09:05:00.000Z',
  },
  {
    fullName: 'Hashini Jayawardena',
    email: 'hashini.jayawardena@example.com',
    phone: '0741239988',
    studentCode: 'STU-1009',
    kuppiSession: '2026 Combined Maths Sprint - Batch 01',
    registrationReference: 'REG-1009',
    paymentReference: 'PAY-9009',
    linkDeliveryStatus: 'failed',
    createdAt: '2026-03-25T10:40:00.000Z',
  },
  {
    fullName: 'Dinuka Amarasinghe',
    email: 'dinuka.amarasinghe@example.com',
    phone: '0784455667',
    studentCode: 'STU-1010',
    kuppiSession: '2026 Combined Maths Sprint - Batch 01',
    registrationReference: 'REG-1010',
    paymentReference: 'PAY-9010',
    linkDeliveryStatus: 'sent',
    createdAt: '2026-03-25T11:20:00.000Z',
    linkSentAt: '2026-03-25T14:05:00.000Z',
  },
  {
    fullName: 'Chamodi Wijesinghe',
    email: 'chamodi.wijesinghe@example.com',
    phone: '0778899001',
    studentCode: 'STU-1011',
    kuppiSession: '2026 A/L Physics Support - Batch 01',
    registrationReference: 'REG-1011',
    paymentReference: 'PAY-9011',
    linkDeliveryStatus: 'pending',
    createdAt: '2026-03-25T12:15:00.000Z',
  },
  {
    fullName: 'Sahan Lakruwan',
    email: 'sahan.lakruwan@example.com',
    phone: '0719988771',
    studentCode: 'STU-1012',
    kuppiSession: '2026 A/L Chemistry Clinic - Batch 02',
    registrationReference: 'REG-1012',
    paymentReference: 'PAY-9012',
    linkDeliveryStatus: 'failed',
    createdAt: '2026-03-25T13:00:00.000Z',
  },
  {
    fullName: 'Fathima Rizna',
    email: 'fathima.rizna@example.com',
    phone: '0752233445',
    studentCode: 'STU-1013',
    kuppiSession: '2026 Combined Maths Sprint - Batch 01',
    registrationReference: 'REG-1013',
    paymentReference: 'PAY-9013',
    linkDeliveryStatus: 'sent',
    createdAt: '2026-03-25T14:00:00.000Z',
    linkSentAt: '2026-03-25T16:20:00.000Z',
  },
]

async function clearCollections() {
  await Promise.all([
    DispatchLog.deleteMany({}),
    Enrollment.deleteMany({}),
    Student.deleteMany({}),
    ClassOffering.deleteMany({}),
  ])
}

async function upsertOfferings(offerings) {
  const bySession = new Map()

  for (const offering of offerings) {
    const record = await ClassOffering.findOneAndUpdate(
      { kuppiSession: offering.kuppiSession },
      offering,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    )

    bySession.set(record.kuppiSession, record)
  }

  return bySession
}

async function stampTimestamps(model, id, createdAt, updatedAt = createdAt) {
  if (!createdAt) {
    return
  }

  await model.updateOne(
    { _id: id },
    {
      $set: {
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      },
    },
  )
}

async function createDispatchLogRecord({
  classOffering,
  student,
  recipient,
  subject,
  status,
  sentAt = null,
  createdAt = null,
  providerMessageId = '',
  errorMessage = '',
}) {
  const dispatchLog = await DispatchLog.create({
    classOffering,
    student,
    recipient,
    subject,
    status,
    providerMessageId,
    errorMessage,
    sentAt,
  })

  if (createdAt) {
    await DispatchLog.updateOne(
      { _id: dispatchLog._id },
      {
        $set: {
          createdAt: new Date(createdAt),
        },
      },
    )
  }
}

async function createEnrollmentRecord(item, offeringMap) {
  const student = await Student.findOneAndUpdate(
    { email: item.email },
    {
      fullName: item.fullName,
      email: item.email,
      phone: item.phone,
      studentCode: item.studentCode || '',
      isActive: item.isActive ?? true,
      deactivatedAt:
        item.isActive === false
          ? new Date(item.deactivatedAt || item.createdAt || Date.now())
          : null,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  )

  const classOffering = offeringMap.get(item.kuppiSession)
  const linkSentAt =
    item.linkDeliveryStatus === 'sent' && item.linkSentAt
      ? new Date(item.linkSentAt)
      : item.linkDeliveryStatus === 'sent'
        ? new Date(item.createdAt || Date.now())
        : null

  const enrollment = await Enrollment.findOneAndUpdate(
    { registrationReference: item.registrationReference },
    {
      student: student._id,
      classOffering: classOffering._id,
      registrationStatus: 'confirmed',
      paymentStatus: 'paid',
      confirmationSource: 'seed',
      registrationReference: item.registrationReference,
      paymentReference: item.paymentReference,
      linkDeliveryStatus: item.linkDeliveryStatus,
      linkSentAt,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  )

  await stampTimestamps(Enrollment, enrollment._id, item.createdAt)

  if (item.linkDeliveryStatus === 'sent') {
    await createDispatchLogRecord({
      classOffering: classOffering._id,
      student: student._id,
      recipient: student.email,
      subject: `${classOffering.title} class link`,
      status: 'sent',
      providerMessageId: `seed-${item.registrationReference}`,
      sentAt: linkSentAt,
      createdAt: item.linkSentAt || item.createdAt,
    })
  }

  if (item.linkDeliveryStatus === 'failed') {
    await createDispatchLogRecord({
      classOffering: classOffering._id,
      student: student._id,
      recipient: student.email,
      subject: `${classOffering.title} class link`,
      status: 'failed',
      errorMessage: 'Mailbox unavailable during seed simulation.',
      createdAt: item.createdAt,
    })
  }

  for (const dispatch of item.extraDispatches || []) {
    await createDispatchLogRecord({
      classOffering: classOffering._id,
      student: student._id,
      recipient: student.email,
      subject: `${classOffering.title} class link`,
      status: dispatch.status,
      providerMessageId:
        dispatch.status === 'sent'
          ? `seed-extra-${item.registrationReference}`
          : '',
      errorMessage: dispatch.errorMessage || '',
      sentAt: dispatch.createdAt ? new Date(dispatch.createdAt) : null,
      createdAt: dispatch.createdAt,
    })
  }

  return enrollment
}

async function seedDataset({ offerings, enrollments, reset = false }) {
  await connectDb()

  if (reset) {
    await clearCollections()
  }

  const offeringMap = await upsertOfferings(offerings)

  for (const enrollment of enrollments) {
    await createEnrollmentRecord(enrollment, offeringMap)
  }

  console.log(
    JSON.stringify({
      offerings: offerings.length,
      enrollments: enrollments.length,
      mode: reset ? 'reset-and-seed' : 'seed',
    }),
  )

  await mongoose.disconnect()
}

export async function seedBaseData(options = {}) {
  await seedDataset({
    offerings: baseOfferings,
    enrollments: baseEnrollments,
    reset: options.reset ?? false,
  })
}

export async function seedStandaloneDemoData() {
  await seedDataset({
    offerings: standaloneOfferings,
    enrollments: standaloneEnrollments,
    reset: true,
  })
}
