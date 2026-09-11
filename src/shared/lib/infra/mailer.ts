import "server-only";
import nodemailer from "nodemailer";
import { env, smtpConfigured } from "./env";
import { logger } from "./logger";

export interface MailInput { to: string; subject: string; text: string; html?: string }

export interface SmtpConfig {
  host: string;
  port: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  from: string;
}

export async function testSmtpConnection(
  config: SmtpConfig,
  recipient: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure ?? (config.port === 465),
      auth: config.user && config.pass ? { user: config.user, pass: config.pass } : undefined,
      connectionTimeout: 10000,
    });

    await transport.verify();

    await transport.sendMail({
      from: config.from,
      to: recipient,
      subject: "[FMS] ทดสอบการเชื่อมต่อ Gmail SMTP สำเร็จ (Test Connection Successful)",
      text: "ยินดีด้วย! การตั้งค่า Gmail SMTP ของคุณเชื่อมต่อและส่งอีเมลได้สำเร็จเรียบร้อยแล้ว\n\nCongratulations! Your Gmail SMTP configuration is working properly.",
      html: `
        <div style="font-family: sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a; margin-top: 0;">✔ เชื่อมต่อ Gmail SMTP สำเร็จ</h2>
          <p>อีเมลฉบับนี้ถูกส่งเพื่อยืนยันว่าการตั้งค่าบัญชี Gmail บนระบบทำงานได้ตามปกติ</p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
          <ul style="color: #64748b; font-size: 14px; line-height: 1.6;">
            <li><strong>SMTP Server:</strong> ${config.host}:${config.port}</li>
            <li><strong>Sender:</strong> ${config.from}</li>
            <li><strong>Recipient:</strong> ${recipient}</li>
            <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
          </ul>
        </div>
      `,
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("test smtp connection failed", { err: message });
    return { success: false, error: message };
  }
}

/** ไม่มี SMTP → เขียนลง log ระดับ info แล้วคืน delivered:false — ระบบต้องไม่ล้มเพราะส่งอีเมลไม่ได้ */
export async function sendMail(
  input: MailInput,
  customConfig?: SmtpConfig | null
): Promise<{ delivered: boolean }> {
  let host: string;
  let port: number;
  let secure: boolean;
  let user: string | undefined;
  let pass: string | undefined;
  let from: string;

  if (customConfig && customConfig.host && customConfig.from) {
    host = customConfig.host;
    port = customConfig.port;
    secure = customConfig.secure ?? (port === 465);
    user = customConfig.user;
    pass = customConfig.pass;
    from = customConfig.from;
  } else {
    if (!smtpConfigured()) {
      logger.info("mail (no SMTP, logged only)", { to: input.to, subject: input.subject, text: input.text });
      return { delivered: false };
    }
    const e = env();
    host = e.SMTP_HOST;
    port = e.SMTP_PORT;
    secure = e.SMTP_PORT === 465;
    user = e.SMTP_USER || undefined;
    pass = e.SMTP_PASS || undefined;
    from = e.SMTP_FROM;
  }

  try {
    const transport = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
    });
    await transport.sendMail({ from, to: input.to, subject: input.subject, text: input.text, html: input.html });
    return { delivered: true };
  } catch (err) {
    logger.error("mail send failed", { to: input.to, err: err instanceof Error ? err.message : String(err) });
    return { delivered: false };
  }
}
