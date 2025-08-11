// Simple authentication middleware for admin pages
export default async (req, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  // Simple password check (in production, use proper authentication)
  const { password } = await req.json();
  
  // You can change this password
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'nuibaden2025';
  
  if (password === ADMIN_PASSWORD) {
    return Response.json({ 
      success: true, 
      message: 'Authentication successful',
      token: btoa(`admin:${Date.now()}`) // Simple token
    }, { headers });
  } else {
    return Response.json({ 
      success: false, 
      message: 'Invalid password' 
    }, { status: 401, headers });
  }
};
