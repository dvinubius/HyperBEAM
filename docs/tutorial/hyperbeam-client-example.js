/**
 * HyperBEAM Client Example
 * 
 * This example demonstrates how to interact with HyperBEAM nodes
 * and AO processes using modern JavaScript/Node.js
 */

class HyperBEAMClient {
    constructor(options = {}) {
        this.nodeUrl = options.nodeUrl || 'http://localhost:10000';
        this.defaultHeaders = options.headers || {};
        this.timeout = options.timeout || 30000;
    }

    /**
     * Make a GET request to a HyperPATH
     */
    async get(path, options = {}) {
        const url = `${this.nodeUrl}${path}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    ...this.defaultHeaders,
                    ...options.headers
                },
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            if (options.debug) {
                console.error(`GET ${url} failed:`, error);
            }
            throw error;
        }
    }

    /**
     * Send a POST request (e.g., to schedule a message)
     */
    async post(path, data = {}, options = {}) {
        const url = `${this.nodeUrl}${path}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.defaultHeaders,
                    ...options.headers
                },
                body: typeof data === 'string' ? data : JSON.stringify(data),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            if (options.debug) {
                console.error(`POST ${url} failed:`, error);
            }
            throw error;
        }
    }

    /**
     * Get node information
     */
    async getNodeInfo() {
        return await this.get('/~meta@1.0/info');
    }

    /**
     * Process-specific methods
     */
    process(processId) {
        return new ProcessClient(this, processId);
    }
}

class ProcessClient {
    constructor(client, processId) {
        this.client = client;
        this.processId = processId;
        this.basePath = `/${processId}~process@1.0`;
    }

    /**
     * Get current process state
     */
    async getCurrentState() {
        return await this.client.get(`${this.basePath}/now`);
    }

    /**
     * Get cached process state (faster)
     */
    async getCachedState() {
        return await this.client.get(`${this.basePath}/compute`);
    }

    /**
     * Get process schedule
     */
    async getSchedule() {
        return await this.client.get(`${this.basePath}/schedule`);
    }

    /**
     * Get data from patch cache
     */
    async getCacheData(key = '') {
        const path = key ? `${this.basePath}/compute/cache/${key}` : `${this.basePath}/compute/cache`;
        return await this.client.get(path);
    }

    /**
     * Send a message to the process
     */
    async sendMessage(action, data = {}, headers = {}) {
        return await this.client.post(`${this.basePath}/schedule`, data, {
            headers: {
                'Action': action,
                ...headers
            }
        });
    }

    /**
     * Get specific data from process state
     */
    async getData(path) {
        return await this.client.get(`${this.basePath}/compute/${path}`);
    }

    /**
     * Wait for process state update (simple polling)
     */
    async waitForStateChange(checkFunction, maxAttempts = 10, interval = 2000) {
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const state = await this.getCurrentState();
                if (checkFunction(state)) {
                    return state;
                }
                await new Promise(resolve => setTimeout(resolve, interval));
            } catch (error) {
                console.warn(`Attempt ${i + 1} failed:`, error.message);
                if (i === maxAttempts - 1) throw error;
            }
        }
        throw new Error(`State change not detected after ${maxAttempts} attempts`);
    }
}

