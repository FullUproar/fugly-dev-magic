import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const GPT_API_KEY = 'gpt-client-123'; // key required by GPT to access this relay
const TARGET_API_KEY = 'test-key-12345'; // key used to access the real server
const TARGET_URL = 'https://8ecb003d0c10.ngrok-free.app/api/v1/heartbeat';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify API key
  const clientKey = req.headers['x-api-key'];
  if (clientKey !== GPT_API_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const response = await fetch(TARGET_URL, {
      headers: {
        'X-API-Key': TARGET_API_KEY,
      },
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