import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { uploadDocument } from '../services/storage.service.js';
import {
  sendApplicationReceivedEmail,
  sendApprovalCredentialsEmail,
  sendRejectionEmail,
} from '../services/email.service.js';
import { hashPassword, generateTemporaryPassword } from '../utils/password.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

const submitApplicationSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  countryCode: z.string().default('+44'),
  phoneNumber: z.string().min(6, 'Please enter a valid phone number'),
  qualification: z.string().min(2, 'Qualification is required'),
  professionalRole: z.string().min(2, 'Professional role is required'),
  organization: z.string().min(2, 'Organization is required'),
  consent: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).refine(
    (val) => val === true,
    { message: 'You must give consent to process your medical application data.' }
  ),
});

export async function submitApplication(req: Request, res: Response): Promise<void> {
  const parsedData = submitApplicationSchema.parse(req.body);

  if (!req.file) {
    sendError(res, 'CV upload (PDF format) is required for eligibility verification.', 400);
    return;
  }

  // Check if an application already exists for this email
  const existingApp = await prisma.application.findFirst({
    where: { email: parsedData.email.toLowerCase().trim() },
  });

  if (existingApp && existingApp.status === 'PENDING') {
    sendError(res, 'An application with this email is already under review.', 409);
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsedData.email.toLowerCase().trim() },
  });

  if (existingUser) {
    sendError(res, 'An active account already exists with this email address. Please log in.', 409);
    return;
  }

  // Upload CV to Cloudinary / R2 via Universal Storage Service
  const timestamp = Date.now();
  const sanitizedFilename = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${timestamp}-${sanitizedFilename}`;

  const cvFileUrl = await uploadDocument(req.file.buffer, 'cvs', fileName, req.file.mimetype);

  // Create Application in DB
  const application = await prisma.application.create({
    data: {
      fullName: parsedData.fullName,
      email: parsedData.email.toLowerCase().trim(),
      countryCode: parsedData.countryCode,
      phoneNumber: parsedData.phoneNumber,
      qualification: parsedData.qualification,
      professionalRole: parsedData.professionalRole,
      organization: parsedData.organization,
      cvFileUrl,
      consent: true,
      status: 'PENDING',
    },
  });

  // Dispatch email notification via Brevo in background
  sendApplicationReceivedEmail(application.email, application.fullName).catch(console.error);

  sendSuccess(
    res,
    'Your application has been submitted successfully and is now under review by the administration.',
    { applicationId: application.id, status: application.status },
    201
  );
}

export async function getApplications(req: AuthRequest, res: Response): Promise<void> {
  const statusFilter = req.query.status as string | undefined;

  const whereClause: { status?: 'PENDING' | 'APPROVED' | 'REJECTED' } = {};
  if (statusFilter && ['PENDING', 'APPROVED', 'REJECTED'].includes(statusFilter.toUpperCase())) {
    whereClause.status = statusFilter.toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED';
  }

  const applications = await prisma.application.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, email: true, isActive: true },
      },
    },
  });

  sendSuccess(res, 'Applications retrieved', { applications });
}

export async function getApplicationById(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, email: true, fullName: true, role: true, isActive: true },
      },
    },
  });

  if (!application) {
    sendError(res, 'Application not found', 404);
    return;
  }

  sendSuccess(res, 'Application details retrieved', { application });
}

export async function approveApplication(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const adminName = req.user?.fullName || 'Administrator';

  const application = await prisma.application.findUnique({
    where: { id },
  });

  if (!application) {
    sendError(res, 'Application not found', 404);
    return;
  }

  if (application.status === 'APPROVED') {
    sendError(res, 'Application has already been approved.', 400);
    return;
  }

  // Generate temporary password for the approved medical student
  const tempPassword = generateTemporaryPassword(10);
  const passwordHash = await hashPassword(tempPassword);

  // Use transaction to create user and update application status atomically
  const result = await prisma.$transaction(async (tx) => {
    // Check if user already exists
    let user = await tx.user.findUnique({
      where: { email: application.email },
    });

    if (!user) {
      user = await tx.user.create({
        data: {
          email: application.email,
          fullName: application.fullName,
          passwordHash,
          role: 'STUDENT',
          title: application.professionalRole,
          organization: application.organization,
          isActive: true,
        },
      });
    }

    const updatedApp = await tx.application.update({
      where: { id },
      data: {
        status: 'APPROVED',
        userId: user.id,
        reviewedAt: new Date(),
        reviewedBy: adminName,
      },
    });

    return { user, application: updatedApp };
  });

  // Dispatch welcome email with credentials via Brevo
  sendApprovalCredentialsEmail(application.email, application.fullName, tempPassword).catch(
    console.error
  );

  sendSuccess(res, 'Application approved and student credentials issued successfully', {
    applicationId: result.application.id,
    userId: result.user.id,
    email: result.user.email,
    temporaryPassword: tempPassword, // Also returned in API response for direct admin testing
  });
}

export async function rejectApplication(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { adminNotes } = req.body;
  const adminName = req.user?.fullName || 'Administrator';

  const application = await prisma.application.findUnique({
    where: { id },
  });

  if (!application) {
    sendError(res, 'Application not found', 404);
    return;
  }

  const updatedApp = await prisma.application.update({
    where: { id },
    data: {
      status: 'REJECTED',
      adminNotes: adminNotes || null,
      reviewedAt: new Date(),
      reviewedBy: adminName,
    },
  });

  // Dispatch rejection email via Brevo
  sendRejectionEmail(application.email, application.fullName, adminNotes).catch(console.error);

  sendSuccess(res, 'Application rejected successfully', {
    applicationId: updatedApp.id,
    status: updatedApp.status,
  });
}
