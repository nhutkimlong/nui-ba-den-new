import { getStore } from '@netlify/blobs';

export default async (request, context) => {
  const { method } = request;
  
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight requests
  if (method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  const store = getStore('climb-gps-settings');
  
  try {
    switch (method) {
      case 'GET':
        // Get current GPS settings
        const settings = await store.get('current', { type: 'json' });
        const defaultSettings = {
          registrationRadius: 50,
          certificateRadius: 150,
          requireGpsRegistration: true,
          requireGpsCertificate: true
        };
        return Response.json(settings || defaultSettings, { headers });

      case 'POST':
        // Update GPS settings
        const newSettings = await request.json();
        await store.setJSON('current', newSettings);
        return Response.json(newSettings, { headers });

      default:
        return new Response('Method not allowed', { status: 405, headers });
    }
  } catch (error) {
    console.error('Error in GPS settings function:', error);
    return new Response('Internal server error', { status: 500, headers });
  }
};
