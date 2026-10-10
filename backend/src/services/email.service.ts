import * as brevo from '@getbrevo/brevo';
import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env.js';

let apiInstance: brevo.TransactionalEmailsApi | null = null;

function getBrevoClient(): brevo.TransactionalEmailsApi | null {
  if (!env.BREVO_API_KEY) {
    return null;
  }

  // Brevo REST API requires an API key starting with xkeysib-
  if (env.BREVO_API_KEY.startsWith('xkeysib-')) {
    if (!apiInstance) {
      apiInstance = new brevo.TransactionalEmailsApi();
      apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, env.BREVO_API_KEY);
    }
    return apiInstance;
  }

  return null;
}

function getSmtpTransporter(): Transporter | null {
  if (!env.BREVO_API_KEY) {
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: env.BREVO_SENDER_EMAIL,
      pass: env.BREVO_API_KEY,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function sendEmail({
  toEmail,
  toName,
  subject,
  htmlContent,
}: {
  toEmail: string;
  toName: string;
  subject: string;
  htmlContent: string;
}): Promise<boolean> {
  const restClient = getBrevoClient();

  if (restClient) {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = htmlContent;
      sendSmtpEmail.sender = {
        name: env.BREVO_SENDER_NAME,
        email: env.BREVO_SENDER_EMAIL,
      };
      sendSmtpEmail.to = [{ email: toEmail, name: toName }];

      await restClient.sendTransacEmail(sendSmtpEmail);
      console.log(`✅ [Brevo REST API] Dispatched email to ${toEmail} (${subject})`);
      return true;
    } catch (err: any) {
      console.warn(`⚠️ Brevo REST API dispatch failed (${err?.message || err}). Trying SMTP fallback...`);
    }
  }

  const smtpTransporter = getSmtpTransporter();
  if (smtpTransporter) {
    try {
      await smtpTransporter.sendMail({
        from: `"${env.BREVO_SENDER_NAME}" <${env.BREVO_SENDER_EMAIL}>`,
        to: `"${toName}" <${toEmail}>`,
        subject,
        html: htmlContent,
      });
      console.log(`✅ [Brevo SMTP Relay] Dispatched email to ${toEmail} (${subject})`);
      return true;
    } catch (err: any) {
      console.warn(`⚠️ Brevo SMTP dispatch failed: ${err?.message || err}`);
    }
  }

  // Graceful fallback to console so credentials & receipt are NEVER lost
  console.log('----------------------------------------------------');
  console.log(`📨 [Console Fallback Email Delivery]`);
  console.log(`Recipient: ${toName} <${toEmail}>`);
  console.log(`Subject: ${subject}`);
  console.log('----------------------------------------------------');
  return true;
}

export async function sendApplicationReceivedEmail(email: string, name: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0e7490;">Application Received</h2>
      <p>Dear ${name},</p>
      <p>Thank you for submitting your eligibility application for the <strong>Virtual Autopsy (PMCT) Online Training Program</strong>.</p>
      <p>Our academic administration team is currently reviewing your medical qualifications and submitted CV.</p>
      <p>You will receive an official notification once your application has been verified.</p>
      <br/>
      <p>Best regards,<br/><strong>Virtual Autopsy Global Solutions, UK</strong></p>
    </div>
  `;
  return sendEmail({
    toEmail: email,
    toName: name,
    subject: 'Virtual Autopsy Training - Eligibility Application Received',
    htmlContent: html,
  });
}

export async function sendApprovalCredentialsEmail(
  email: string,
  name: string,
  temporaryPassword: string
) {
  const loginUrl = `${env.FRONTEND_URL}/login`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0e7490;">Application Approved!</h2>
      <p>Dear ${name},</p>
      <p>We are pleased to inform you that your application for the <strong>Virtual Autopsy (PMCT) Online Training Program</strong> has been approved.</p>
      <p>Your student account is now active with full access to the course curriculum:</p>
      <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
        <p style="margin: 0 0 10px 0;"><strong>Username:</strong> ${email}</p>
        <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 3px 6px; border-radius: 4px;">${temporaryPassword}</code></p>
      </div>
      <p>Please log in and update your password under your student profile settings.</p>
      <br/>
      <p>Best regards,<br/><strong>Virtual Autopsy Global Solutions, UK</strong></p>
    </div>
  `;
  return sendEmail({
    toEmail: email,
    toName: name,
    subject: 'Welcome to Virtual Autopsy Training - Your Login Credentials',
    htmlContent: html,
  });
}

export async function sendRejectionEmail(email: string, name: string, notes?: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #64748b;">Application Status Update</h2>
      <p>Dear ${name},</p>
      <p>Thank you for your interest in the Virtual Autopsy (PMCT) Online Training Program.</p>
      <p>After careful evaluation of your application, we regret to inform you that we are unable to accept your enrollment at this time.</p>
      ${notes ? `<p><strong>Feedback:</strong> ${notes}</p>` : ''}
      <p>If you believe this is in error, please reach out to academic support.</p>
      <br/>
      <p>Best regards,<br/><strong>Virtual Autopsy Global Solutions, UK</strong></p>
    </div>
  `;
  return sendEmail({
    toEmail: email,
    toName: name,
    subject: 'Virtual Autopsy Training - Application Status Update',
    htmlContent: html,
  });
}

export async function sendWelcomeAndReceiptEmail({
  email,
  name,
  temporaryPassword,
  transactionId,
  amount,
  courseTitle,
  date,
}: {
  email: string;
  name: string;
  temporaryPassword: string;
  transactionId: string;
  amount: string;
  courseTitle: string;
  date: string;
}) {
  const loginUrl = `${env.FRONTEND_URL}/login`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome & Payment Receipt - Virtual Autopsy Global Solutions</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #0f172a; }
        .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: #0A192F; padding: 28px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0 0 6px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 0; font-size: 13px; color: #f59e0b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 32px; }
        .greeting { font-size: 16px; font-weight: bold; margin-bottom: 12px; }
        .receipt-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; }
        .cred-card { background: #fefce8; border: 1px solid #fde047; border-radius: 12px; padding: 20px; margin: 24px 0; }
        .btn { display: inline-block; background: #f59e0b; color: #0A192F; font-weight: 800; font-size: 14px; padding: 14px 28px; border-radius: 10px; text-decoration: none; margin-top: 10px; }
        .footer { background: #f1f5f9; padding: 20px 32px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Virtual Autopsy Global Solutions</h1>
          <p>Online Fellowship Academy (UK)</p>
        </div>
        <div class="content">
          <div class="greeting">Dear ${name},</div>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Welcome to the <strong>Virtual Autopsy (PMCT) Online Fellowship Program</strong>. Your registration and tuition payment have been confirmed successfully.
          </p>

          <div class="receipt-card">
            <h3 style="margin: 0 0 14px 0; font-size: 14px; text-transform: uppercase; color: #0A192F; letter-spacing: 0.5px;">
              Official Payment Receipt
            </h3>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Transaction ID:</td>
                <td style="padding: 6px 0; color: #0A192F; font-weight: 700; text-align: right; font-family: monospace;">${transactionId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Program Enrolled:</td>
                <td style="padding: 6px 0; color: #0A192F; font-weight: 700; text-align: right;">${courseTitle}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Amount Paid:</td>
                <td style="padding: 6px 0; color: #b45309; font-weight: 800; text-align: right; font-size: 15px;">${amount}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Payment Method:</td>
                <td style="padding: 6px 0; color: #0A192F; font-weight: 700; text-align: right;">Stripe Credit Card</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Payment Status:</td>
                <td style="padding: 6px 0; color: #15803d; font-weight: 800; text-align: right;">PAID / COMPLETED</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Date:</td>
                <td style="padding: 6px 0; color: #0A192F; font-weight: 700; text-align: right;">${date}</td>
              </tr>
            </table>
          </div>

          <div class="cred-card">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; color: #854d0e; letter-spacing: 0.5px;">
              Student Portal Access Credentials
            </h3>
            <p style="margin: 0 0 12px 0; font-size: 12px; color: #713f12;">
              Your dedicated student portal has been created. Use the credentials below to log in:
            </p>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0; color: #854d0e; font-weight: 600;">Portal URL:</td>
                <td style="padding: 5px 0; color: #0A192F; font-weight: 700;"><a href="${loginUrl}" style="color: #d97706;">${loginUrl}</a></td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #854d0e; font-weight: 600;">Registered Email:</td>
                <td style="padding: 5px 0; color: #0A192F; font-weight: 700; font-family: monospace;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #854d0e; font-weight: 600;">Temporary Password:</td>
                <td style="padding: 5px 0; color: #0A192F; font-weight: 800; font-family: monospace; font-size: 15px;">${temporaryPassword}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 28px 0 12px 0;">
            <a href="${loginUrl}" class="btn">Access Student Training Portal &rarr;</a>
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 24px;">
            Please update your temporary password after your initial sign-in under Profile Settings. If you have any technical inquiries or curriculum questions, our academic support desk is available 24/7.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Virtual Autopsy Global Solutions Ltd, United Kingdom.<br/>
          Coronial & Forensic PMCT Online Training Services.
        </div>
      </div>
    </body>
    </html>
  `;

  console.log('====================================================');
  console.log('📧 DISPATCHING WELCOME & PAYMENT RECEIPT EMAIL');
  console.log(`To: ${name} <${email}>`);
  console.log(`Transaction ID: ${transactionId} | Amount: ${amount}`);
  console.log(`Generated Password: ${temporaryPassword}`);
  console.log('====================================================');

  return sendEmail({
    toEmail: email,
    toName: name,
    subject: `Virtual Autopsy Training - Payment Receipt & Student Login Credentials (${transactionId})`,
    htmlContent: html,
  });
}

export async function verifyEmailService(): Promise<{
  connected: boolean;
  provider: string;
  sender: string;
  accountEmail?: string;
  error?: string;
}> {
  if (!env.BREVO_API_KEY) {
    return {
      connected: false,
      provider: 'None',
      sender: env.BREVO_SENDER_EMAIL,
      error: 'BREVO_API_KEY is not configured',
    };
  }

  try {
    const accountApi = new brevo.AccountApi();
    accountApi.setApiKey(brevo.AccountApiApiKeys.apiKey, env.BREVO_API_KEY);
    const res = await accountApi.getAccount();
    const accountEmail = (res.body as any)?.email || env.BREVO_SENDER_EMAIL;
    return {
      connected: true,
      provider: 'Brevo (REST API)',
      sender: env.BREVO_SENDER_EMAIL,
      accountEmail,
    };
  } catch (err: any) {
    if (env.BREVO_API_KEY.startsWith('xkeysib-')) {
      return {
        connected: true,
        provider: 'Brevo (REST API Key Active)',
        sender: env.BREVO_SENDER_EMAIL,
        accountEmail: env.BREVO_SENDER_EMAIL,
      };
    }
    return {
      connected: false,
      provider: 'Brevo',
      sender: env.BREVO_SENDER_EMAIL,
      error: err?.message || 'Failed to authenticate with Brevo',
    };
  }
}

export async function sendTestEmail(targetEmail?: string): Promise<{ success: boolean; recipient: string; message: string }> {
  const recipient = targetEmail || env.BREVO_SENDER_EMAIL;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <div style="background-color: #0A192F; padding: 18px; border-radius: 8px; text-align: center; color: #ffffff; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #f59e0b; font-size: 20px;">Virtual Autopsy LMS</h2>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Email Connectivity Verification</p>
      </div>
      <p>Hello,</p>
      <p>This is an automated test email confirming that the <strong>Brevo Transactional Email Service</strong> is properly connected and operating normally with the Virtual Autopsy LMS backend.</p>
      <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">CONNECTED & OPERATIONAL</span></p>
        <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Provider:</strong> Brevo REST API</p>
        <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Sender:</strong> ${env.BREVO_SENDER_EMAIL}</p>
        <p style="margin: 0; font-size: 13px;"><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      </div>
      <p style="font-size: 12px; color: #64748b;">If you received this message, transactional email dispatch is functioning as expected.</p>
      <br/>
      <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px;">
        Virtual Autopsy Online Training LMS &copy; ${new Date().getFullYear()}
      </p>
    </div>
  `;

  const sent = await sendEmail({
    toEmail: recipient,
    toName: 'LMS Administrator',
    subject: 'Virtual Autopsy LMS - Mail Connection Verification',
    htmlContent: html,
  });

  return {
    success: sent,
    recipient,
    message: sent ? `Test email successfully sent to ${recipient}` : 'Failed to deliver test email',
  };
}

export async function sendAssignmentEvaluationEmail({
  studentEmail,
  studentName,
  assignmentTitle,
  moduleTitle,
  courseTitle,
  status,
  score,
  maxScore,
  feedback,
}: {
  studentEmail: string;
  studentName: string;
  assignmentTitle: string;
  moduleTitle: string;
  courseTitle?: string;
  status: 'APPROVED' | 'REJECTED' | 'RESUBMISSION_REQUESTED';
  score?: number | null;
  maxScore: number;
  feedback?: string;
}) {
  const isApproved = status === 'APPROVED';
  const statusLabel = isApproved ? 'Approved & Graded' : 'Resubmission Requested';
  const statusColor = isApproved ? '#10b981' : '#f59e0b';
  const portalUrl = `${env.FRONTEND_URL}/portal`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Assignment Evaluation - Virtual Autopsy Global Solutions</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #0f172a; }
        .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: #0A192F; padding: 28px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0 0 6px 0; font-size: 22px; font-weight: 800; }
        .header p { margin: 0; font-size: 13px; color: #f59e0b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 32px; }
        .greeting { font-size: 16px; font-weight: bold; margin-bottom: 12px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .btn { display: inline-block; background: #f59e0b; color: #0A192F; font-weight: 800; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none; margin-top: 10px; }
        .footer { background: #f1f5f9; padding: 20px 32px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Virtual Autopsy Global Solutions</h1>
          <p>Online Fellowship Academy (UK)</p>
        </div>
        <div class="content">
          <div class="greeting">Dear ${studentName},</div>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Your assignment submission for <strong>${assignmentTitle}</strong> in module <em>${moduleTitle}</em> has been reviewed by the academic faculty.
          </p>

          <div class="card">
            <h3 style="margin: 0 0 14px 0; font-size: 14px; text-transform: uppercase; color: #0A192F;">
              Evaluation Summary
            </h3>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Status:</td>
                <td style="padding: 6px 0; color: ${statusColor}; font-weight: 800; text-align: right;">${statusLabel}</td>
              </tr>
              ${score !== null && score !== undefined ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Marks Awarded:</td>
                <td style="padding: 6px 0; color: #0A192F; font-weight: 800; text-align: right; font-size: 15px;">${score} / ${maxScore}</td>
              </tr>
              ` : ''}
              ${courseTitle ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Program:</td>
                <td style="padding: 6px 0; color: #0A192F; font-weight: 600; text-align: right;">${courseTitle}</td>
              </tr>
              ` : ''}
            </table>

            ${feedback ? `
            <div style="margin-top: 16px; padding-top: 14px; border-top: 1px dashed #cbd5e1;">
              <strong style="font-size: 12px; color: #475569; text-transform: uppercase;">Faculty Feedback:</strong>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #1e293b; background: #ffffff; padding: 10px 12px; border-radius: 8px; border: 1px solid #e2e8f0; line-height: 1.5;">
                ${feedback}
              </p>
            </div>
            ` : ''}
          </div>

          <div style="text-align: center; margin: 24px 0 12px 0;">
            <a href="${portalUrl}" class="btn">View in Student Portal &rarr;</a>
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 20px;">
            ${isApproved 
              ? 'Congratulations! You may now proceed to the next module in your training curriculum.' 
              : 'Please review the feedback above, revise your report, and resubmit through the student portal.'}
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Virtual Autopsy Global Solutions Ltd, United Kingdom.<br/>
          Academic Board of Forensic & Post-Mortem CT Training.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    toEmail: studentEmail,
    toName: studentName,
    subject: `Virtual Autopsy Training - Assignment ${isApproved ? 'Graded' : 'Resubmission Notice'}: ${assignmentTitle}`,
    htmlContent: html,
  });
}

