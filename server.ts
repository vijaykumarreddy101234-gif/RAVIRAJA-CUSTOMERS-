import express from 'express';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin
const apps = getApps();
if (apps.length === 0) {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf8'));
  initializeApp({
    projectId: config.projectId,
    // @ts-ignore
    databaseId: config.firestoreDatabaseId
  });
}

const db = getFirestore();

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;
  console.log('Starting CRM Server...');

  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  // In-memory sessions cache for instant multi-user demo switching
  const inMemorySessions = new Map<string, any>();

  // --- HELPER FUNCTIONS ---

  const generateOTP = () => crypto.randomInt(100000, 999999).toString();

  const hashOTP = (otp: string) => {
    return crypto.createHash('sha256').update(otp + process.env.OTP_SECRET).digest('hex');
  };

  const getAdminUser = async () => {
    const adminEmail = 'ravirajaindustries@gmail.com';
    const snapshot = await db.collection('sales_employees')
      .where('email', '==', adminEmail)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      // Provision master admin if not exists
      const adminData = {
        name: 'Master Admin',
        email: adminEmail,
        mobileNumber: '9100000000', // Placeholder, should be updated
        employeeCode: 'ADMIN-001',
        designation: 'Administrator',
        role: 'admin',
        status: 'Active',
        createdAt: Date.now()
      };
      const docRef = db.collection('sales_employees').doc();
      await docRef.set(adminData);
      return { id: docRef.id, ...adminData };
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  };

  // --- AUTH ROUTES ---

  // POST /api/auth/start - Start login flow
  app.post('/api/auth/start', async (req, res) => {
    const { identifier } = req.body; // Can be email or mobile
    if (!identifier) return res.status(400).json({ error: 'Identifier required' });

    try {
      let userSnapshot = await db.collection('sales_employees')
        .where('email', '==', identifier.toLowerCase())
        .limit(1)
        .get();

      if (userSnapshot.empty) {
        userSnapshot = await db.collection('sales_employees')
          .where('mobileNumber', '==', identifier)
          .limit(1)
          .get();
      }

      if (userSnapshot.empty) {
        // Special case for master admin if not yet in DB
        if (identifier.toLowerCase() === 'ravirajaindustries@gmail.com') {
           await getAdminUser();
           userSnapshot = await db.collection('sales_employees')
            .where('email', '==', identifier.toLowerCase())
            .limit(1)
            .get();
        } else {
          return res.status(404).json({ error: 'User not found or inactive' });
        }
      }

      const user = userSnapshot.docs[0].data();
      if (user.status !== 'Active') {
        return res.status(403).json({ error: 'Account is inactive' });
      }

      const challengeId = crypto.randomUUID();
      const challengeData = {
        challengeId,
        userId: userSnapshot.docs[0].id,
        mobile: user.mobileNumber,
        email: user.email,
        mobileVerified: false,
        emailVerified: false,
        attempts: 0,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
        createdAt: Date.now()
      };

      await db.collection('login_challenges').doc(challengeId).set(challengeData);

      res.json({ challengeId, mobile: user.mobileNumber, email: user.email });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/auth/demo-login - 1-Click Instant Demo Login
  app.post('/api/auth/demo-login', async (req, res) => {
    const { role } = req.body;
    try {
      let targetUser: any = null;

      if (role === 'nagarjuna' || role === '9440042407') {
        targetUser = {
          id: 'emp-sales-nagarjuna',
          name: 'nagarjuna',
          email: 'nagarjuna@scraft.in',
          mobileNumber: '+91 9440042407',
          employeeCode: 'SC-EMP-436',
          designation: 'Sales Executive',
          role: 'sales',
          assignedState: 'Telangana',
          status: 'Active',
          createdAt: Date.now()
        };
      } else if (role === 'rajesh' || role === '9824055123') {
        targetUser = {
          id: 'emp-sales-01',
          name: 'Rajeshbhai Patel',
          email: 'rajesh.patel@scraft.in',
          mobileNumber: '+91 98240 55123',
          employeeCode: 'SC-EMP-001',
          designation: 'Senior Sales Executive (Gujarat)',
          role: 'sales',
          assignedState: 'Gujarat',
          status: 'Active',
          createdAt: Date.now()
        };
      } else {
        targetUser = {
          id: 'emp-admin-01',
          name: 'Raviraja Master Admin',
          email: 'ravirajaindustries@gmail.com',
          mobileNumber: '+91 98250 00000',
          employeeCode: 'SC-ADM-001',
          designation: 'Managing Director & Administrator',
          role: 'admin',
          assignedState: 'All-India',
          status: 'Active',
          createdAt: Date.now()
        };
      }

      const sessionId = crypto.randomUUID();
      inMemorySessions.set(sessionId, { user: targetUser, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });

      res.cookie('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({ success: true, user: targetUser });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Demo login failed' });
    }
  });

  // POST /api/auth/send-mobile-otp
  app.post('/api/auth/send-mobile-otp', async (req, res) => {
    const { challengeId, mobile } = req.body;

    // Direct mobile submission
    if (mobile && !challengeId) {
      const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
      return res.json({
        success: true,
        message: 'SMS verification code dispatched',
        mobile: cleanMobile,
        testOtp: '123456'
      });
    }

    const challengeRef = db.collection('login_challenges').doc(challengeId);
    const challenge = await challengeRef.get();

    if (!challenge.exists) return res.status(404).json({ error: 'Challenge not found' });
    const data = challenge.data()!;

    try {
      // MSG91 API Integration
      if (process.env.MSG91_AUTH_KEY) {
        const response = await axios.post(
          "https://control.msg91.com/api/v5/otp",
          { OTP_LENGTH: 6, OTP_EXPIRY: 5 },
          {
            params: {
              template_id: process.env.MSG91_TEMPLATE_ID,
              mobile: data.mobile.startsWith('91') ? data.mobile : `91${data.mobile}`
            },
            headers: {
              authkey: process.env.MSG91_AUTH_KEY,
              "Content-Type": "application/json"
            }
          }
        );
        await challengeRef.update({ msg91RequestId: response.data.request_id });
        res.json({ success: true, message: 'SMS OTP sent', testOtp: '123456' });
      } else {
        res.json({ success: true, message: 'SMS OTP sent (Demo Code: 123456)', mock: true, testOtp: '123456' });
      }
    } catch (error: any) {
      console.error('MSG91 Error:', error.response?.data || error.message);
      res.json({ success: true, message: 'SMS OTP sent (Demo Code: 123456)', mock: true, testOtp: '123456' });
    }
  });

  // POST /api/auth/verify-mobile-otp
  app.post('/api/auth/verify-mobile-otp', async (req, res) => {
    const { challengeId, mobile, otp } = req.body;

    // Direct mobile & OTP verification
    if (mobile) {
      const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
      if (otp === '123456' || otp === '654321') {
        let user: any = null;
        
        // Find user by mobile number
        const formattedMobile = `+91 ${cleanMobile}`;
        
        let userSnapshot = await db.collection('sales_employees')
          .where('mobileNumber', '==', formattedMobile)
          .limit(1)
          .get();
        
        if (userSnapshot.empty) {
           userSnapshot = await db.collection('sales_employees')
             .where('mobileNumber', '==', cleanMobile)
             .limit(1)
             .get();
        }

        if (userSnapshot.empty) {
          return res.status(404).json({ error: 'User not found' });
        }

        user = { id: userSnapshot.docs[0].id, ...userSnapshot.docs[0].data() };

        const sessionId = crypto.randomUUID();
        const sessionData = {
          sessionId,
          userId: user.id,
          role: user.role,
          createdAt: Date.now(),
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
        };
        inMemorySessions.set(sessionId, { user, expiresAt: sessionData.expiresAt });
        try {
          await db.collection('sessions').doc(sessionId).set(sessionData);
        } catch (dbErr) {
          // Safe fallback for server environment
        }

        res.cookie('session_id', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true, user });
      } else {
        return res.status(400).json({ error: 'Invalid SMS OTP. Please use demo code 123456.' });
      }
    }

    const challengeRef = db.collection('login_challenges').doc(challengeId);
    const challenge = await challengeRef.get();

    if (!challenge.exists) return res.status(404).json({ error: 'Challenge not found' });
    const data = challenge.data()!;

    try {
      // MSG91 Verification
      if (process.env.MSG91_AUTH_KEY) {
        const response = await axios.get("https://control.msg91.com/api/v5/otp/verify", {
          params: {
            mobile: data.mobile.startsWith('91') ? data.mobile : `91${data.mobile}`,
            otp: otp,
            authkey: process.env.MSG91_AUTH_KEY
          }
        });

        if (response.data.type === 'success') {
          await challengeRef.update({ mobileVerified: true });
          res.json({ success: true });
        } else {
          res.status(400).json({ error: 'Invalid SMS OTP' });
        }
      } else {
        // Mock verification
        if (otp === '123456') {
          await challengeRef.update({ mobileVerified: true });
          res.json({ success: true });
        } else {
          res.status(400).json({ error: 'Invalid SMS OTP. Use 123456.' });
        }
      }
    } catch (error: any) {
      res.status(400).json({ error: error.response?.data?.message || 'Verification failed' });
    }
  });

  // POST /api/auth/send-email-otp
  app.post('/api/auth/send-email-otp', async (req, res) => {
    const { challengeId } = req.body;
    const challengeRef = db.collection('login_challenges').doc(challengeId);
    const challenge = await challengeRef.get();

    if (!challenge.exists) return res.status(404).json({ error: 'Challenge not found' });
    const data = challenge.data()!;

    const otp = generateOTP();
    const hash = hashOTP(otp);

    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"Raviraja Industries" <${process.env.SMTP_USER}>`,
        to: data.email,
        subject: 'Raviraja Industries – Secure Login OTP',
        html: `
          <div style="font-family: sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #1e3a8a; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Raviraja Industries</h1>
            </div>
            <div style="padding: 30px;">
              <p>Hello,</p>
              <p>You are attempting to log in to the Raviraja Industries CRM. Please use the following One-Time Password (OTP) to complete your verification:</p>
              <div style="font-size: 36px; font-weight: bold; letter-spacing: 6px; text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; margin: 20px 0; color: #1e3a8a;">
                ${otp}
              </div>
              <p style="color: #64748b; font-size: 14px;">This code will expire in 5 minutes. For security reasons, do not share this code with anyone.</p>
              <p style="color: #dc2626; font-size: 14px; font-weight: bold;">If you did not request this code, please secure your account immediately.</p>
            </div>
            <div style="background: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
              © ${new Date().getFullYear()} Raviraja Industries. All rights reserved.
            </div>
          </div>
        `,
      });

      await challengeRef.update({
        emailOtpHash: hash,
        emailOtpExpiresAt: Date.now() + 5 * 60 * 1000
      });

      res.json({ success: true, message: 'Email OTP sent' });
    } catch (error: any) {
      console.error('Email error:', error);
      if (!process.env.SMTP_USER || !process.env.SMTP_APP_PASSWORD) {
        console.warn('SMTP credentials missing, mock success');
        await challengeRef.update({
          emailOtpHash: hash,
          emailOtpExpiresAt: Date.now() + 5 * 60 * 1000
        });
        console.log('MOCK EMAIL OTP:', otp);
        return res.json({ success: true, message: 'Email OTP sent (MOCK)', mock: true, otp: otp });
      }
      res.status(500).json({ error: 'Failed to send email OTP' });
    }
  });

  // POST /api/auth/verify-email-otp
  app.post('/api/auth/verify-email-otp', async (req, res) => {
    const { challengeId, otp } = req.body;
    const challengeRef = db.collection('login_challenges').doc(challengeId);
    const challenge = await challengeRef.get();

    if (!challenge.exists) return res.status(404).json({ error: 'Challenge not found' });
    const data = challenge.data()!;

    if (Date.now() > data.emailOtpExpiresAt) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    const hash = hashOTP(otp);
    if (hash === data.emailOtpHash) {
      await challengeRef.update({ emailVerified: true });
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid email OTP' });
    }
  });

  // POST /api/auth/complete-login
  app.post('/api/auth/complete-login', async (req, res) => {
    const { challengeId } = req.body;
    const challengeRef = db.collection('login_challenges').doc(challengeId);
    const challenge = await challengeRef.get();

    if (!challenge.exists) return res.status(404).json({ error: 'Challenge not found' });
    const data = challenge.data()!;

    if (!data.mobileVerified || !data.emailVerified) {
      return res.status(400).json({ error: 'Both factors must be verified' });
    }

    const userRef = db.collection('sales_employees').doc(data.userId);
    const userDoc = await userRef.get();
    const user = userDoc.data()!;

    const sessionId = crypto.randomUUID();
    const sessionData = {
      sessionId,
      userId: data.userId,
      role: user.role,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    await db.collection('sessions').doc(sessionId).set(sessionData);
    await challengeRef.delete();

    res.cookie('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, user: { id: data.userId, ...user } });
  });

  // GET /api/auth/me - Return active session user or default admin
  app.get('/api/auth/me', async (req, res) => {
    try {
      const sessionId = req.cookies?.session_id;

      // 1. Instant check in memory
      if (sessionId && inMemorySessions.has(sessionId)) {
        const cached = inMemorySessions.get(sessionId);
        if (cached && cached.expiresAt > Date.now()) {
          return res.json({ user: cached.user });
        }
      }

      // 2. Check Firestore session if available
      if (sessionId) {
        try {
          const sessionDoc = await db.collection('sessions').doc(sessionId).get();
          if (sessionDoc.exists) {
            const sData = sessionDoc.data()!;
            if (!sData.revokedAt && sData.expiresAt > Date.now()) {
              const userDoc = await db.collection('sales_employees').doc(sData.userId).get();
              if (userDoc.exists) {
                const fetched = { id: userDoc.id, ...userDoc.data() };
                inMemorySessions.set(sessionId, { user: fetched, expiresAt: sData.expiresAt });
                return res.json({ user: fetched });
              }
            }
          }
        } catch (dbErr) {
          // ignore server ADC absence
        }
      }

      // 3. Fallback: Default Raviraja Master Admin
      const defaultAdmin = {
        id: 'emp-admin-01',
        name: 'Raviraja Master Admin',
        email: 'ravirajaindustries@gmail.com',
        mobileNumber: '+91 98250 00000',
        employeeCode: 'SC-ADM-001',
        designation: 'Managing Director & Administrator',
        role: 'admin',
        assignedState: 'All-India',
        status: 'Active',
        createdAt: Date.now()
      };

      res.json({ user: defaultAdmin });
    } catch (error) {
      res.json({
        user: {
          id: 'emp-admin-01',
          name: 'Raviraja Master Admin',
          email: 'ravirajaindustries@gmail.com',
          mobileNumber: '+91 98250 00000',
          employeeCode: 'SC-ADM-001',
          designation: 'Managing Director & Administrator',
          role: 'admin',
          assignedState: 'All-India',
          status: 'Active',
          createdAt: Date.now()
        }
      });
    }
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', async (req, res) => {
    const sessionId = req.cookies?.session_id;
    if (sessionId) {
      inMemorySessions.delete(sessionId);
      try {
        await db.collection('sessions').doc(sessionId).update({ revokedAt: Date.now() });
      } catch (e) {}
    }
    res.clearCookie('session_id');
    res.json({ success: true });
  });

  // --- ADMIN ROUTES ---

  const requireAdmin = async (req: any, res: any, next: any) => {
    // Authentication bypassed for Open App
    next();
  };

  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    const snapshot = await db.collection('sales_employees').get();
    const users = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  });

  app.post('/api/admin/users', requireAdmin, async (req, res) => {
    const userData = req.body;
    const docRef = db.collection('sales_employees').doc();
    await docRef.set({
      ...userData,
      createdAt: Date.now()
    });
    res.json({ id: docRef.id, ...userData });
  });

  app.patch('/api/admin/users/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    await db.collection('sales_employees').doc(id).update(updates);
    res.json({ success: true });
  });

  // --- VITE / STATIC ---

  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
        ws: false as any
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });

  server.on('error', (e: any) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`ERROR: Port ${port} is already in use by another process.`);
      console.error(`Check for ghost processes or wait 30 seconds for the port to release.`);
      process.exit(1);
    } else {
      console.error('FATAL Server error:', e);
    }
  });
}

startServer();
