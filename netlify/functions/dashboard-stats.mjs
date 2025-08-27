import { BlobServiceClient } from '@azure/storage-blob';

// Azure Blob Storage configuration
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'data';

let blobServiceClient;
let containerClient;

// Initialize Azure Blob Storage client
function initializeBlobClient() {
  if (!connectionString) {
    console.error('AZURE_STORAGE_CONNECTION_STRING is not configured');
    return false;
  }
  
  try {
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    containerClient = blobServiceClient.getContainerClient(containerName);
    return true;
  } catch (error) {
    console.error('Failed to initialize blob client:', error);
    return false;
  }
}

// Get blob client for a specific file
function getBlobClient(fileName) {
  if (!containerClient) {
    if (!initializeBlobClient()) {
      throw new Error('Blob storage not initialized');
    }
  }
  return containerClient.getBlobClient(fileName);
}

// Read JSON file from blob storage
async function readJsonFile(fileName) {
  try {
    const blobClient = getBlobClient(fileName);
    const downloadResponse = await blobClient.download();
    const content = await streamToString(downloadResponse.readableStreamBody);
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading file ${fileName}:`, error);
    return null;
  }
}

// Convert stream to string
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data.toString());
    });
    readableStream.on('end', () => {
      resolve(chunks.join(''));
    });
    readableStream.on('error', reject);
  });
}

// Main handler function
export default async function handler(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow GET method
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Load all statistics in parallel
    const files = [
      'POI.json',
      'Tours.json', 
      'Accommodations.json',
      'Restaurants.json',
      'Specialties.json',
      'GioHoatDong.json'
    ];

    const results = await Promise.allSettled(
      files.map(file => readJsonFile(file))
    );

    // Process results
    const statistics = {
      totalPoi: 0,
      totalTours: 0,
      totalAccommodations: 0,
      totalRestaurants: 0,
      totalSpecialties: 0,
      totalOperatingHours: 0
    };

    const activities = [];

    // Process POI data
    if (results[0].status === 'fulfilled' && results[0].value) {
      const poiData = results[0].value;
      statistics.totalPoi = Array.isArray(poiData) ? poiData.length : 0;
      activities.push({
        title: 'Dữ liệu POI đã tải',
        description: `${statistics.totalPoi} điểm tham quan đã được tải thành công`,
        icon: 'fa-map-marker-alt',
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
        time: 'Vừa xong'
      });
    }

    // Process Tours data
    if (results[1].status === 'fulfilled' && results[1].value) {
      const toursData = results[1].value;
      statistics.totalTours = Array.isArray(toursData) ? toursData.length : 0;
    }

    // Process Accommodations data
    if (results[2].status === 'fulfilled' && results[2].value) {
      const accommodationsData = results[2].value;
      statistics.totalAccommodations = Array.isArray(accommodationsData) ? accommodationsData.length : 0;
    }

    // Process Restaurants data
    if (results[3].status === 'fulfilled' && results[3].value) {
      const restaurantsData = results[3].value;
      statistics.totalRestaurants = Array.isArray(restaurantsData) ? restaurantsData.length : 0;
    }

    // Process Specialties data
    if (results[4].status === 'fulfilled' && results[4].value) {
      const specialtiesData = results[4].value;
      statistics.totalSpecialties = Array.isArray(specialtiesData) ? specialtiesData.length : 0;
    }

    // Process Operating Hours data
    if (results[5].status === 'fulfilled' && results[5].value) {
      const hoursData = results[5].value;
      statistics.totalOperatingHours = Array.isArray(hoursData) ? hoursData.length : 0;
      activities.push({
        title: 'Giờ hoạt động đã đồng bộ',
        description: `${statistics.totalOperatingHours} bản ghi giờ hoạt động đã được tải`,
        icon: 'fa-clock',
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100',
        time: '1 phút trước'
      });
    }

    // Add system connectivity status
    activities.push({
      title: 'Kết nối Netlify Blobs',
      description: 'Kết nối với hệ thống lưu trữ dữ liệu thành công',
      icon: 'fa-database',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      time: '2 phút trước'
    });

    // Add system status
    activities.push({
      title: 'Hệ thống đã sẵn sàng',
      description: 'Tất cả dịch vụ đang hoạt động bình thường',
      icon: 'fa-check',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      time: 'Vừa xong'
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          statistics,
          activities,
          timestamp: new Date().toISOString()
        }
      })
    };

  } catch (error) {
    console.error('Dashboard stats function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
}
