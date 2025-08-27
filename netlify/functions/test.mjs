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

  try {
    if (method === 'GET') {
      const result = {
        message: 'Test function is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        netlifyContext: {
          site: context.site?.name,
          deployId: context.deploy?.id,
          functionName: context.function?.name
        }
      };
      
      return Response.json(result, { headers });
    }

    return new Response('Method not allowed', { status: 405, headers });
  } catch (error) {
    console.error('Error in test function:', error);
    return new Response('Internal server error', { status: 500, headers });
  }
};
