import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT') || 587;
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');
    const smtpFrom = this.configService.get<string>('SMTP_FROM') || smtpUser;

    // Only create transporter if SMTP is configured
    if (smtpHost && smtpUser && smtpPassword) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });
    } else {
      this.logger.warn(
        'SMTP not configured. Email notifications will be disabled. ' +
        'Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in .env to enable emails.',
      );
    }
  }

  async sendTaskAssignmentEmail(
    to: string,
    taskTitle: string,
    taskDescription: string | null,
    assignerName: string,
    taskId: string,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.debug('Email not sent: SMTP not configured');
      return;
    }

    const subject = `New Task Assigned: ${taskTitle}`;
    const html = this.getTaskAssignmentTemplate(
      taskTitle,
      taskDescription,
      assignerName,
      taskId,
    );

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM') || this.configService.get<string>('SMTP_USER'),
        to,
        subject,
        html,
      });
      this.logger.log(`Task assignment email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error.message);
    }
  }

  private getTaskAssignmentTemplate(
    taskTitle: string,
    taskDescription: string | null,
    assignerName: string,
    taskId: string,
  ): string {
    const appUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const taskUrl = `${appUrl}/tasks/${taskId}`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Task Assignment</title>
  <style>
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    @media only screen and (max-width: 650px) {
      .email-container { width: 100% !important; }
      .email-body { padding: 30px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #e5e7eb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #e5e7eb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="650" class="email-container" style="max-width: 650px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 26px; font-weight: 600;">
                New Task Assigned
              </h1>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 15px;">
                ${this.escapeHtml(assignerName)} assigned you a task
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="email-body" style="padding: 40px;">
              <!-- Task Details -->
              <table role="presentation" width="100%" style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 20px; font-weight: 600; line-height: 1.3;">
                      ${this.escapeHtml(taskTitle)}
                    </h2>
                    ${taskDescription ? `
                    <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                      ${this.escapeHtml(taskDescription)}
                    </p>
                    ` : ''}
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%">
                <tr>
                  <td align="center" style="padding: 8px 0;">
                    <a href="${taskUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px;">
                      View Task
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">
                © ${new Date().getFullYear()} TaskMaster. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    resetToken: string,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email not sent: SMTP not configured. Check your .env file for SMTP settings.');
      return;
    }

    const appUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    const subject = 'Password Reset Request';
    const html = this.getPasswordResetTemplate(firstName, resetUrl);

    const fromEmail = this.configService.get<string>('SMTP_FROM') || this.configService.get<string>('SMTP_USER');

    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');

      const plainText = `Reset Your Password - TaskMaster\n\nHello ${firstName},\n\nWe received a request to reset your password for your TaskMaster account. Click the link below to create a new password:\n\n${resetUrl}\n\n⚠️ Security Notice:\nThis password reset link will expire in 1 hour for your security. If you didn't request a password reset, please ignore this email and your password will remain unchanged.\n\nIf you're having trouble clicking the link, copy and paste the URL above into your web browser.\n\nThis is an automated email. Please do not reply to this message.\nIf you didn't request this password reset, you can safely ignore this email.\n\n---\nTaskMaster - Your trusted task management solution\n© ${new Date().getFullYear()} TaskMaster. All rights reserved.`;

      const info = await this.transporter.sendMail({
        from: `"TaskMaster" <${fromEmail}>`,
        to,
        subject,
        text: plainText,
        html,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high',
        },
      });

      this.logger.log(`✅ Password reset email sent successfully to ${to}`);
      this.logger.log(`📧 Email message ID: ${info.messageId}`);
      this.logger.log(`📧 Email response: ${info.response}`);
    } catch (error: any) {
      this.logger.error(`Failed to send password reset email to ${to}`);
      this.logger.error(`Error details: ${error.message}`);
      if (error.response) {
        this.logger.error(`SMTP response: ${error.response}`);
      }
      if (error.responseCode) {
        this.logger.error(`SMTP response code: ${error.responseCode}`);
      }
    }
  }

  private getPasswordResetTemplate(firstName: string, resetUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
  <style>
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    @media only screen and (max-width: 650px) {
      .email-container { width: 100% !important; }
      .email-body { padding: 30px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1e293b;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="650" class="email-container" style="max-width: 650px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0 0 6px 0; color: #ffffff; font-size: 26px; font-weight: 600;">
                Reset Your Password
              </h1>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 15px;">
                Secure your TaskMaster account
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="email-body" style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #111827; font-size: 15px; line-height: 1.6;">
                Hello <strong style="color: #6366f1;">${this.escapeHtml(firstName)}</strong>,
              </p>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 16px 0; color: #6b7280; font-size: 14px; text-align: center;">
                Or copy this link:
              </p>
              <p style="margin: 0 0 24px 0; padding: 12px; background-color: #f3f4f6; border-radius: 6px; word-break: break-all; color: #6366f1; font-size: 13px; text-align: center; font-family: monospace;">
                ${resetUrl}
              </p>

              <!-- Warning -->
              <table role="presentation" width="100%" style="margin: 24px 0;">
                <tr>
                  <td style="background-color: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 6px; padding: 16px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                      <strong>⚠️ Security Notice:</strong> This link expires in 1 hour. If you didn't request this reset, please ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">
                © ${new Date().getFullYear()} TaskMaster. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}