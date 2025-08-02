import fs from 'fs';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./api/config.json', 'utf8'));

const schema = {
  openapi: "3.0.0",
  info: {
    title: "Home Development Server API",
    version: "1.0.0"
  },
  servers: [{
    url: "https://fugly-dev-magic-odnn26h1y-full-uproar-games.vercel.app"
  }],
  paths: {}
};

// Generate paths from config
config.endpoints.forEach(endpoint => {
  schema.paths[endpoint.path] = {
    [endpoint.method.toLowerCase()]: {
      summary: endpoint.description,
      operationId: endpoint.name,
      responses: {
        "200": {
          description: "Success",
          content: {
            "application/json": {
              schema: { type: "object" }
            }
          }
        }
      }
    }
  };
});

// Save schema
fs.writeFileSync('gpt-schema.json', JSON.stringify(schema, null, 2));
console.log('GPT schema generated in gpt-schema.json');
console.log('\nUpdate ngrok URL in config.json when it changes');
console.log('Run this script after adding new endpoints');