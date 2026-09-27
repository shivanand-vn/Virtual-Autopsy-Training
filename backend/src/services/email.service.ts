import * as brevo from '@getbrevo/brevo';
import { env } from '../config/env.js';

let apiInstance: brevo.TransactionalEmailsApi | null = null;

function getBrevoClient(): brevo.TransactionalEmailsApi | null {
  if (!env.BREVO_API_KEY) {
    console.warn('BREVO_API_KEY is not set. Emails will be logged to console.');
    return null;
  }

  if (!apiInstance) {
    apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, env.BREVO_API_KEY);
  }
  return apiInstance;
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
  const client = getBrevoClient();

  if (!client) {
    console.log(`[Mock Email to ${toEmail}] Subject: ${subject}`);
    return true;
  }

  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = {
      name: env.BREVO_SENDER_NAME,
      email: env.BREVO_SENDER_EMAIL,
    };
    sendSmtpEmail.to = [{ email: toEmail, name: toName }];

    await client.sendTransacEmail(sendSmtpEmail);
    return true;
  } catch (err) {
    console.error('Failed to dispatch transactional email via Brevo:', err);
    return false;
  }
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
