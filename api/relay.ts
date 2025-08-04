import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import config from './config.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract endpoint from URL
  const endpointConfig = config.endpoints.find(e => e.path === req.url);
  
  if (!endpointConfig) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }

  // Verify API key
  const clientKey = req.headers['x-api-key'];
  if (clientKey !== config.auth.gptApiKey) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // Only allow configured method
  if (req.method !== endpointConfig.method) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ngrokUrl = process.env.NGROK_URL || config.ngrokUrl;
    const targetUrl = `${ngrokUrl}${endpointConfig.targetPath}`;
    
    const response = await fetch(targetUrl, {
      method: endpointConfig.method,
      headers: {
        'X-API-Key': config.auth.targetApiKey,
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