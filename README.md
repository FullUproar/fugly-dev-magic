# GPT Relay API

This relay allows ChatGPT to communicate with your local development server.

## Quick Start

### When ngrok URL changes:
1. Update `NGROK_URL` in Vercel environment variables
2. OR update `ngrokUrl` in `api/config.json` and push

### To add new endpoints:

#### Option 1: Using config.json
1. Add endpoint to `api/config.json`:
   ```json
   {
     "name": "runCommand",
     "path": "/api/run",
     "method": "POST",
     "targetPath": "/api/v1/execute",
     "description": "Execute a command"
   }
   ```
2. Run `node generate-schema.js` to create GPT schema
3. Update your Custom GPT with the new schema

#### Option 2: Using dynamic proxy
- The `api/[...path].ts` file forwards ALL requests
- Just add endpoints to your Python server
- Update GPT schema manually

## Environment Variables (Vercel Dashboard)
- `NGROK_URL`: Your current ngrok URL
- `GPT_API_KEY`: API key from GPT (default: gpt-client-123)
- `TARGET_API_KEY`: API key for Python server (default: test-key-12345)

## Testing
```bash
# Test any endpoint
curl https://fugly-dev-magic-odnn26h1y-full-uproar-games.vercel.app/api/YOUR_ENDPOINT \
  -H "X-API-Key: gpt-client-123"
```