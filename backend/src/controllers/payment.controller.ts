import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { hashPassword } from '../utils/password.js';
import { sendWelcomeAndReceiptEmail } from '../services/email.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

const completePaymentSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email address is required'),
  countryCode: z.string().default('+44'),
  phoneNumber: z.string().optional().default(''),
  qualification: z.string().optional().default('MBBS / MD'),
  professionalRole: z.string().optional().default('Forensic Pathologist'),
  organization: z.string().optional().default('Virtual Autopsy Training Academy'),
  cvFileUrl: z.string().optional(),
  amount: z.string().default('£999.00'),
  currency: z.string().default('GBP'),
  tier: z.string().default('Virtual Autopsy Online Fellowship (£999)'),
  cardholderName: z.string().optional(),
  cardLast4: z.string().optional().default('4242'),
  transactionRef: z.string().optional(),
});

function generateCleanTemporaryPassword(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%';
  
  let pass = 'VA@';
  for (let i = 0; i < 3; i++) {
    pass += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 3; i++) {
    pass += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  pass += symbols.charAt(Math.floor(Math.random() * symbols.length));
  return pass;
}

export async function completeRegistrationAndPayment(req: Request, res: Response): Promise<void> {
  const parsed = completePaymentSchema.safeParse(req.body);

  if (!parsed.success) {
    sendError(res, 'Validation failed: ' + parsed.error.issues.map((i) => i.message).join(', '), 400);
    return;
  }

  const {
    fullName,
    email,
    countryCode,
    phoneNumber,
    qualification,
    professionalRole,
    organization,
    cvFileUrl,
    amount,
    currency,
    tier,
    cardLast4,
    transactionRef,
  } = parsed.data;

  const normalizedEmail = email.toLowerCase().trim();
  const temporaryPassword = generateCleanTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  const txnId = transactionRef || `VA-TXN-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    // 1. Upsert Student User
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          fullName: fullName.trim(),
          role: 'STUDENT',
          title: qualification,
          organization: organization.trim(),
          isActive: true,
        },
      });
      console.log(`👤 Created student user account: ${user.email} (ID: ${user.id})`);
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          fullName: fullName.trim(),
          role: 'STUDENT',
          passwordHash, // Reset temporary password to the newly issued one
          title: qualification,
          organization: organization.trim(),
          isActive: true,
        },
      });
      console.log(`👤 Updated existing user to student: ${user.email} (ID: ${user.id})`);
    }

    // 2. Upsert Application Record
    const existingApp = await prisma.application.findFirst({
      where: { email: normalizedEmail },
    });

    if (existingApp) {
      await prisma.application.update({
        where: { id: existingApp.id },
        data: {
          userId: user.id,
          fullName: fullName.trim(),
          countryCode: countryCode || existingApp.countryCode,
          phoneNumber: phoneNumber || existingApp.phoneNumber,
          qualification: qualification || existingApp.qualification,
          professionalRole: professionalRole || existingApp.professionalRole,
          organization: organization || existingApp.organization,
          status: 'APPROVED',
          consent: true,
          reviewedAt: new Date(),
          reviewedBy: 'Stripe Tuition Auto-Clearance',
        },
      });
    } else {
      await prisma.application.create({
        data: {
          userId: user.id,
          email: normalizedEmail,
          fullName: fullName.trim(),
          countryCode: countryCode || '+44',
          phoneNumber: phoneNumber || '+44 7700 900077',
          qualification: qualification || 'MBBS / MD',
          professionalRole: professionalRole || 'Forensic Pathologist',
          organization: organization || 'Virtual Autopsy Training Academy',
          cvFileUrl: cvFileUrl || 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
          status: 'APPROVED',
          consent: true,
          reviewedAt: new Date(),
          reviewedBy: 'Stripe Tuition Auto-Clearance',
        },
      });
    }

    // 3. Auto-Enroll in Published Course
    const defaultCourse = await prisma.course.findFirst({
      where: { status: 'PUBLISHED' },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          take: 1,
        },
      },
    });

    if (defaultCourse && defaultCourse.modules.length > 0) {
      const firstModule = defaultCourse.modules[0];
      const existingProgress = await prisma.courseProgress.findUnique({
        where: {
          userId_moduleId: {
            userId: user.id,
            moduleId: firstModule.id,
          },
        },
      });

      if (!existingProgress) {
        await prisma.courseProgress.create({
          data: {
            userId: user.id,
            moduleId: firstModule.id,
            isCompleted: false,
            lastVideoTimestamp: 0,
          },
        });
        console.log(`📚 Auto-enrolled student in Module 1 of: ${defaultCourse.title}`);
      }
    }

    // 4. Record Payment Transaction in Database
    const payment = await prisma.payment.create({
      data: {
        transactionRef: txnId,
        userId: user.id,
        candidateName: fullName.trim(),
        email: normalizedEmail,
        tier: tier || 'Virtual Autopsy Online Fellowship (£999)',
        amount: amount || '£999.00',
        currency: currency || 'GBP',
        paymentMethod: 'Stripe Credit Card',
        cardLast4: cardLast4 || '4242',
        status: 'COMPLETED',
      },
    });

    console.log(`💳 Recorded Payment: ${payment.transactionRef} for ${payment.email} - ${payment.amount}`);

    // 5. Send Welcome & Receipt Transactional Email
    const courseTitle = defaultCourse?.title || 'Basic Virtual Autopsy – An Online Introduction';
    const formattedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    sendWelcomeAndReceiptEmail({
      email: normalizedEmail,
      name: fullName.trim(),
      temporaryPassword,
      transactionId: txnId,
      amount: amount || '£999.00',
      courseTitle,
      date: formattedDate,
    }).catch((emailErr) => {
      console.warn('⚠️ Asynchronous email dispatch error:', emailErr);
    });

    // 6. Return response
    sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          title: user.title,
          organization: user.organization,
        },
        payment: {
          id: payment.id,
          transactionRef: payment.transactionRef,
          amount: payment.amount,
          status: payment.status,
          createdAt: payment.createdAt,
        },
        credentials: {
          email: user.email,
          temporaryPassword,
        },
      },
      'Registration, payment, and student enrollment completed successfully.',
      201
    );
  } catch (error: any) {
    console.error('Error in completeRegistrationAndPayment:', error);
    sendError(res, error.message || 'Internal server error processing registration payment.', 500);
  }
}

export async function getAdminPayments(_req: Request, res: Response): Promise<void> {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    // Calculate revenue stats
    const completedPayments = payments.filter((p) => p.status === 'COMPLETED');
    const totalAmount = completedPayments.reduce((acc, p) => {
      const numericVal = parseFloat(p.amount.replace(/[^0-9.]/g, '')) || 0;
      return acc + numericVal;
    }, 0);

    const formattedRevenue = `£${totalAmount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    sendSuccess(res, {
      payments,
      totalRevenue: formattedRevenue,
      completedCount: completedPayments.length,
      totalCount: payments.length,
    });
  } catch (error: any) {
    console.error('Error fetching admin payments:', error);
    sendError(res, error.message || 'Failed to fetch payments.', 500);
  }
}

export async function getPaymentReceipt(req: Request, res: Response): Promise<void> {
  const transactionRef = String(req.params.transactionRef);

  try {
    const payment = await prisma.payment.findUnique({
      where: { transactionRef },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!payment) {
      sendError(res, 'Payment transaction not found.', 404);
      return;
    }

    sendSuccess(res, payment);
  } catch (error: any) {
    console.error('Error fetching payment receipt:', error);
    sendError(res, error.message || 'Failed to fetch receipt.', 500);
  }
}
