import { getStore } from '@netlify/blobs';

// Initialize store for GPS settings
const gpsSettingsStore = getStore('climb-gps-settings');

export default async (request, context) => {
  const { method } = request;
  
  // Add CORS headers for preflight requests
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }
  
  try {
    switch (method) {
      case 'GET':
        // Get current GPS settings
        const settings = await gpsSettingsStore.get('current');
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify(settings ? JSON.parse(settings) : {
            registrationRadius: 50,
            certificateRadius: 150,
            requireGpsRegistration: true,
            requireGpsCertificate: true
          })
        };

      case 'POST':
        // Update GPS settings
        const newSettings = await request.json();
        await gpsSettingsStore.set('current', JSON.stringify(newSettings));
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify(newSettings)
        };

      default:
        return {
          statusCode: 405,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Error in GPS settings function:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
