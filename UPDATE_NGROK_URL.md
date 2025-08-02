# How to Update ngrok URL

When your ngrok URL changes, update it in `api/ping.ts`:

1. Edit line 6 in `api/ping.ts`
2. Replace the old URL with your new ngrok URL
3. Commit and push:
   ```bash
   git add api/ping.ts
   git commit -m "Update ngrok URL"
   git push
   ```
4. Vercel will auto-deploy in ~30 seconds

Current settings:
- ngrok URL: https://8ecb003d0c10.ngrok-free.app/api/v1/heartbeat
- API Key expected by Python: test-key-12345
- API Key from GPT: gpt-client-123