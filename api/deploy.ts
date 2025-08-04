import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const GPT_API_KEY = process.env.GPT_API_KEY;
if (!GPT_API_KEY) throw new Error('GPT_API_KEY environment variable is required');
const TARGET_API_KEY = process.env.TARGET_API_KEY;
if (!TARGET_API_KEY) throw new Error('TARGET_API_KEY environment variable is required');
const NGROK_URL = process.env.NGROK_URL;
if (!NGROK_URL) throw new Error('NGROK_URL environment variable is required');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify API key (supports combined auth token)
  const authToken = req.headers['x-auth-token'] as string;
  const clientKey = req.headers['x-api-key'] as string;
  
  let authorized = false;
  if (authToken && authToken.includes('|')) {
    // Combined auth token format
    const [apiKey] = authToken.split('|', 2);
    authorized = (apiKey === GPT_API_KEY);
  } else {
    // Standard API key
    authorized = (clientKey === GPT_API_KEY);
  }
  
  if (!authorized) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const targetUrl = `${NGROK_URL}/api/v1/deploy`;
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(req),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
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