// Example usage and demonstrations
async function examples() {
    // Initialize client
    const client = new HyperBEAMClient({
        nodeUrl: 'http://localhost:10000'  // Change to your node
    });

    try {
        // Check node status
        console.log('=== Node Information ===');
        const nodeInfo = await client.getNodeInfo();
        console.log(nodeInfo);

        // Replace with your actual process ID
        const processId = 'YOUR_PROCESS_ID_HERE';
        const process = client.process(processId);

        // Read process state
        console.log('\n=== Process State ===');
        const currentState = await process.getCurrentState();
        console.log('Current state:', currentState);

        // Check patch cache
        console.log('\n=== Patch Cache ===');
        try {
            const cacheData = await process.getCacheData();
            console.log('Cache data:', cacheData);

            // Get specific cached values
            const balances = await process.getCacheData('balances');
            console.log('Balances:', balances);
        } catch (error) {
            console.log('No cache data available or error:', error.message);
        }

        // Send a message
        console.log('\n=== Sending Message ===');
        const messageResult = await process.sendMessage('Info', {
            test: 'Hello from JavaScript client',
            timestamp: Date.now()
        });
        console.log('Message sent:', messageResult);

        // Wait for state change (example)
        console.log('\n=== Waiting for State Change ===');
        try {
            const updatedState = await process.waitForStateChange(
                (state) => {
                    // Check if some condition is met in the state
                    return state && typeof state === 'object';
                },
                3,  // max attempts
                1000 // 1 second interval
            );
            console.log('State updated:', updatedState);
        } catch (error) {
            console.log('State change timeout or error:', error.message);
        }

    } catch (error) {
        console.error('Example failed:', error);
    }
}

// Utility functions for common patterns
class HyperBEAMUtils {
    /**
     * Create a typed query parameter string
     */
    static createTypedQuery(params) {
        const queryParams = new URLSearchParams();
        
        for (const [key, value] of Object.entries(params)) {
            if (typeof value === 'number') {
                queryParams.append(`${key}+integer`, value.toString());
            } else if (Array.isArray(value)) {
                queryParams.append(`${key}+list`, value.join(','));
            } else if (typeof value === 'object') {
                // Simple map encoding - you might need more sophisticated handling
                const mapString = Object.entries(value)
                    .map(([k, v]) => `${k}=${v}`)
                    .join(';');
                queryParams.append(`${key}+map`, mapString);
            } else {
                queryParams.append(key, value.toString());
            }
        }
        
        return queryParams.toString();
    }

    /**
     * Build a HyperPATH with typed parameters
     */
    static buildPath(device, path = '', params = {}) {
        const query = Object.keys(params).length > 0 
            ? '?' + this.createTypedQuery(params)
            : '';
        
        return `/${device}${query}${path ? '/' + path : ''}`;
    }

    /**
     * Simple signature verification placeholder
     * (You would implement actual signature verification based on your needs)
     */
    static verifySignature(data, signature, publicKey) {
        // Placeholder - implement actual signature verification
        console.warn('Signature verification not implemented');
        return true;
    }
}

// Advanced example: Building a real-time dashboard
class ProcessDashboard {
    constructor(client, processId) {
        this.client = client;
        this.process = client.process(processId);
        this.subscribers = [];
        this.pollingInterval = null;
    }

    /**
     * Subscribe to state changes
     */
    subscribe(callback) {
        this.subscribers.push(callback);
    }

    /**
     * Start polling for changes
     */
    startPolling(interval = 5000) {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }

        this.pollingInterval = setInterval(async () => {
            try {
                const state = await this.process.getCurrentState();
                this.notifySubscribers(state);
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, interval);
    }

    /**
     * Stop polling
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    /**
     * Notify all subscribers of state changes
     */
    notifySubscribers(state) {
        this.subscribers.forEach(callback => {
            try {
                callback(state);
            } catch (error) {
                console.error('Subscriber callback error:', error);
            }
        });
    }

    /**
     * Get dashboard data
     */
    async getDashboardData() {
        try {
            const [currentState, schedule, cacheData] = await Promise.all([
                this.process.getCurrentState(),
                this.process.getSchedule(),
                this.process.getCacheData().catch(() => null)
            ]);

            return {
                state: currentState,
                schedule: schedule,
                cache: cacheData,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Dashboard data fetch error:', error);
            throw error;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HyperBEAMClient, ProcessClient, HyperBEAMUtils, ProcessDashboard };
}

// If running directly, run examples
if (typeof window === 'undefined' && require.main === module) {
    examples().catch(console.error);
} 