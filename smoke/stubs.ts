// Headless DOM/Audio stubs so the game can run under plain Node.
/* eslint-disable @typescript-eslint/no-explicit-any */

const anyProxy: any = new Proxy(function () {} as any, {
  get(_t, p) {
    if (p === Symbol.toPrimitive) return () => 0;
    if (p === 'then') return undefined;
    if (p === Symbol.iterator) return function* () {};
    return anyProxy;
  },
  apply() {
    return anyProxy;
  },
  set() {
    return true;
  }
});

function makeCtx(canvas: any): any {
  return new Proxy(
    {},
    {
      get(_t, p) {
        if (p === 'canvas') return canvas;
        if (p === Symbol.toPrimitive) return () => 0;
        if (p === 'measureText') return () => ({ width: 0 });
        if (p === 'getImageData') return () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 });
        if (p === 'createImageData') return () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 });
        return anyProxy;
      },
      set() {
        return true;
      }
    }
  );
}

function makeCanvas(): any {
  const c: any = {
    width: 320,
    height: 180,
    style: {},
    addEventListener() {},
    removeEventListener() {},
    setAttribute() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, right: 320, bottom: 180, width: 320, height: 180 }),
    toDataURL: () => 'data:,'
  };
  c.getContext = () => makeCtx(c);
  return c;
}

const g = globalThis as any;

const store = new Map<string, string>();
g.localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: (i: number) => [...store.keys()][i] ?? null,
  get length() {
    return store.size;
  }
};

const listeners: Record<string, ((e: any) => void)[]> = {};
g.window = g;
g.addEventListener = (t: string, f: (e: any) => void) => {
  (listeners[t] ??= []).push(f);
};
g.removeEventListener = () => {};
g.dispatchKey = (type: string, code: string) => {
  for (const f of listeners[type] ?? []) f({ code, repeat: false, button: 0, preventDefault() {} });
};
g.document = {
  createElement: (tag: string) => (tag === 'canvas' ? makeCanvas() : { style: {}, addEventListener() {}, removeEventListener() {} }),
  getElementById: (id: string) => (id === 'game' ? makeCanvas() : null),
  querySelectorAll: () => [],
  addEventListener() {},
  removeEventListener() {},
  hidden: false,
  body: { appendChild() {}, removeChild() {} }
};
Object.defineProperty(g, 'navigator', { value: { userAgent: 'node-smoke' }, configurable: true });
g.devicePixelRatio = 1;
g.innerWidth = 960;
g.innerHeight = 540;
g.AudioContext = function () {
  return anyProxy;
};
g.setInterval = () => 1;
g.clearInterval = () => {};
g.requestAnimationFrame = () => 1;
g.cancelAnimationFrame = () => {};
g.Image = function () {
  return { addEventListener() {}, removeEventListener() {} };
};
g.MutationObserver = class {
  observe() {}
  disconnect() {}
};

export { makeCanvas };
