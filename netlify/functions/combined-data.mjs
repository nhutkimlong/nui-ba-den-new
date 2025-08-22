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

  const notificationsStore = getStore('climb-notifications');
  const gpsStore = getStore('climb-gps-settings');
  
  try {
    if (method === 'GET') {
      // Get both notifications and GPS settings
      const [notifications, notificationsLastModified] = await Promise.all([
        notificationsStore.get('active', { type: 'json' }),
        notificationsStore.get('lastModified', { type: 'json' })
      ]);
      
      const [gpsSettings, gpsLastModified] = await Promise.all([
        gpsStore.get('current', { type: 'json' }),
        gpsStore.get('lastModified', { type: 'json' })
      ]);
      
      const defaultGpsSettings = {
        registrationRadius: 50,
        certificateRadius: 150,
        requireGpsRegistration: true,
        requireGpsCertificate: true,
        registrationTimeEnabled: false,
        registrationStartTime: '06:00',
        registrationEndTime: '18:00'
      };
      
      const result = {
        notifications: {
          data: notifications || [],
          lastModified: notificationsLastModified || Date.now()
        },
        gpsSettings: {
          data: gpsSettings || defaultGpsSettings,
          lastModified: gpsLastModified || Date.now()
        }
      };
      
      return Response.json(result, { headers });
    }

    if (method === 'POST') {
      const body = await request.json();
      const { action, data } = body;

      switch (action) {
        case 'createNotification':
          // Create new notification
          const newNotification = data;
          const existingNotifications = await notificationsStore.get('active', { type: 'json' }) || [];
          
          newNotification.id = Date.now().toString();
          newNotification.createdAt = new Date().toISOString();
          newNotification.active = true;
          
          existingNotifications.push(newNotification);
          await notificationsStore.setJSON('active', existingNotifications);
          await notificationsStore.setJSON('lastModified', Date.now());
          
          return Response.json(newNotification, { status: 201, headers });

        case 'updateNotification':
          // Update notification
          const { id, ...updateData } = data;
          const currentNotifications = await notificationsStore.get('active', { type: 'json' }) || [];
          
          const index = currentNotifications.findIndex(n => n.id === id);
          if (index !== -1) {
            currentNotifications[index] = { ...currentNotifications[index], ...updateData };
            await notificationsStore.setJSON('active', currentNotifications);
            await notificationsStore.setJSON('lastModified', Date.now());
            return Response.json(currentNotifications[index], { headers });
          }
          return new Response('Notification not found', { status: 404, headers });

        case 'deleteNotification':
          // Delete notification
          const { id: deleteId } = data;
          const deleteNotifications = await notificationsStore.get('active', { type: 'json' }) || [];
          
          const filteredNotifications = deleteNotifications.filter(n => n.id !== deleteId);
          await notificationsStore.setJSON('active', filteredNotifications);
          await notificationsStore.setJSON('lastModified', Date.now());
          
          return Response.json({ message: 'Notification deleted' }, { headers });

        case 'updateGpsSettings':
          // Update GPS settings
          await gpsStore.setJSON('current', data);
          await gpsStore.setJSON('lastModified', Date.now());
          return Response.json(data, { headers });

        default:
          return new Response('Invalid action', { status: 400, headers });
      }
    }

    return new Response('Method not allowed', { status: 405, headers });
  } catch (error) {
    console.error('Error in combined-data function:', error);
    return new Response('Internal server error', { status: 500, headers });
  }
};
