import { getRedisClient, isRedisConnected } from './redis.service.js';
import { sendEmail } from './email.service.js';

export interface EmailJob {
  toEmail: string;
  toName: string;
  subject: string;
  htmlContent: string;
  attempts?: number;
  enqueuedAt?: number;
}

const QUEUE_KEY = 'queue:emails';
const memoryEmailQueue: EmailJob[] = [];
let isWorkerRunning = false;

/**
 * Offload an email dispatch to the background worker queue backed by Upstash Redis
 */
export async function enqueueEmail(job: EmailJob): Promise<boolean> {
  const payload: EmailJob = {
    ...job,
    attempts: 0,
    enqueuedAt: Date.now(),
  };

  const redis = getRedisClient();
  if (redis && isRedisConnected()) {
    try {
      await redis.rpush(QUEUE_KEY, JSON.stringify(payload));
      return true;
    } catch {
      // Fall through to memory queue
    }
  }

  memoryEmailQueue.push(payload);
  return true;
}

/**
 * Background worker processing queued email jobs with retry support
 */
export function startEmailWorker(): void {
  if (isWorkerRunning) return;
  isWorkerRunning = true;

  console.log('  Email Worker : Background Queue Processor Initialized (Upstash Redis / Memory)');

  const processNextJob = async () => {
    let job: EmailJob | null = null;
    const redis = getRedisClient();

    if (redis && isRedisConnected()) {
      try {
        const raw = await redis.lpop(QUEUE_KEY);
        if (raw) {
          job = JSON.parse(raw);
        }
      } catch {
        // Fall back to memory queue
      }
    }

    if (!job && memoryEmailQueue.length > 0) {
      job = memoryEmailQueue.shift() || null;
    }

    if (job) {
      try {
        await sendEmail({
          toEmail: job.toEmail,
          toName: job.toName,
          subject: job.subject,
          htmlContent: job.htmlContent,
        });
        console.log(`  Email Worker : Dispatched background email to ${job.toEmail} (${job.subject})`);
      } catch (err: any) {
        console.warn(`[Email Worker] Failed to send email to ${job.toEmail} (attempt ${(job.attempts || 0) + 1}):`, err?.message || err);
        const currentAttempts = (job.attempts || 0) + 1;
        if (currentAttempts < 3) {
          job.attempts = currentAttempts;
          setTimeout(() => enqueueEmail(job!), 5000);
        }
      }
    }

    // Poll next job every 1 second
    setTimeout(processNextJob, 1000);
  };

  processNextJob();
}
