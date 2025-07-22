# HyperBEAM Quick Reference

Essential commands and patterns for building applications with HyperBEAM.

## URL Structure

```
/<messageId>~<device>@<version>/<function>/<subpath>?param=value&param+type=value
```

## Core Device Patterns

### Process Device (`~process@1.0`)
```bash
# Get current state (real-time)
GET /<processId>~process@1.0/now

# Get cached state (faster)
GET /<processId>~process@1.0/compute

# Get schedule
GET /<processId>~process@1.0/schedule

# Send message
POST /<processId>~process@1.0/schedule
Headers: Action: <action-name>
Body: {"data": "here"}

# Get specific data
GET /<processId>~process@1.0/compute/<path>
```

### Message Device (`~message@1.0`)
```bash
# Simple message with typed parameters
GET /~message@1.0?name=Alice&age+integer=30&items+list=a,b,c/name

# Access nested data
GET /~message@1.0?config+map=key1=val1;key2=val2/config/key1
```

### Meta Device (`~meta@1.0`)
```bash
# Get node info
GET /~meta@1.0/info

# Update node config
POST /~meta@1.0/info
Headers: Config-Key: config-value
```

### Relay Device (`~relay@1.0`)
```bash
# Call external HTTP endpoint
GET /~relay@1.0/call?method=GET&path=https://api.example.com/data

# Post to external endpoint
POST /~relay@1.0/call?method=POST&path=https://api.example.com/webhook
```

## Patch Device Usage

### In Your AO Process (Lua)
```lua
-- Basic patch
Send({ 
    Target = ao.id, 
    device = 'patch@1.0', 
    cache = { 
        balances = Balances,
        config = Config
    } 
})

-- Structured patch
Send({ 
    Target = ao.id, 
    device = 'patch@1.0', 
    cache = { 
        users = { [msg.From] = UserProfile },
        stats = { total = Stats.total, updated = os.time() },
        metadata = { version = "1.0" }
    } 
})
```

### Accessing Patched Data
```bash
# All cache data
GET /<processId>~process@1.0/compute/cache

# Specific cached value
GET /<processId>~process@1.0/compute/cache/balances
GET /<processId>~process@1.0/compute/cache/stats/total

# Real-time cache (if recently updated)
GET /<processId>~process@1.0/now/cache/balances
```

## Type Casting

| Type | Syntax | Example |
|------|--------|---------|
| Integer | `+integer` | `count+integer=42` |
| List | `+list` | `items+list=a,b,c,42` |
| Map | `+map` | `config+map=key1=val1;key2=val2` |
| Float | `+float` | `price+float=19.99` |
| Binary | (default) | `name=Alice` |

## Common Curl Commands

### Read Operations
```bash
# Check node status
curl http://localhost:10000/~meta@1.0/info

# Get process state
curl http://localhost:10000/PROCESS_ID~process@1.0/now

# Get cached data
curl http://localhost:10000/PROCESS_ID~process@1.0/compute/cache

# Test simple message
curl 'http://localhost:10000/~message@1.0?test=hello&count+integer=5/test'
```

### Write Operations
```bash
# Send message to process
curl -X POST http://localhost:10000/PROCESS_ID~process@1.0/schedule \
  -H "Content-Type: application/json" \
  -H "Action: Transfer" \
  -H "Recipient: TARGET_ADDRESS" \
  -H "Quantity: 100" \
  -d '{"note": "test transfer"}'

# Update node config
curl -X POST http://localhost:10000/~meta@1.0/info \
  -H "Custom-Config: value"
```

## JavaScript Client Patterns

### Basic Setup
```javascript
class HyperBEAMClient {
    constructor(nodeUrl = 'http://localhost:10000') {
        this.nodeUrl = nodeUrl;
    }
    
    async get(path) {
        const response = await fetch(`${this.nodeUrl}${path}`);
        return response.text();
    }
    
    async post(path, data, headers = {}) {
        const response = await fetch(`${this.nodeUrl}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify(data)
        });
        return response.text();
    }
}
```

### Process Interactions
```javascript
const client = new HyperBEAMClient();
const processId = 'YOUR_PROCESS_ID';

