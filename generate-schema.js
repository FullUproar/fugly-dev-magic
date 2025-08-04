import fs from 'fs';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./api/config.json', 'utf8'));

const schema = {
  openapi: "3.1.0",
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
  const operation = {
    summary: endpoint.description,
    operationId: endpoint.name,
    responses: {
      "200": {
        description: "Success",
        content: {
          "application/json": {
            schema: { 
              type: "object",
              properties: {}
            }
          }
        }
      }
    }
  };
  
  // Add request body for POST endpoints
  if (endpoint.method === 'POST') {
    if (endpoint.name === 'claudeExecute') {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                prompt: {
                  type: "string",
                  description: "The command or instruction for Claude to execute"
                },
                project: {
                  type: "string",
                  description: "Project name (e.g. 'competitive asteroids', 'full uproar site')"
                },
                working_dir: {
                  type: "string",
                  description: "Optional: Explicit working directory path (overrides project)"
                }
              },
              required: ["prompt"]
            }
          }
        }
      };
    } else if (endpoint.name === 'cliCommand') {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                command: { type: "string", description: "Command to send to CLI" }
              },
              required: ["command"]
            }
          }
        }
      };
    }
  }
  
  schema.paths[endpoint.path] = {
    [endpoint.method.toLowerCase()]: operation
  };
});

// Save schema
fs.writeFileSync('gpt-schema.json', JSON.stringify(schema, null, 2));
console.log('GPT schema generated in gpt-schema.json');
console.log('\nUpdate ngrok URL in config.json when it changes');
console.log('Run this script after adding new endpoints');