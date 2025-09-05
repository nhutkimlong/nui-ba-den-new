import { BlobServiceClient } from '@azure/storage-blob';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Azure Blob Storage configuration
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'data';

let blobServiceClient;
let containerClient;

// ESM-compatible dirname (avoid re-declaring __dirname)
const __FN_DIRNAME = dirname(fileURLToPath(import.meta.url));

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
    throw error;
  }
}

// Write JSON file to blob storage
async function writeJsonFile(fileName, data) {
  try {
    const blobClient = getBlobClient(fileName);
    const jsonString = JSON.stringify(data, null, 2);
    await blobClient.upload(jsonString, jsonString.length, {
      blobHTTPHeaders: {
        blobContentType: 'application/json'
      }
    });
    return true;
  } catch (error) {
    console.error(`Error writing file ${fileName}:`, error);
    throw error;
  }
}

// Fallback: Read JSON file from local filesystem
function readLocalJsonFile(fileName) {
  try {
    // Try different possible paths for data files
    const possiblePaths = [
      // Common locations during netlify dev
      join(process.cwd(), 'data', fileName),
      join(process.cwd(), '..', 'data', fileName),
      // Relative to this function file
      join(__FN_DIRNAME, '..', '..', 'data', fileName),
      join(__FN_DIRNAME, '..', '..', '..', 'data', fileName),
      // Additional fallbacks
      join(process.cwd(), '..', '..', 'data', fileName),
      join(process.cwd(), '..', '..', '..', 'data', fileName),
    ];
    
    console.log('Trying to read file:', fileName);
    console.log('Current working directory:', process.cwd());
    console.log('Possible paths:', possiblePaths);
    
    for (const dataPath of possiblePaths) {
      try {
        console.log('Trying path:', dataPath);
        const content = readFileSync(dataPath, 'utf8');
        console.log('Successfully read file from:', dataPath);
        return JSON.parse(content);
      } catch (pathError) {
        console.log('Failed to read from:', dataPath, pathError.message);
        continue;
      }
    }
    
    // If all paths fail, return empty array as fallback
    console.warn(`File ${fileName} not found, returning empty array`);
    return [];
  } catch (error) {
    console.error(`Error reading local file ${fileName}:`, error);
    return [];
  }
}

// Fallback: Write JSON file to local filesystem
function writeLocalJsonFile(fileName, data) {
  try {
    // Path to local data files (relative to function directory)
    const dataPath = join(process.cwd(), '..', 'data', fileName);
    const jsonString = JSON.stringify(data, null, 2);
    const fs = require('fs');
    fs.writeFileSync(dataPath, jsonString, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing local file ${fileName}:`, error);
    throw error;
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
export default async function handler(request, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  const method = request.method;
  if (method === 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers
    });
  }

  try {
    // Handle different ways query parameters might be passed
    const url = new URL(request.url);
    const file = url.searchParams.get('file');

    console.log('Requested file:', file);

    if (!file) {
      return new Response(JSON.stringify({ 
        error: 'File parameter is required',
        received: { 
          queryStringParameters: event.queryStringParameters,
          query: event.query,
          url: event.url 
        }
      }), {
        status: 400,
        headers
      });
    }

    // Validate file name for security
    const allowedFiles = [
      'POI.json',
      'Tours.json', 
      'Accommodations.json',
      'Restaurants.json',
      'Specialties.json',
      'GioHoatDong.json'
    ];
    
    if (!allowedFiles.includes(file)) {
      return new Response(JSON.stringify({ error: 'Access denied to this file' }), {
        status: 403,
        headers
      });
    }

    // Handle HEAD request - return headers only with caching
    if (method === 'HEAD') {
      try {
        let data;
        if (connectionString) {
          try {
            data = await readJsonFile(file);
          } catch (azureError) {
            console.warn(`Azure Blob Storage failed for ${file}, falling back to local file:`, azureError.message);
            data = readLocalJsonFile(file);
          }
        } else {
          console.log(`Azure not configured, using local file for ${file}`);
          data = readLocalJsonFile(file);
        }

        const body = JSON.stringify(data);
        const etag = 'W/"' + createHash('sha1').update(body).digest('base64') + '"';
        const cacheHeaders = {
          ...headers,
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
          'ETag': etag,
          'Vary': 'Accept-Encoding'
        };

        return new Response('', { status: 200, headers: cacheHeaders });
      } catch (error) {
        return new Response('', { status: 404, headers });
      }
    }

    // Handle GET request - read file
    if (method === 'GET') {
      try {
        let data;
        
        // Try Azure Blob Storage first
        if (connectionString) {
          try {
            data = await readJsonFile(file);
          } catch (azureError) {
            console.warn(`Azure Blob Storage failed for ${file}, falling back to local file:`, azureError.message);
            data = readLocalJsonFile(file);
          }
        } else {
          // Use local files when Azure is not configured
          console.log(`Azure not configured, using local file for ${file}`);
          data = readLocalJsonFile(file);
        }

        // Strong caching with ETag support
        const body = JSON.stringify(data);
        const etag = 'W/"' + createHash('sha1').update(body).digest('base64') + '"';
        const reqETag = request.headers.get('if-none-match');

        const cacheHeaders = {
          ...headers,
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
          'ETag': etag,
          'Vary': 'Accept-Encoding'
        };

        if (reqETag && reqETag === etag) {
          return new Response('', {
            status: 304,
            headers: cacheHeaders
          });
        }

        return new Response(body, {
          status: 200,
          headers: cacheHeaders
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: `File ${file} not found` }), {
          status: 404,
          headers
        });
      }
    }

    // Handle POST request - write file
    if (method === 'POST') {
      try {
        const body = await request.json();
        
        // Try Azure Blob Storage first
        if (connectionString) {
          try {
            await writeJsonFile(file, body);
          } catch (azureError) {
            console.warn(`Azure Blob Storage failed for ${file}, falling back to local file:`, azureError.message);
            writeLocalJsonFile(file, body);
          }
        } else {
          // Use local files when Azure is not configured
          console.log(`Azure not configured, writing to local file for ${file}`);
          writeLocalJsonFile(file, body);
        }
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: `File ${file} updated successfully` 
        }), {
          status: 200,
          headers
        });
      } catch (error) {
        throw error;
      }
    }

    // Handle unsupported methods
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers
    });
  }
}