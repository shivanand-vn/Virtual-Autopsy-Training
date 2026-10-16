import { Response } from 'express';

export function sendSuccess<T = any>(
  res: Response,
  arg2: string | T,
  arg3?: T | string | number,
  arg4 = 200
) {
  let message = 'Success';
  let data: any = undefined;
  let statusCode = typeof arg4 === 'number' ? arg4 : 200;

  if (typeof arg2 === 'string') {
    message = arg2;
    data = arg3;
  } else {
    data = arg2;
    if (typeof arg3 === 'string') {
      message = arg3;
    } else if (typeof arg3 === 'number') {
      statusCode = arg3;
    }
  }

  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(res: Response, message: string, statusCode = 400, errors?: unknown) {
  let cleanMessage = message;

  const technicalPatterns = [
    /prisma/i,
    /database server/i,
    /pooler\.supabase/i,
    /postgresql/i,
    /10054/i,
    /ConnectionReset/i,
    /P100\d/i,
    /ECONNREFUSED/i,
    /Can't reach database/i,
    /Invalid `prisma\./i,
  ];

  if (cleanMessage && technicalPatterns.some((pattern) => pattern.test(cleanMessage))) {
    cleanMessage = 'Unable to complete your request at this time. Please try again shortly.';
  }

  return res.status(statusCode).json({
    success: false,
    message: cleanMessage,
    errors,
  });
}
