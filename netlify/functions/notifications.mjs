import { getStore } from '@netlify/blobs';

// Initialize store for notifications
const notificationsStore = getStore('climb-notifications');

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
        // Get all active notifications
        const notifications = await notificationsStore.get('active');
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify(notifications ? JSON.parse(notifications) : [])
        };

      case 'POST':
        // Create new notification
        const newNotification = await request.json();
        const existingNotifications = await notificationsStore.get('active');
        let notificationsList = existingNotifications ? JSON.parse(existingNotifications) : [];
        
        newNotification.id = Date.now().toString();
        newNotification.createdAt = new Date().toISOString();
        newNotification.active = true;
        
        notificationsList.push(newNotification);
        await notificationsStore.set('active', JSON.stringify(notificationsList));
        
        return {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify(newNotification)
        };

      case 'PUT':
        // Update notification
        const { id, ...updateData } = await request.json();
        const currentNotifications = await notificationsStore.get('active');
        let updatedList = currentNotifications ? JSON.parse(currentNotifications) : [];
        
        const index = updatedList.findIndex(n => n.id === id);
        if (index !== -1) {
          updatedList[index] = { ...updatedList[index], ...updateData };
          await notificationsStore.set('active', JSON.stringify(updatedList));
        }
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify(updatedList[index])
        };

      case 'DELETE':
        // Delete notification
        const { id: deleteId } = await request.json();
        const deleteNotifications = await notificationsStore.get('active');
        let deleteList = deleteNotifications ? JSON.parse(deleteNotifications) : [];
        
        deleteList = deleteList.filter(n => n.id !== deleteId);
        await notificationsStore.set('active', JSON.stringify(deleteList));
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify({ message: 'Notification deleted' })
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
    console.error('Error in notifications function:', error);
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
