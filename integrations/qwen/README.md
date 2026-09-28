# Qwen Integration

Detailed developer integration patterns for **Qwen Agent**.

## Installation
Install Qwen-Agent library using pip:
```bash
pip install qwen-agent
```

## Usage
Query Qwen chat models via API or command line tools.

## MCP Protocol Integration (Qwen Desktop App for Laptop)

Since the Qwen Desktop App GUI strictly requires the `npx` or `uvx` command input method, configure the MCP server in Qwen Desktop App using `npx`:

### Qwen App Configuration
- **Command:** `npx`
- **Parameters:** `-y` `career-agents` `mcp`
- **Environment Variables:** `NODE_ENV=production`

### `mcp_config.json` Format
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

> **Tip to prevent timeout:** If Qwen Desktop shows `McpError -32001: Request timed out` on the first launch, run `npx -y career-agents mcp` once in your terminal to warm up your laptop's local `npx` package cache so Qwen connects instantly (< 100ms).

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
