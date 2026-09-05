import { Injectable, Logger } from '@nestjs/common';
import { BrevoClient } from "@getbrevo/brevo";

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly brevo = new BrevoClient({
        apiKey: process.env.BREVO_API_KEY || 'YOUR_BREVO_API_KEY',
    });

    async sendOtpEmail(toEmail: string, otp: string): Promise<void> {
        const senderName = process.env.BREVO_SENDER_NAME || 'Chat App Support';
        const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@yourdomain.com';

        await this.brevo.transactionalEmails.sendTransacEmail({
            subject: `${otp} is your verification code`,
            sender: {
                name: senderName,
                email: senderEmail,
            },
            to: [{ email: toEmail }],
            textContent: `Your verification code is: ${otp}. Valid for 5 minutes.`,
            htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 28px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #4f46e5; text-align: center; margin-bottom: 8px;">Verification Code</h2>
          <p style="color: #4b5563; text-align: center; font-size: 14px;">Enter this code to access your account. Valid for <strong>5 minutes</strong>.</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; background-color: #f3f4f6; padding: 12px 24px; border-radius: 8px; display: inline-block; color: #111827;">
              ${otp}
            </span>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">If you didn't request this, ignore this email.</p>
        </div>
      `,
        });

        this.logger.log(`[BrevoClient] Email delivered to ${toEmail}`);
    }
}
