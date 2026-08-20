export type SocketEvent = 'AGENT_STATE_UPDATE' | 'SYSTEM_MESSAGE' | 'DIRECTOR_SYNTHESIS_START';

export interface SocketPayload {
  agentId?: string;
  state?: string;
  message?: string;
}

export type SocketCallback = (payload: SocketPayload) => void;

export class SocketSystem {
  private socket: WebSocket | null = null;
  private callbacks: Map<SocketEvent, SocketCallback[]> = new Map();
  private readonly url: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

  constructor() {}

  public connect(): void {
    if (this.socket) return;

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('WebSocket connected to backend');
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, payload } = data;

        if (type && this.callbacks.has(type as SocketEvent)) {
          this.callbacks.get(type as SocketEvent)?.forEach(cb => cb(payload));
        }
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected. Attempting to reconnect...');
      setTimeout(() => this.connect(), 5000);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  public on(event: SocketEvent, callback: SocketCallback): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)?.push(callback);
  }

  public send(type: SocketEvent, payload: SocketPayload): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Export a singleton instance
export const socketSystem = new SocketSystem();
