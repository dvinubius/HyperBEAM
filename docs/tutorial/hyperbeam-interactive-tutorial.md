# HyperBEAM Interactive Tutorial

Welcome to HyperBEAM! This tutorial is designed for developers with web2/web3 experience who want to understand and use HyperBEAM effectively for building applications.

## Table of Contents

1. [Prerequisites & Setup](#prerequisites--setup)
2. [Understanding HyperBEAM](#understanding-hyperbeam)
3. [Your First HyperPATH](#your-first-hyperpath)
4. [Working with Processes](#working-with-processes)
5. [The Patch Device in Detail](#the-patch-device-in-detail)
6. [Sending Messages to Processes](#sending-messages-to-processes)
7. [Building a Web Interface](#building-a-web-interface)
8. [Advanced Patterns](#advanced-patterns)
9. [Production Considerations](#production-considerations)

---

## Prerequisites & Setup

### What You'll Need

- A running HyperBEAM node (local or remote)
- An AO process ID that you've used with the `patch` device
- Basic understanding of HTTP and REST APIs
- `curl` or your favorite HTTP client

### Quick Node Check

First, let's verify you can connect to a HyperBEAM node:

```bash
# Try your local node first
curl http://localhost:10000/~meta@1.0/info

# Or use a public node
curl https://router-1.forward.computer/~meta@1.0/info
```

**What you should see:** JSON response with node information including supported devices.

---

## Understanding HyperBEAM

### Core Concepts

HyperBEAM is fundamentally about **messages** and **devices**. Think of it as:

- **Messages**: JSON-like data structures that can contain functions and data
- **Devices**: Computational engines that process messages (like microservices)
- **HyperPATHs**: URLs that represent computation chains

### The HyperPATH Pattern

Every HyperBEAM URL follows this pattern:
```
/<messageId>~<device>@<version>/<function>/<subpath>
```

Since you've used the patch device, you're already familiar with this pattern:
```
/<processId>~process@1.0/compute/cache/<dataKey>
```

Let's break this down:
- `<processId>`: The AO process you're working with
- `~process@1.0`: The process device that manages stateful execution
- `compute`: A function that retrieves computed state
- `cache`: Data exposed by your patch device
- `<dataKey>`: Specific data you patched

---

## Your First HyperPATH

### Exercise 1: Exploring a Simple Message

Let's start with the simplest device - `~message@1.0`:

```bash
# Create and query a simple message
curl 'http://localhost:10000/~message@1.0?greeting=Hello&count+integer=42/greeting'
```

**Expected Result:** `"Hello"`

**What happened:**
1. Created a message with `greeting` and `count` fields
2. The `+integer` cast the `count` to a number
3. Retrieved the `greeting` value

### Exercise 2: Type Casting

```bash
# Experiment with different types
curl 'http://localhost:10000/~message@1.0?items+list=apple,banana,42&config+map=key1=value1;key2=true/items/1'
```

**Expected Result:** `"banana"`

Try these variations:
- `/items/2` → `42`
- `/config/key1` → `"value1"`
- `/config/key2` → `true`

---

## Working with Processes

### Understanding Process State

Since you're already syncing process state from legacynet, you understand that processes have:
- **State**: The current data/variables
- **Schedule**: Ordered messages to process
- **Compute**: Cached computation results

### Exercise 3: Reading Process State

Replace `YOUR_PROCESS_ID` with your actual process ID:

```bash
# Get the full current state
curl http://localhost:10000/YOUR_PROCESS_ID~process@1.0/now

# Get cached/computed state (faster)
curl http://localhost:10000/YOUR_PROCESS_ID~process@1.0/compute

# Check the schedule
curl http://localhost:10000/YOUR_PROCESS_ID~process@1.0/schedule
```

### Exercise 4: Navigating Process Data

If your process has patched data under `/cache`, try:

```bash
# List all cached data
curl http://localhost:10000/YOUR_PROCESS_ID~process@1.0/compute/cache

# Get specific cached values
curl http://localhost:10000/YOUR_PROCESS_ID~process@1.0/compute/cache/balances
curl http://localhost:10000/YOUR_PROCESS_ID~process@1.0/compute/cache/totalsupply
```

---

## The Patch Device in Detail

You mentioned using the patch device for syncing state. Let's explore its full capabilities.

### How Patch Works

The patch device moves data from one location to another within a message. It operates in two modes:

1. **`patches` mode** (default): Moves messages with `method: PATCH` or `device: patch@1.0`
2. **`all` mode**: Moves all data from source to destination

### Exercise 5: Understanding Your Current Setup

Your current setup likely looks like this in your AO process:

```lua
-- In your Lua process
Send({ 
    Target = ao.id, 
    device = 'patch@1.0', 
    cache = { 
        balances = Balances,
        totalsupply = TotalSupply,
        -- other data...
    } 
})
```

This creates outbound messages that the patch device processes, making the data available at:
```
/YOUR_PROCESS_ID~process@1.0/compute/cache/balances
```

### Exercise 6: Advanced Patching Patterns

Try creating more structured patch data in your process:

```lua
-- Example: Exposing different data categories
Send({ 
    Target = ao.id, 
    device = 'patch@1.0', 
    cache = { 
        -- User data
        users = {
            [msg.From] = UserProfile
        },
        -- Analytics
        stats = {
            totalTransactions = Stats.transactions,
            activeUsers = Stats.users,
            lastUpdate = os.time()
        },
        -- Configuration
        config = {
            version = "1.0",
            features = {"transfers", "staking"}
        }
    } 
})
```

Then access with:
```bash
curl http://localhost:10000/YOUR_PROCESS_ID~process@1.0/compute/cache/stats/totalTransactions
curl http://localhost:10000/YOUR_PROCESS_ID~process@1.0/compute/cache/config/version
```

---

## Sending Messages to Processes

Now let's move beyond reading to actually sending messages to your HyperBEAM process.

### Exercise 7: Your First Message Send

```bash
# Send a simple message to your process
curl -X POST http://localhost:10000/YOUR_PROCESS_ID~process@1.0/schedule \
  -H "Content-Type: application/json" \
  -H "Action: Info" \
  -H "From: YOUR_WALLET_ADDRESS" \
  -d '{"test": "message from HyperBEAM"}'
```

**What happens:**
1. Message gets added to the process schedule
2. Process executes the message
3. Any handlers in your process respond to the `Action: Info`

### Exercise 8: Sending Structured Data

```bash
# Send a transfer message (if your process supports it)
curl -X POST http://localhost:10000/YOUR_PROCESS_ID~process@1.0/schedule \
  -H "Content-Type: application/json" \
  -H "Action: Transfer" \
  -H "From: YOUR_WALLET_ADDRESS" \
  -H "Recipient: TARGET_ADDRESS" \
  -H "Quantity: 100" \
  -d '{}'
```

### Exercise 9: Query After Send

After sending messages, check the updated state:

```bash
# Check if your patch data updated
curl http://localhost:10000/YOUR_PROCESS_ID~process@1.0/now/cache/balances

# Check the latest schedule slot
curl http://localhost:10000/YOUR_PROCESS_ID~process@1.0/slot
```

---

## Building a Web Interface

Let's create a simple web interface to interact with your HyperBEAM process.

### Exercise 10: Simple HTML Interface

Create `hyperbeam-demo.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>HyperBEAM Process Interface</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        button { padding: 10px 15px; margin: 5px; cursor: pointer; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto; }
        input, select { padding: 8px; margin: 5px; border: 1px solid #ddd; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>HyperBEAM Process Interface</h1>
    
    <div class="section">
        <h3>Configuration</h3>
        <label>Node URL: <input type="text" id="nodeUrl" value="http://localhost:10000"></label><br>
        <label>Process ID: <input type="text" id="processId" placeholder="Your process ID"></label><br>
        <button onclick="saveConfig()">Save Config</button>
    </div>

    <div class="section">
        <h3>Read Process State</h3>
        <button onclick="getState('now')">Get Current State (/now)</button>
        <button onclick="getState('compute')">Get Cached State (/compute)</button>
        <button onclick="getState('schedule')">Get Schedule</button>
        <button onclick="getState('compute/cache')">Get Patch Cache</button>
        <pre id="stateOutput">State will appear here...</pre>
    </div>

    <div class="section">
        <h3>Send Message</h3>
        <label>Action: <input type="text" id="action" value="Info"></label><br>
        <label>Data: <textarea id="messageData" rows="3" cols="50">{"test": "message from web interface"}</textarea></label><br>
        <button onclick="sendMessage()">Send Message</button>
        <pre id="sendOutput">Send results will appear here...</pre>
    </div>

    <div class="section">
        <h3>Quick Data Access</h3>
        <label>Path: <input type="text" id="quickPath" placeholder="e.g., cache/balances" value="cache"></label>
        <button onclick="quickAccess()">Get Data</button>
        <pre id="quickOutput">Quick access results...</pre>
    </div>

    <script>
        let config = {
            nodeUrl: 'http://localhost:10000',
            processId: ''
        };

        function saveConfig() {
            config.nodeUrl = document.getElementById('nodeUrl').value;
            config.processId = document.getElementById('processId').value;
            console.log('Config saved:', config);
        }

        async function getState(endpoint) {
            if (!config.processId) {
                alert('Please set your Process ID first');
                return;
            }

            try {
                const url = `${config.nodeUrl}/${config.processId}~process@1.0/${endpoint}`;
                console.log('Fetching:', url);
                
                const response = await fetch(url);
                const data = await response.text();
                
                document.getElementById('stateOutput').textContent = data;
            } catch (error) {
                document.getElementById('stateOutput').textContent = `Error: ${error.message}`;
            }
        }

        async function sendMessage() {
            if (!config.processId) {
                alert('Please set your Process ID first');
                return;
            }

            try {
                const action = document.getElementById('action').value;
                const messageData = document.getElementById('messageData').value;
                
                const url = `${config.nodeUrl}/${config.processId}~process@1.0/schedule`;
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Action': action
                    },
                    body: messageData
                });
                
                const result = await response.text();
                document.getElementById('sendOutput').textContent = result;
            } catch (error) {
                document.getElementById('sendOutput').textContent = `Error: ${error.message}`;
            }
        }

        async function quickAccess() {
            if (!config.processId) {
                alert('Please set your Process ID first');
                return;
            }

            try {
                const path = document.getElementById('quickPath').value;
                const url = `${config.nodeUrl}/${config.processId}~process@1.0/compute/${path}`;
                
                const response = await fetch(url);
                const data = await response.text();
                
                document.getElementById('quickOutput').textContent = data;
            } catch (error) {
                document.getElementById('quickOutput').textContent = `Error: ${error.message}`;
            }
        }

        // Load saved config on page load
        document.getElementById('nodeUrl').value = config.nodeUrl;
    </script>
</body>
</html>
```

### Exercise 11: Test Your Interface

1. Open `hyperbeam-demo.html` in your browser
2. Enter your process ID
3. Try the different buttons to explore your process state
4. Send a test message and watch for state changes

---

## Advanced Patterns

### Exercise 12: Combining Devices

You can chain device operations. For example, relay data from your process to another HTTP endpoint:

```bash
# Relay your process state to another service
curl -X POST 'http://localhost:10000/~relay@1.0/call?method=POST&path=https://your-api.com/webhook' \
  -H "Content-Type: application/json" \
  -d "$(curl -s http://localhost:10000/YOUR_PROCESS_ID~process@1.0/compute/cache)"
```

### Exercise 13: Using Type Casting in Process Messages

When sending messages, you can use HyperBEAM's type casting:

```bash
# Send a message with properly typed data
curl -X POST 'http://localhost:10000/YOUR_PROCESS_ID~process@1.0/schedule?amount+integer=1000&recipients+list=addr1,addr2' \
  -H "Action: BatchTransfer"
```

### Exercise 14: Exploring Other Devices

Try some other built-in devices:

```bash
# Use the JSON device to manipulate data
curl 'http://localhost:10000/~json@1.0?data+map=name=Alice;age=30&transform=name/name'

# Check node metadata
curl 'http://localhost:10000/~meta@1.0/info'
```

---

## Production Considerations

### Security & Signing

For production applications:

1. **Always verify signatures** on critical data
2. **Use HTTPS** for all communications
3. **Implement proper authentication** for write operations

### Performance Optimization

1. **Use `/compute` for frequently accessed data** (it's cached)
2. **Use `/now` only when you need real-time state**
3. **Batch message sends** when possible
4. **Implement client-side caching** for static data

### Error Handling

```javascript
// Example robust error handling
async function safeHyperBEAMCall(url) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.text();
        
        // Verify signature if critical
        // Implementation depends on your security requirements
        
        return JSON.parse(data);
    } catch (error) {
        console.error('HyperBEAM call failed:', error);
        throw error;
    }
}
```

### Scaling Patterns

1. **Multiple nodes**: Use different HyperBEAM nodes for redundancy
2. **Load balancing**: Distribute reads across multiple nodes
3. **Caching layers**: Add Redis/Memcached for frequently accessed data
4. **WebSocket integration**: For real-time updates

---

## Next Steps

### For Application Development

1. **Explore device stacking**: Combine multiple devices for complex workflows
2. **Custom devices**: Consider building custom devices for specific needs
3. **Integration patterns**: Connect HyperBEAM with your existing web2 infrastructure

### For Deep Understanding

1. **Study the source code**: Explore device implementations in `/src/dev_*.erl`
2. **Read the documentation**: Deep dive into specific devices you're using
3. **Join the community**: Contribute to HyperBEAM development

### Immediate Actions

1. Implement the web interface for your current use case
2. Experiment with sending messages to your processes
3. Optimize your patch device usage for better performance
4. Plan your production architecture

---

## Troubleshooting

### Common Issues

**Problem**: `Connection refused`
- **Solution**: Check if your HyperBEAM node is running on the expected port

**Problem**: `Process not found`
- **Solution**: Verify your process ID is correct and synced to the node

**Problem**: `Empty cache results`
- **Solution**: Ensure your process is sending patch messages correctly

**Problem**: `Messages not processing`
- **Solution**: Check the process schedule and execution stack configuration

### Getting Help

- **Documentation**: Check the `/docs` directory in the HyperBEAM repository
- **Community**: Join HyperBEAM community channels
- **Source Code**: The implementation is open source - read the code!

---

## Summary

You've now learned:

✅ How to read and navigate HyperBEAM process state  
✅ How to send messages to processes  
✅ How to use the patch device effectively  
✅ How to build web interfaces with HyperBEAM  
✅ Production considerations and best practices  

HyperBEAM's power lies in its composability - you can combine simple devices to create complex distributed applications. Start small, experiment freely, and gradually build more sophisticated systems as you become comfortable with the patterns.

Happy building! 🚀 