# Qwen Integration

Detailed developer integration patterns for **Qwen Agent**.

## Installation
Install Qwen-Agent library using pip:
```bash
pip install qwen-agent
```

## Usage
Query Qwen chat models via API or command line tools.

## MCP Protocol Integration

To connect Qwen Agent or Qwen CLI directly to the **Career-Agents MCP Server**, add the following configuration to your Qwen client's MCP configuration (`mcp_config.json`):

```json
{
  "mcpServers": {
    "career-agents": {
      "command": "npx",
      "args": [
        "-y",
        "career-agents",
        "mcp"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

For local workspace development:

```json
{
  "mcpServers": {
    "career-agents": {
      "command": "node",
      "args": [
        "d:/CodeMyFYP-Agents/scripts/cli.js",
        "mcp"
      ]
    }
  }
}
```

## Agent Loading
Export the agent instructions as Prompt Bundle format:
```bash
career-agents run google-interview-coach --export bundle
```

## Prompt Injection
Pass the file content inside the system message when starting the client:
```bash
qwen-agent-chat --system "$(cat exports/google-interview-coach.prompt-bundle.txt)"
```

## Best Practices
- **Model Choice**: Use Qwen-2.5-Coder for coding challenges and Qwen-2.5-72B for system design or mock behavioral exercises.
- **Tokens Management**: Make prompts concise when querying small local models to avoid memory limits.
