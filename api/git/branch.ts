import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const GPT_API_KEY = process.env.GPT_API_KEY || 'gpt-client-123';
const TARGET_API_KEY = process.env.TARGET_API_KEY || 'test-key-12345';
const NGROK_URL = process.env.NGROK_URL || 'https://3fd457d59f31.ngrok-free.app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow GET and POST requests
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify API key
  const clientKey = req.headers['x-api-key'];
  if (clientKey !== GPT_API_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const targetUrl = `${NGROK_URL}/api/v1/git/branch`;
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'X-API-Key': TARGET_API_KEY,
        'Content-Type': 'application/json',
      },
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
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