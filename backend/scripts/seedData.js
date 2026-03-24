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
  },
  {
    title: '2026 A/L Chemistry Clinic',
    kuppiSession: '2026 A/L Chemistry Clinic - Batch 02',
    classLink: 'https://meet.google.com/chem-batch-02',
    status: 'ready',
  },
]

const baseEnrollments = [
  {
    fullName: 'Nimal Perera',
    email: 'nimal.perera@example.com',
    phone: '0771234567',
    kuppiSession: '2026 A/L Physics Support - Batch 01',
    registrationReference: 'REG-1001',
    paymentReference: 'PAY-9001',
    linkDeliveryStatus: 'pending',
  },
  {
    fullName: 'Tharushi De Silva',
    email: 'tharushi.desilva@example.com',
    phone: '0712345678',
    kuppiSession: '2026 A/L Physics Support - Batch 01',
    registrationReference: 'REG-1002',
    paymentReference: 'PAY-9002',
    linkDeliveryStatus: 'sent',
  },
  {
    fullName: 'Isuru Madushan',
    email: 'isuru.madushan@example.com',
    phone: '0759988776',
    kuppiSession: '2026 A/L Chemistry Clinic - Batch 02',
    registrationReference: 'REG-1003',
    paymentReference: 'PAY-9003',
    linkDeliveryStatus: 'failed',
  },
  {
    fullName: 'Piumi Fernando',
    email: 'piumi.fernando@example.com',
    phone: '0762233445',
    kuppiSession: '2026 A/L Chemistry Clinic - Batch 02',
    registrationReference: 'REG-1004',
    paymentReference: 'PAY-9004',
    linkDeliveryStatus: 'pending',
  },
  {
    fullName: 'Kavindu Senanayake',
    email: 'kavindu.senanayake@example.com',
    phone: '0705566778',
    kuppiSession: '2026 A/L Physics Support - Batch 01',
    registrationReference: 'REG-1005',
    paymentReference: 'PAY-9005',
    linkDeliveryStatus: 'sent',
  },
]

const standaloneOfferings = [
  ...baseOfferings,
  {
    title: '2026 Combined Maths Sprint',
    kuppiSession: '2026 Combined Maths Sprint - Batch 01',
    classLink: 'https://meet.google.com/maths-batch-01',
    status: 'active',
  },
]

const standaloneEnrollments = [
  ...baseEnrollments,
  {
    fullName: 'Sachini Rathnayake',
    email: 'sachini.rathnayake@example.com',
    phone: '0723355779',
    kuppiSession: '2026 Combined Maths Sprint - Batch 01',
    registrationReference: 'REG-1006',
    paymentReference: 'PAY-9006',
    linkDeliveryStatus: 'pending',
  },
  {
    fullName: 'Hashini Jayawardena',
    email: 'hashini.jayawardena@example.com',
    phone: '0741239988',
    kuppiSession: '2026 Combined Maths Sprint - Batch 01',
    registrationReference: 'REG-1007',
    paymentReference: 'PAY-9007',
    linkDeliveryStatus: 'failed',
  },
  {
    fullName: 'Dinuka Amarasinghe',
    email: 'dinuka.amarasinghe@example.com',
    phone: '0784455667',
    kuppiSession: '2026 Combined Maths Sprint - Batch 01',
    registrationReference: 'REG-1008',
    paymentReference: 'PAY-9008',
    linkDeliveryStatus: 'sent',
  },
  {
    fullName: 'Chamodi Wijesinghe',
    email: 'chamodi.wijesinghe@example.com',
    phone: '0778899001',
    kuppiSession: '2026 A/L Physics Support - Batch 01',
    registrationReference: 'REG-1009',
    paymentReference: 'PAY-9009',
    linkDeliveryStatus: 'pending',
  },
  {
    fullName: 'Sahan Lakruwan',
    email: 'sahan.lakruwan@example.com',
    phone: '0719988771',
    kuppiSession: '2026 A/L Chemistry Clinic - Batch 02',
    registrationReference: 'REG-1010',
    paymentReference: 'PAY-9010',
    linkDeliveryStatus: 'failed',
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
      },
    )

    bySession.set(record.kuppiSession, record)
  }

  return bySession
}

async function createEnrollmentRecord(item, offeringMap) {
  const student = await Student.findOneAndUpdate(
    { email: item.email },
    {
      fullName: item.fullName,
      email: item.email,
      phone: item.phone,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  )

  const classOffering = offeringMap.get(item.kuppiSession)
  const linkSentAt =
    item.linkDeliveryStatus === 'sent' ? new Date('2026-03-21T08:30:00.000Z') : null

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
    },
  )

  if (item.linkDeliveryStatus === 'sent') {
    await DispatchLog.create({
      classOffering: classOffering._id,
      student: student._id,
      recipient: student.email,
      subject: `${classOffering.title} class link`,
      status: 'sent',
      providerMessageId: `seed-${item.registrationReference}`,
      sentAt: linkSentAt,
    })
  }

  if (item.linkDeliveryStatus === 'failed') {
    await DispatchLog.create({
      classOffering: classOffering._id,
      student: student._id,
      recipient: student.email,
      subject: `${classOffering.title} class link`,
      status: 'failed',
      errorMessage: 'Mailbox unavailable during seed simulation.',
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
