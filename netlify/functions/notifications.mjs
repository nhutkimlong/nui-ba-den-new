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

  const store = getStore('climb-notifications');
  
  try {
    switch (method) {
      case 'GET':
        // Get all active notifications
        const notifications = await store.get('active', { type: 'json' });
        return Response.json(notifications || [], { headers });

      case 'POST':
        // Create new notification
        const newNotification = await request.json();
        const existingNotifications = await store.get('active', { type: 'json' }) || [];
        
        newNotification.id = Date.now().toString();
        newNotification.createdAt = new Date().toISOString();
        newNotification.active = true;
        
        existingNotifications.push(newNotification);
        await store.setJSON('active', existingNotifications);
        
        return Response.json(newNotification, { status: 201, headers });

      case 'PUT':
        // Update notification
        const { id, ...updateData } = await request.json();
        const currentNotifications = await store.get('active', { type: 'json' }) || [];
        
        const index = currentNotifications.findIndex(n => n.id === id);
        if (index !== -1) {
          currentNotifications[index] = { ...currentNotifications[index], ...updateData };
          await store.setJSON('active', currentNotifications);
          return Response.json(currentNotifications[index], { headers });
        }
        
        return new Response('Notification not found', { status: 404, headers });

      case 'DELETE':
        // Delete notification
        const { id: deleteId } = await request.json();
        const deleteNotifications = await store.get('active', { type: 'json' }) || [];
        
        const filteredNotifications = deleteNotifications.filter(n => n.id !== deleteId);
        await store.setJSON('active', filteredNotifications);
        
        return Response.json({ message: 'Notification deleted' }, { headers });

      default:
        return new Response('Method not allowed', { status: 405, headers });
    }
  } catch (error) {
    console.error('Error in notifications function:', error);
    return new Response('Internal server error', { status: 500, headers });
  }
};