// Read state
const state = await client.get(`/${processId}~process@1.0/now`);
const cache = await client.get(`/${processId}~process@1.0/compute/cache`);

// Send message
const result = await client.post(
    `/${processId}~process@1.0/schedule`,
    { test: 'data' },
    { 'Action': 'Info' }
);
```

## Error Handling

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request (malformed path/data)
- `404`: Not Found (invalid process/path)
- `500`: Internal Server Error

### Debugging Tips
```bash
# Add debug headers
curl -v http://localhost:10000/path

# Check node logs
# (depends on your HyperBEAM setup)

# Verify process exists
curl http://localhost:10000/PROCESS_ID~process@1.0/schedule
```

## Performance Tips

### Use Appropriate Endpoints
```bash
# Fast (cached): Use for frequent reads
GET /<processId>~process@1.0/compute

# Slow (real-time): Use when you need latest state
GET /<processId>~process@1.0/now
```

### Batch Operations
```javascript
// Get multiple data points in parallel
const [state, cache, schedule] = await Promise.all([
    client.get(`/${processId}~process@1.0/compute`),
    client.get(`/${processId}~process@1.0/compute/cache`),
    client.get(`/${processId}~process@1.0/schedule`)
]);
```

## Security Considerations

### Production Checklist
- [ ] Use HTTPS for all requests
- [ ] Verify response signatures for critical data
- [ ] Implement proper authentication for write operations
- [ ] Rate limit client requests
- [ ] Validate all user inputs
- [ ] Use environment variables for sensitive config

### Signature Verification (Conceptual)
```javascript
// Placeholder - implement based on your security requirements
function verifyResponse(response, signature, publicKey) {
    // Check response signature against known node key
    // Return true if valid, false otherwise
}
```

## Environment Variables

```bash
# Common configuration
export HYPERBEAM_NODE_URL="http://localhost:10000"
export PROCESS_ID="your-process-id-here"
export WALLET_ADDRESS="your-wallet-address"

# Use in scripts
curl $HYPERBEAM_NODE_URL/$PROCESS_ID~process@1.0/now
```

## Useful Aliases

```bash
# Add to your .bashrc or .zshrc
alias hb-info='curl $HYPERBEAM_NODE_URL/~meta@1.0/info'
alias hb-state='curl $HYPERBEAM_NODE_URL/$PROCESS_ID~process@1.0/compute'
alias hb-cache='curl $HYPERBEAM_NODE_URL/$PROCESS_ID~process@1.0/compute/cache'

# Usage
hb-info
hb-state
hb-cache
```

## Troubleshooting

### Connection Issues
```bash
# Test basic connectivity
curl -I http://localhost:10000/~meta@1.0/info

# Check if node is running
netstat -an | grep 10000
```

### Process Issues
```bash
# Verify process exists
curl http://localhost:10000/PROCESS_ID~process@1.0/schedule

# Check if process has cache
curl http://localhost:10000/PROCESS_ID~process@1.0/compute/cache
```

### Common Fixes
- **"Connection refused"**: Check if HyperBEAM node is running
- **"404 Not Found"**: Verify process ID is correct
- **"Empty response"**: Check if process has patched any data
- **"Timeout"**: Process might be computing; try `/compute` instead of `/now`

## Next Steps

1. **Explore Devices**: Try other devices like `~json@1.0`, `~relay@1.0`
2. **Build Applications**: Create web interfaces using the patterns above
3. **Custom Devices**: Learn to build your own devices for specific needs
4. **Production Deploy**: Set up proper monitoring, security, and scaling

---

*For complete examples and detailed explanations, see the [HyperBEAM Interactive Tutorial](hyperbeam-interactive-tutorial.md)* 