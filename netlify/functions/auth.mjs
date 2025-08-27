import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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
export default async function handler(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers
    });
  }

  try {
    console.log('Auth function called with method:', event.httpMethod);
    // Only allow POST method
    if (event.httpMethod !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers
      });
    }

    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers
      });
    }

    const { password, action } = body;

    // Handle login action
    if (action === 'login' || !action) {
      if (!password) {
        return new Response(JSON.stringify({ error: 'Password is required' }), {
          status: 400,
          headers
        });
      }

      try {
        // Compare password with stored hash
        const isValidPassword = await comparePassword(password, ADMIN_PASSWORD_HASH);
        
        if (!isValidPassword) {
          return new Response(JSON.stringify({ 
            success: false,
            error: 'Invalid password' 
          }), {
            status: 401,
            headers
          });
        }

        // Generate JWT token
        const token = generateToken({
          role: 'admin',
          timestamp: Date.now()
        });

        return new Response(JSON.stringify({
          success: true,
          token,
          message: 'Login successful'
        }), {
          status: 200,
          headers
        });

      } catch (error) {
        console.error('Password comparison error:', error);
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Authentication error' 
        }), {
          status: 500,
          headers
        });
      }
    }

    // Handle verify token action
    if (action === 'verify') {
      const authHeader = event.headers.authorization || event.headers.Authorization;
      
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
        role: decoded.role
      }), {
        status: 200,
        headers
      });
    }

    // Handle change password action
    if (action === 'changePassword') {
      const { currentPassword, newPassword } = body;
      
      if (!currentPassword || !newPassword) {
        return new Response(JSON.stringify({ error: 'Current password and new password are required' }), {
          status: 400,
          headers
        });
      }

      // Verify current password
      const isValidCurrentPassword = await comparePassword(currentPassword, ADMIN_PASSWORD_HASH);
      
      if (!isValidCurrentPassword) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Current password is incorrect' 
        }), {
          status: 401,
          headers
        });
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);
      
      // In a real application, you would save this hash to a database
      // For now, we'll just return success
      return new Response(JSON.stringify({
        success: true,
        message: 'Password changed successfully',
        newHash: newPasswordHash // In production, don't return this
      }), {
        status: 200,
        headers
      });
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
