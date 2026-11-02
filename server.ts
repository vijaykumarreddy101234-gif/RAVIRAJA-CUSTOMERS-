import express from 'express';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // Store OTPs in memory for demo (use Redis/Firestore in production)
  const otpStore = new Map<string, { otp: string; expires: number }>();

  // EMAIL OTP CONFIG
  const transporter = nodemailer.createTransport({
    // Using a Ethereal (mock) or Gmail if provided. 
    // In production, user would provide SMTP details in .env
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER || 'mock_user@ethereal.email',
      pass: process.env.SMTP_PASS || 'mock_pass',
    },
  });

  // API Route: Send Email OTP
  app.post('/api/send-email-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email.toLowerCase(), {
      otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 mins
    });

    try {
      // Create test account if using ethereal and no credentials
      let finalTransporter = transporter;
      if (!process.env.SMTP_USER) {
         const testAccount = await nodemailer.createTestAccount();
         finalTransporter = nodemailer.createTransport({
           host: 'smtp.ethereal.email',
           port: 587,
           secure: false,
           auth: {
             user: testAccount.user,
             pass: testAccount.pass
           }
         });
      }

      const mailOptions = {
        from: '"Raviraja Industries Auth" <no-reply@raviraja.in>',
        to: email,
        subject: 'Your SCRAFT CRM Access OTP',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
            <h2 style="color: #0284c7;">SCRAFT Secure Login</h2>
            <p>Hello,</p>
            <p>Your verification code for accessing the Raviraja Industries CRM is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 20px; background: #f1f5f9; border-radius: 12px; text-align: center; margin: 20px 0; color: #0f172a;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="font-size: 12px; color: #64748b;">Raviraja Industries • SCRAFT uPVC Profiles • System Security</p>
          </div>
        `,
      };

      const info = await finalTransporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info);

      console.log('Message sent: %s', info.messageId);
      if (previewUrl) console.log('Preview URL: %s', previewUrl);

      res.json({ 
        success: true, 
        message: 'OTP sent successfully',
        previewUrl: previewUrl || undefined // Useful for debugging in dev environment
      });
    } catch (error: any) {
      console.error('Email send error:', error);
      res.status(500).json({ error: 'Failed to send email OTP', details: error.message });
    }
  });

  // API Route: Verify Email OTP
  app.post('/api/verify-email-otp', (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const stored = otpStore.get(email.toLowerCase());
    if (!stored) return res.status(400).json({ error: 'No OTP found for this email' });

    if (Date.now() > stored.expires) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (stored.otp === otp) {
      otpStore.delete(email.toLowerCase());
      res.json({ success: true, message: 'OTP verified' });
    } else {
      res.status(400).json({ error: 'Invalid OTP code' });
    }
  });

  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
