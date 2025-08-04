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
    } else if (endpoint.name === 'createGithubIssue') {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string", description: "Issue title" },
                body: { type: "string", description: "Issue body/description" },
                labels: { 
                  type: "array", 
                  items: { type: "string" },
                  description: "Optional labels for the issue" 
                }
              },
              required: ["title"]
            }
          }
        }
      };
    } else if (endpoint.name === 'gitStatus' || endpoint.name === 'gitDiff') {
      operation.requestBody = {
        required: false,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                project: { type: "string", description: "Project name to check" },
                working_dir: { type: "string", description: "Working directory path" }
              }
            }
          }
        }
      };
    } else if (endpoint.name === 'gitBranchManage') {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                action: { type: "string", enum: ["create", "switch"], description: "Action to perform" },
                branch: { type: "string", description: "Branch name" },
                project: { type: "string", description: "Project name" },
                working_dir: { type: "string", description: "Working directory path" }
              },
              required: ["action", "branch"]
            }
          }
        }
      };
    } else if (endpoint.name === 'packageInstall') {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                packages: { 
                  type: "array", 
                  items: { type: "string" },
                  description: "Package names to install" 
                },
                manager: { type: "string", enum: ["npm", "pip", "yarn", "auto"], description: "Package manager (auto-detect if not specified)" },
                project: { type: "string", description: "Project name" },
                working_dir: { type: "string", description: "Working directory path" }
              },
              required: ["packages"]
            }
          }
        }
      };
    } else if (endpoint.name === 'runTests') {
      operation.requestBody = {
        required: false,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                command: { type: "string", description: "Custom test command (auto-detected if not provided)" },
                project: { type: "string", description: "Project name" },
                working_dir: { type: "string", description: "Working directory path" }
              }
            }
          }
        }
      };
    } else if (endpoint.name === 'searchFiles') {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                pattern: { type: "string", description: "File name pattern to search for" },
                project: { type: "string", description: "Project name" },
                working_dir: { type: "string", description: "Working directory path" }
              },
              required: ["pattern"]
            }
          }
        }
      };
    } else if (endpoint.name === 'searchCode') {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                pattern: { type: "string", description: "Code pattern to search for" },
                file_pattern: { type: "string", description: "File pattern to search in (e.g., '*.js')" },
                project: { type: "string", description: "Project name" },
                working_dir: { type: "string", description: "Working directory path" }
              },
              required: ["pattern"]
            }
          }
        }
      };
    } else if (endpoint.name === 'deployProject') {
      operation.requestBody = {
        required: false,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                production: { type: "boolean", description: "Deploy to production (default: false)" },
                project: { type: "string", description: "Project name" },
                working_dir: { type: "string", description: "Working directory path" }
              }
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