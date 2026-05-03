/// <reference types="vite/client" />
export class PerfLogger {
  static measures = new Map<string, { start: number, times: number[] }>();

  static isEnabled() {
    return import.meta.env.DEV || new URLSearchParams(window.location.search).get('debug') === '1';
  }

  static start(name: string) {
    if (!this.isEnabled()) return;
    this.measures.set(name, { start: performance.now(), times: this.measures.get(name)?.times || [] });
  }

  static end(name: string) {
    if (!this.isEnabled()) return;
    const measure = this.measures.get(name);
    if (!measure) return;
    const duration = performance.now() - measure.start;
    measure.times.push(duration);
    
    const memory = (performance as any).memory;
    const memUsage = memory ? `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB` : 'N/A';
    
    console.table({
      Task: name,
      Duration: `${duration.toFixed(2)}ms`,
      AvgDuration: `${(measure.times.reduce((a,b)=>a+b,0)/measure.times.length).toFixed(2)}ms`,
      Memory: memUsage
    });
  }
}
