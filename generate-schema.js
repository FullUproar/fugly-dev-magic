import fs from 'fs';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./api/config.json', 'utf8'));
const planningConfig = JSON.parse(readFileSync('./api/config-planning.json', 'utf8'));

// Merge endpoints
config.endpoints = [...config.endpoints, ...planningConfig.endpoints];

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
  
  // Add query parameters for GET endpoints
  if (endpoint.method === 'GET') {
    if (endpoint.name === 'getConversations') {
      operation.parameters = [{
        name: "id",
        in: "query",
        description: "Specific conversation ID (returns all recent if not provided)",
        schema: { type: "string" }
      }];
    } else if (endpoint.name === 'getProjectState') {
      operation.parameters = [{
        name: "path",
        in: "query",
        description: "Project path",
        required: true,
        schema: { type: "string" }
      }];
    } else if (endpoint.name === 'getSettings') {
      operation.parameters = [{
        name: "key",
        in: "query",
        description: "Specific setting key (returns common settings if not provided)",
        schema: { type: "string" }
      }];
    }
  }
  
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
    } else if (endpoint.name === 'claudePlan') {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                task: { type: "string", description: "Task or problem to plan" },
                project: { type: "string", description: "Project name" },
                working_dir: { type: "string", description: "Working directory path" },
                conversation_id: { type: "string", description: "Optional: Continue existing conversation" }
              },
              required: ["task"]
            }
          }
        }
      };
    } else if (endpoint.name === 'updateConversation') {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                conversation_id: { type: "string", description: "Conversation ID" },
                message: { type: "string", description: "Message to add" },
                role: { type: "string", enum: ["user", "assistant"], description: "Message role" },
                mode: { type: "string", enum: ["normal", "planning"], description: "Conversation mode" },
                context: { type: "object", description: "Additional context data" }
              },
              required: ["conversation_id"]
            }
          }
        }
      };
    } else if (endpoint.name === 'updateProjectState') {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                path: { type: "string", description: "Project path" },
                last_command: { type: "string", description: "Last executed command" },
                current_branch: { type: "string", description: "Current git branch" },
                working_files: { type: "array", items: { type: "string" }, description: "List of working files" },
                todo_list: { type: "array", items: { type: "string" }, description: "Project todo list" },
                notes: { type: "string", description: "Project notes" }
              },
              required: ["path"]
            }
          }
        }
      };
    } else if (endpoint.name === 'updateSettings') {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                key: { type: "string", description: "Setting key" },
                value: { description: "Setting value (any type)" }
              },
              required: ["key", "value"]
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