type Listener<T = any> = (payload: T) => void;

export class EventBus {
  private listeners: Record<string, Listener[]> = {};

  on<T>(event: string, listener: Listener<T>) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
    return () => this.off(event, listener);
  }

  off<T>(event: string, listener: Listener<T>) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
  }

  emit<T>(event: string, payload: T) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((listener) => listener(payload));
  }

  clear() {
    this.listeners = {};
  }
}
