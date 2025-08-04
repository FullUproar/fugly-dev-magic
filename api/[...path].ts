import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const GPT_API_KEY = process.env.GPT_API_KEY;
if (!GPT_API_KEY) throw new Error('GPT_API_KEY environment variable is required');
const TARGET_API_KEY = process.env.TARGET_API_KEY;
if (!TARGET_API_KEY) throw new Error('TARGET_API_KEY environment variable is required');
const NGROK_URL = process.env.NGROK_URL;
if (!NGROK_URL) throw new Error('NGROK_URL environment variable is required');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify API key
  const clientKey = req.headers['x-api-key'];
  if (clientKey !== GPT_API_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    // Forward the entire path
    const targetUrl = `${NGROK_URL}${req.url}`;
    
    const response = await fetch(targetUrl, {
      method: req.method || 'GET',
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