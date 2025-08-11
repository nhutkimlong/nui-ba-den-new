import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  const store = getStore('site-data'); // Tên store blobs, có thể đổi nếu muốn
  const url = new URL(req.url);
  const file = url.searchParams.get('file'); // ví dụ: 'POI.json', 'Tours.json', ...

  if (!file) {
    return new Response('Missing file parameter', { status: 400, headers });
  }

  if (req.method === 'GET') {
    // Lấy dữ liệu JSON
    const data = await store.get(file, { type: 'json' });
    if (!data) return new Response('Not found', { status: 404, headers });
    return Response.json(data, { headers });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    // Ghi dữ liệu JSON
    try {
      const body = await req.json();
      await store.setJSON(file, body);
      return new Response('Saved', { status: 200, headers });
    } catch (e) {
      return new Response('Invalid JSON', { status: 400, headers });
    }
  }

  return new Response('Method not allowed', { status: 405, headers });
};