import nodemailer from "nodemailer";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send email
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ""), // Strip HTML if no text provided
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error("Email send error:", error);
    throw error;
  }
};

/**
 * Send verification email
 */
export const sendVerificationEmail = async (user, verificationCode) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?code=${verificationCode}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Xác thực tài khoản của bạn</h2>
      <p>Xin chào ${user.hoTen},</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng click vào nút bên dưới để xác thực email của bạn:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Xác thực tài khoản
        </a>
      </div>
      <p>Hoặc copy link sau vào trình duyệt:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <p>Link này sẽ hết hạn sau 24 giờ.</p>
      <hr style="border: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: "Xác thực tài khoản - BMC CAF Library",
    html,
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (user, resetCode) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?code=${resetCode}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Reset mật khẩu</h2>
      <p>Xin chào ${user.hoTen},</p>
      <p>Chúng tôi nhận được yêu cầu reset mật khẩu cho tài khoản của bạn.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset mật khẩu
        </a>
      </div>
      <p>Hoặc copy link sau vào trình duyệt:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p>Link này sẽ hết hạn sau 1 giờ.</p>
      <hr style="border: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">Nếu bạn không yêu cầu reset mật khẩu, vui lòng bỏ qua email này.</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: "Reset mật khẩu - BMC CAF Library",
    html,
  });
};

/**
 * Send document approval notification
 */
export const sendDocumentApprovalEmail = async (user, document) => {
  const documentUrl = `${process.env.CLIENT_URL}/documents/${document._id}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Tài liệu của bạn đã được duyệt</h2>
      <p>Xin chào ${user.hoTen},</p>
      <p>Tài liệu "<strong>${document.thongTinDaNgonNgu.tieuDe.vi}</strong>" của bạn đã được duyệt và xuất bản.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${documentUrl}" style="background-color: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Xem tài liệu
        </a>
      </div>
      <p>Cảm ơn bạn đã đóng góp cho thư viện của chúng tôi!</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: "Tài liệu đã được duyệt - BMC CAF Library",
    html,
  });
};

/**
 * Send document rejection notification
 */
export const sendDocumentRejectionEmail = async (user, document, reason) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Tài liệu của bạn không được duyệt</h2>
      <p>Xin chào ${user.hoTen},</p>
      <p>Rất tiếc, tài liệu "<strong>${document.thongTinDaNgonNgu.tieuDe.vi}</strong>" của bạn không được duyệt.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Lý do:</strong></p>
        <p style="margin: 10px 0 0 0;">${reason}</p>
      </div>
      <p>Bạn có thể chỉnh sửa và tải lại tài liệu sau khi khắc phục các vấn đề trên.</p>
      <p>Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: "Tài liệu không được duyệt - BMC CAF Library",
    html,
  });
};
