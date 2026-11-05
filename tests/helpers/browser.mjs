import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const root = new URL('../../', import.meta.url);

// DOM mínimo para testes de lógica. Não simula layout, foco nativo ou rede.
class EventTarget {
  listeners = new Map();

  addEventListener(type, listener, options = {}) {
    const listeners = this.listeners.get(type) || [];
    listeners.push({ listener, once: options.once });
    this.listeners.set(type, listeners);
  }

  dispatch(type, properties = {}) {
    const event = {
      target: this,
      defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; },
      ...properties,
    };
    for (const entry of [...(this.listeners.get(type) || [])]) {
      entry.listener(event);
      if (entry.once) {
        this.listeners.set(type, this.listeners.get(type).filter((item) => item !== entry));
      }
    }
    if (['click', 'pointerdown', 'keydown'].includes(type) && this.parentNode) {
      this.parentNode.dispatch(type, event);
    }
    return event;
  }
}

class Element extends EventTarget {
  children = [];
  attributes = new Map();
  dataset = {};
  disabled = false;
  hidden = false;
  parentNode = null;
  value = '';

  constructor(tag, document) {
    super();
    this.tagName = tag;
    this.ownerDocument = document;
    const classes = () => new Set(this.className.split(/\s+/).filter(Boolean));
    this.classList = {
      contains: (name) => classes().has(name),
      add: (...names) => { this.className = [...new Set([...classes(), ...names])].join(' '); },
      remove: (...names) => { this.className = [...classes()].filter((name) => !names.includes(name)).join(' '); },
      toggle: (name, force) => {
        const enabled = force ?? !classes().has(name);
        this.classList[enabled ? 'add' : 'remove'](name);
        return enabled;
      },
    };
  }

  get className() { return this.attributes.get('class') || ''; }
  set className(value) { this.attributes.set('class', value); }
  get textContent() { return this.value + this.children.map((child) => child.textContent).join(''); }
  set textContent(value) { this.replaceChildren(); this.value = String(value); }
  get isConnected() { return this.parentNode === this.ownerDocument || Boolean(this.parentNode?.isConnected); }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name.startsWith('data-')) {
      this.dataset[name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = String(value);
    }
    if (name === 'hidden') this.hidden = true;
  }

  getAttribute(name) { return this.attributes.get(name) ?? null; }
  append(...children) {
    for (const child of children) { child.parentNode = this; this.children.push(child); }
  }
  replaceChildren(...children) {
    for (const child of this.children) child.parentNode = null;
    this.children = [];
    this.value = '';
    this.append(...children);
  }
  contains(node) { return this === node || this.children.some((child) => child.contains(node)); }
  focus() { this.ownerDocument.activeElement = this; }
  click() { if (!this.disabled) { this.focus(); return this.dispatch('click'); } }
  matches(selector) {
    if (selector.startsWith('#')) return this.getAttribute('id') === selector.slice(1);
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    if (selector.startsWith('[')) {
      const [, name, value] = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/) || [];
      return value === undefined ? this.attributes.has(name) : this.getAttribute(name) === value;
    }
    return this.tagName === selector;
  }
  querySelectorAll(selector) {
    const parts = selector.trim().split(/\s+/);
    const found = [];
    const walk = (node) => {
      for (const child of node.children) {
        if (child.matches(parts.at(-1))) {
          let ancestor = child.parentNode;
          let index = parts.length - 2;
          while (index >= 0 && ancestor instanceof Element) {
            if (ancestor.matches(parts[index])) index--;
            ancestor = ancestor.parentNode;
          }
          if (index < 0) found.push(child);
        }
        walk(child);
      }
    };
    walk(this);
    return found;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}

function parseDocument(html) {
  const document = new Element('#document', null);
  document.ownerDocument = document;
  document.createElement = (tag) => new Element(tag, document);
  document.createTextNode = (text) => { const node = new Element('#text', document); node.textContent = text; return node; };
  document.getElementById = (id) => document.querySelector(`#${id}`);
  const stack = [document];
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'wbr']);
  for (const token of html.matchAll(/<!--[\s\S]*?-->|<![^>]*>|<\/?([a-z][\w-]*)\b([^>]*)>|([^<]+)/gi)) {
    if (token[3]) { stack.at(-1).append(document.createTextNode(token[3])); continue; }
    if (!token[1]) continue;
    if (token[0].startsWith('</')) { stack.pop(); continue; }
    const node = document.createElement(token[1].toLowerCase());
    for (const attribute of token[2].matchAll(/([\w-]+)(?:\s*=\s*"([^"]*)")?/g)) {
      node.setAttribute(attribute[1], attribute[2] ?? '');
    }
    stack.at(-1).append(node);
    if (!voidTags.has(node.tagName)) stack.push(node);
  }
  document.documentElement = document.querySelector('html');
  document.body = document.querySelector('body');
  document.activeElement = document.body;
  return document;
}

export async function loadBrowser({ configure } = {}) {
  const document = parseDocument(await readFile(new URL('index.html', root), 'utf8'));
  const window = new EventTarget();
  const media = new EventTarget();
  const timers = new Map();
  let now = 0;
  let nextTimer = 0;
  const setTimeout = (callback, delay) => { timers.set(++nextTimer, { callback, time: now + delay }); return nextTimer; };
  const clearTimeout = (id) => timers.delete(id);
  Object.assign(window, { document, setTimeout, clearTimeout, matchMedia: () => media });
  const context = vm.createContext({ window, document, URL, setTimeout, clearTimeout });
  const run = async (filename) => new vm.Script(await readFile(new URL(filename, root), 'utf8'), { filename }).runInContext(context, { timeout: 1000 });
  await run('js/config.js');
  configure?.(window);
  await run('js/main.js');
  return {
    window, document, media,
    $: (selector) => document.querySelector(selector),
    $$: (selector) => document.querySelectorAll(selector),
    advance(ms) {
      now += ms;
      for (const [id, timer] of [...timers]) {
        if (timer.time <= now && timers.delete(id)) timer.callback();
      }
    },
  };
}
