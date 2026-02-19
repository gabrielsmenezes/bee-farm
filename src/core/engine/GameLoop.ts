export class GameLoop {
  private lastTime: number = 0;
  private running: boolean = false;
  private callback: (deltaTime: number) => void;
  private frameId: number | null = null; // Use number for browser, NodeJS.Timeout for node?

  constructor(callback: (deltaTime: number) => void) {
    this.callback = callback;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    this.running = false;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private loop = () => {
    if (!this.running) return;

    const now = performance.now();
    const deltaTime = now - this.lastTime;
    this.lastTime = now;

    this.callback(deltaTime);

    this.frameId = requestAnimationFrame(this.loop);
  };
}
