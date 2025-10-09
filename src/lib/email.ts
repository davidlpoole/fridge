// Email service using Resend
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@example.com";
const APP_NAME = "Fridge Recipe App";

/**
 * Send a magic link email
 */
export async function sendMagicLinkEmail(
  email: string,
  magicLinkUrl: string
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Sign in to ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background-color: #f9f9f9;
                border-radius: 8px;
                padding: 30px;
                margin: 20px 0;
              }
              .button {
                display: inline-block;
                background-color: #7c9473;
                color: white;
                text-decoration: none;
                padding: 14px 28px;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
              }
              .footer {
                color: #666;
                font-size: 14px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
              }
              .warning {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 12px;
                margin: 20px 0;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🍽️ Sign in to ${APP_NAME}</h1>
              <p>Hello!</p>
              <p>Click the button below to sign in to your account. This link will expire in <strong>15 minutes</strong>.</p>
              
              <a href="${magicLinkUrl}" class="button">Sign In</a>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                This link can only be used once and will expire in 15 minutes. If you didn't request this email, you can safely ignore it.
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666; font-size: 14px;">${magicLinkUrl}</p>
            </div>
            
            <div class="footer">
              <p>This is an automated email from ${APP_NAME}. Please do not reply to this email.</p>
              <p>If you didn't request this sign-in link, you can safely ignore this email.</p>
            </div>
          </body>
        </html>
      `,
      text: `
Sign in to ${APP_NAME}

Click the link below to sign in to your account. This link will expire in 15 minutes.

${magicLinkUrl}

Security Notice: This link can only be used once and will expire in 15 minutes. If you didn't request this email, you can safely ignore it.

This is an automated email from ${APP_NAME}. Please do not reply to this email.
      `,
    });

    if (error) {
      console.error("Error sending email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.FROM_EMAIL;
}
