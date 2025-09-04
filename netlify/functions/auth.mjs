import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getStore } from '@netlify/blobs';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// JWT secret key - should be set in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // default: password

// Generate JWT token
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Hash password
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Compare password with hash
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Main handler function
export default async function handler(requestOrEvent, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Normalize method and headers across runtime shapes
  const method = requestOrEvent?.httpMethod || requestOrEvent?.method || (requestOrEvent?.request && requestOrEvent.request.method);
  const reqHeaders = requestOrEvent?.headers || requestOrEvent?.request?.headers || {};

  // Handle preflight requests
  if (method === 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers
    });
  }

  try {
    console.log('Auth function called with method:', method);
    // Only allow POST method
    if (method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers
      });
    }

    // Parse request body (robust across local/prod)
    let body;
    try {
      if (requestOrEvent?.body !== undefined) {
        const raw = requestOrEvent.body;
        if (typeof raw === 'string') {
          try {
            body = JSON.parse(raw);
          } catch (e) {
            // Try base64 decoding if body is encoded
            const isB64 = requestOrEvent.isBase64Encoded;
            if (isB64) {
              const decoded = Buffer.from(raw, 'base64').toString('utf-8');
              body = JSON.parse(decoded);
            } else {
              throw e;
            }
          }
        } else if (typeof raw === 'object' && raw !== null) {
          // In Netlify local dev, body can be a ReadableStream
          if (typeof requestOrEvent.json === 'function') {
            body = await requestOrEvent.json();
          }
        }
      }

      if (!body && typeof requestOrEvent?.json === 'function') {
        body = await requestOrEvent.json();
      }
      if (!body && requestOrEvent?.request && typeof requestOrEvent.request.json === 'function') {
        body = await requestOrEvent.request.json();
      }

      if (!body) throw new Error('No body');
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers
      });
    }

    const { action, email, password, name, currentPassword, newPassword } = body;

    // Helper: get users store (Netlify Blobs) or fallback to in-memory
    async function getUsersStore() {
      try {
        return getStore('users');
      } catch (err) {
        console.warn('Netlify Blobs not available for users store');
        return null;
      }
    }

    // Local file fallback helpers (for dev)
    const __FN_DIRNAME = dirname(fileURLToPath(import.meta.url));
    const LOCAL_DATA_DIR = join(__FN_DIRNAME, '_data');
    const LOCAL_USERS_FILE = join(LOCAL_DATA_DIR, 'users.json');

    function readUsersLocal() {
      try {
        if (!existsSync(LOCAL_USERS_FILE)) {
          return { users: [] };
        }
        const buf = readFileSync(LOCAL_USERS_FILE, 'utf-8');
        return JSON.parse(buf || '{"users":[]}');
      } catch (e) {
        console.warn('Failed reading local users.json, using empty');
        return { users: [] };
      }
    }

    function writeUsersLocal(data) {
      try {
        if (!existsSync(LOCAL_DATA_DIR)) {
          mkdirSync(LOCAL_DATA_DIR, { recursive: true });
        }
        writeFileSync(LOCAL_USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
        return true;
      } catch (e) {
        console.error('Failed writing local users.json:', e);
        throw e;
      }
    }

    async function readUsers() {
      const store = await getUsersStore();
      if (!store) {
        return readUsersLocal();
      }
      const json = await store.get('users.json', { type: 'json' });
      return json || { users: [] };
    }

    async function writeUsers(data) {
      const store = await getUsersStore();
      if (!store) {
        return writeUsersLocal(data);
      }
      await store.set('users.json', JSON.stringify(data, null, 2), { contentType: 'application/json' });
    }

    // Register user
    if (action === 'register') {
      if (!email || !password || !name) {
        return new Response(JSON.stringify({ error: 'Name, email, and password are required' }), { status: 400, headers });
      }

      const db = await readUsers();
      const existing = db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
      if (existing) {
        return new Response(JSON.stringify({ success: false, error: 'Email already registered' }), { status: 409, headers });
      }

      const hash = await hashPassword(password);
      const user = { id: String(Date.now()), name, email, passwordHash: hash, role: 'user', createdAt: Date.now() };
      db.users.push(user);
      await writeUsers(db);

      const token = generateToken({ userId: user.id, email: user.email, role: user.role });
      return new Response(JSON.stringify({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, birthday: user.birthday, cccd: user.cccd, address: user.address, avatar: user.avatar, climbCount: user.climbCount, lastClimbAt: user.lastClimbAt } }), { status: 200, headers });
    }

    // Login (email/password) and fallback admin password
    if (action === 'login' || !action) {
      if (!password) {
        return new Response(JSON.stringify({ error: 'Password is required' }), { status: 400, headers });
      }

      // If email provided, attempt user login via Blobs (and special-case admin)
      if (email) {
        // Special-case admin credentials per rule
        if (String(email).toLowerCase() === 'admin@gmail.com' && password === '123456') {
          const adminUser = {
            id: 'admin',
            name: 'Administrator',
            email: 'admin@gmail.com',
            role: 'admin'
          };
          const token = generateToken({ userId: adminUser.id, email: adminUser.email, role: adminUser.role });
          return new Response(JSON.stringify({ success: true, token, user: adminUser }), { status: 200, headers });
        }
        const db = await readUsers();
        const user = db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
        if (!user) {
          return new Response(JSON.stringify({ success: false, error: 'Invalid credentials' }), { status: 401, headers });
        }
        const ok = await comparePassword(password, user.passwordHash);
        if (!ok) {
          return new Response(JSON.stringify({ success: false, error: 'Invalid credentials' }), { status: 401, headers });
        }
        const token = generateToken({ userId: user.id, email: user.email, role: user.role });
        return new Response(JSON.stringify({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, birthday: user.birthday, cccd: user.cccd, address: user.address, avatar: user.avatar, climbCount: user.climbCount, lastClimbAt: user.lastClimbAt } }), { status: 200, headers });
      }

      // Fallback: admin-only password (no email)
      try {
        const isValidPassword = await comparePassword(password, ADMIN_PASSWORD_HASH);
        if (!isValidPassword) {
          return new Response(JSON.stringify({ success: false, error: 'Invalid credentials' }), { status: 401, headers });
        }
        const token = generateToken({ role: 'admin', timestamp: Date.now() });
        return new Response(JSON.stringify({ success: true, token, user: { id: 'admin', name: 'Administrator', email: 'admin', role: 'admin' } }), { status: 200, headers });
      } catch (error) {
        console.error('Password comparison error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Authentication error' }), { status: 500, headers });
      }
    }

    // Handle verify token action
    if (action === 'verify') {
      const authHeader = reqHeaders.authorization || reqHeaders.Authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'No token provided' 
        }), {
          status: 401,
          headers
        });
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      if (!decoded) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Invalid or expired token' 
        }), {
          status: 401,
          headers
        });
      }

      return new Response(JSON.stringify({
        success: true,
        valid: true,
        role: decoded.role,
        userId: decoded.userId,
        email: decoded.email
      }), {
        status: 200,
        headers
      });
    }

    // Handle change password action
    if (action === 'changePassword') {
      
      if (!currentPassword || !newPassword) {
        return new Response(JSON.stringify({ error: 'Current password and new password are required' }), {
          status: 400,
          headers
        });
      }

      // If email provided, change for user; else treat as admin change
      if (email) {
        const db = await readUsers();
        const user = db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
        if (!user) return new Response(JSON.stringify({ success: false, error: 'User not found' }), { status: 404, headers });
        const ok = await comparePassword(currentPassword, user.passwordHash);
        if (!ok) return new Response(JSON.stringify({ success: false, error: 'Current password is incorrect' }), { status: 401, headers });
        const newHash = await hashPassword(newPassword);
        user.passwordHash = newHash;
        await writeUsers(db);
        return new Response(JSON.stringify({ success: true, message: 'Password changed successfully' }), { status: 200, headers });
      } else {
        const isValidCurrentPassword = await comparePassword(currentPassword, ADMIN_PASSWORD_HASH);
        if (!isValidCurrentPassword) {
          return new Response(JSON.stringify({ success: false, error: 'Current password is incorrect' }), { status: 401, headers });
        }
        // Note: cannot persist admin hash here; return success
        return new Response(JSON.stringify({ success: true, message: 'Password changed successfully' }), { status: 200, headers });
      }
    }

    // Get profile by email
    if (action === 'getProfile') {
      if (!email) {
        return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400, headers });
      }
      const db = await readUsers();
      const user = db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
      if (!user) return new Response(JSON.stringify({ success: false, error: 'User not found' }), { status: 404, headers });
      return new Response(JSON.stringify({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          birthday: user.birthday,
          cccd: user.cccd,
          address: user.address,
          avatar: user.avatar,
          climbCount: user.climbCount,
          lastClimbAt: user.lastClimbAt
        }
      }), { status: 200, headers });
    }

    // Admin: list users
    if (action === 'listUsers') {
      const db = await readUsers();
      const users = db.users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone, birthday: u.birthday, cccd: u.cccd, address: u.address, avatar: u.avatar, climbCount: u.climbCount, lastClimbAt: u.lastClimbAt }));
      return new Response(JSON.stringify({ success: true, users }), { status: 200, headers });
    }

    // Admin: save user (create or update by id)
    if (action === 'saveUser') {
      const { user: bodyUser } = body;
      if (!bodyUser || !bodyUser.email) return new Response(JSON.stringify({ success: false, error: 'User email is required' }), { status: 400, headers });
      const db = await readUsers();
      const idx = db.users.findIndex(u => u.id === bodyUser.id || u.email.toLowerCase() === String(bodyUser.email).toLowerCase());
      if (idx >= 0) {
        db.users[idx] = { ...db.users[idx], ...bodyUser };
      } else {
        db.users.push({ id: String(Date.now()), name: bodyUser.name || '', email: bodyUser.email, role: bodyUser.role || 'user', phone: bodyUser.phone, birthday: bodyUser.birthday, cccd: bodyUser.cccd, address: bodyUser.address, avatar: bodyUser.avatar, climbCount: bodyUser.climbCount || 0, lastClimbAt: bodyUser.lastClimbAt || 0, passwordHash: await hashPassword('123456') });
      }
      await writeUsers(db);
      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    // Admin: delete user by id
    if (action === 'deleteUser') {
      const { id } = body;
      if (!id) return new Response(JSON.stringify({ success: false, error: 'User id is required' }), { status: 400, headers });
      const db = await readUsers();
      const before = db.users.length;
      db.users = db.users.filter(u => u.id !== id);
      if (db.users.length === before) return new Response(JSON.stringify({ success: false, error: 'User not found' }), { status: 404, headers });
      await writeUsers(db);
      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    // Handle update profile action (extend fields)
    if (action === 'updateProfile') {
      if (!email) {
        return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400, headers });
      }
      const db = await readUsers();
      const user = db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
      if (!user) return new Response(JSON.stringify({ success: false, error: 'User not found' }), { status: 404, headers });
      // Allow updating optional fields
      if (typeof name === 'string') user.name = name;
      if (typeof body.phone === 'string') user.phone = body.phone;
      if (typeof body.birthday === 'string') user.birthday = body.birthday;
      if (typeof body.cccd === 'string') user.cccd = body.cccd;
      if (typeof body.address === 'string') user.address = body.address;
      if (typeof body.avatar === 'string') user.avatar = body.avatar;
      if (typeof body.climbCount === 'number') user.climbCount = body.climbCount;
      if (typeof body.lastClimbAt === 'number') user.lastClimbAt = body.lastClimbAt;
      await writeUsers(db);
      return new Response(JSON.stringify({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, birthday: user.birthday, cccd: user.cccd, address: user.address, avatar: user.avatar, climbCount: user.climbCount, lastClimbAt: user.lastClimbAt } }), { status: 200, headers });
    }

    // Unknown action
    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers
    });

  } catch (error) {
    console.error('Auth function error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers
    });
  }
}
