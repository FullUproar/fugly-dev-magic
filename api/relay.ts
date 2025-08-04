import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import config from './config.json';

// Get API keys from environment
const GPT_API_KEY = process.env.GPT_API_KEY;
const TARGET_API_KEY = process.env.TARGET_API_KEY;
const NGROK_URL = process.env.NGROK_URL;

if (!GPT_API_KEY || !TARGET_API_KEY || !NGROK_URL) {
  throw new Error('Required environment variables are not set');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract endpoint from URL
  const endpointConfig = config.endpoints.find(e => e.path === req.url);
  
  if (!endpointConfig) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }

  // Verify API key
  const clientKey = req.headers['x-api-key'];
  if (clientKey !== GPT_API_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // Only allow configured method
  if (req.method !== endpointConfig.method) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const targetUrl = `${NGROK_URL}${endpointConfig.targetPath}`;
    
    const response = await fetch(targetUrl, {
      method: endpointConfig.method,
      headers: {
        'X-API-Key': TARGET_API_KEY,
        'Content-Type': 'application/json',
      },
      body: req.body ? JSON.stringify(req.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Error calling target API:', err);
    return res.status(500).json({ 
      error: 'Failed to reach development server', 
      details: err.message 
    });
  }
}