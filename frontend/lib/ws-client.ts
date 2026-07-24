type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';
type MessageCallback = (payload: any) => void;

class ResilientWebSocketClient {
  private url: string;
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private messageListeners: Map<string, Set<MessageCallback>> = new Map();
  private retryCount = 0;
  private maxRetries = 10;
  private retryTimer: NodeJS.Timeout | null = null;
  private isIntentionalClose = false;

  constructor(url: string) {
    this.url = url;
  }

  public connect() {
    if (this.ws) return;
    this.isIntentionalClose = false;
    this.updateStatus(this.retryCount > 0 ? 'reconnecting' : 'disconnected');
    
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        this.status = 'connected';
        this.updateStatus('connected');
        this.retryCount = 0;
        console.log(`[WS] Connected to ${this.url}`);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { type, payload } = message;
          if (type) {
            this.emitMessage(type, payload);
          }
          // Also emit to wildcard listeners
          this.emitMessage('*', message);
        } catch (err) {
          console.error('[WS] Error parsing message:', err);
        }
      };

      this.ws.onerror = (err) => {
        console.error('[WS] Error in socket connection:', err);
      };

      this.ws.onclose = () => {
        this.ws = null;
        if (this.isIntentionalClose) {
          this.updateStatus('disconnected');
          console.log('[WS] Connection closed intentionally');
          return;
        }

        this.updateStatus('disconnected');
        this.scheduleReconnect();
      };
    } catch (e) {
      console.error('[WS] Exception during connection setup:', e);
      this.scheduleReconnect();
    }
  }

  public disconnect() {
    this.isIntentionalClose = true;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.updateStatus('disconnected');
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public onStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public subscribe(type: string, callback: MessageCallback): () => void {
    if (!this.messageListeners.has(type)) {
      this.messageListeners.set(type, new Set());
    }
    this.messageListeners.get(type)!.add(callback);
    return () => {
      const listeners = this.messageListeners.get(type);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.messageListeners.delete(type);
        }
      }
    };
  }

  private scheduleReconnect() {
    if (this.retryTimer) return;
    if (this.retryCount >= this.maxRetries) {
      console.warn('[WS] Max reconnection retries reached.');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 15000);
    this.retryCount += 1;
    this.updateStatus('reconnecting');
    console.log(`[WS] Reconnecting in ${delay / 1000}s (Attempt ${this.retryCount}/${this.maxRetries})`);
    
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.connect();
    }, delay);
  }

  private updateStatus(status: ConnectionStatus) {
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  private emitMessage(type: string, payload: any) {
    const listeners = this.messageListeners.get(type);
    if (listeners) {
      listeners.forEach((callback) => callback(payload));
    }
  }
}

// Single instance cache
const clients: Record<string, ResilientWebSocketClient> = {};

export function getWebSocketClient(url: string): ResilientWebSocketClient {
  if (!clients[url]) {
    clients[url] = new ResilientWebSocketClient(url);
  }
  return clients[url];
}
