import type { Game } from '../game/Game';
import { VIEW_W, VIEW_H } from '../types';
import { drawText, drawTextShadow, measureText, drawSprite } from '../graphics/PixelArt';

export interface DialogueChoice {
  text: string;
  next?: string;
  action?: (g: Game) => void;
}

export interface DialogueNode {
  speaker?: string;
  text: string | string[];
  next?: string;
  choices?: DialogueChoice[];
  action?: (g: Game) => void;
  goto?: (g: Game) => string;
}

export interface DialogueTree {
  start: string;
  nodes: Record<string, DialogueNode>;
}

export class DialogueSystem {
  private trees: Record<string, DialogueTree>;
  tree: DialogueTree | null = null;
  nodeId = '';
  pages: string[] = [];
  pageIdx = 0;
  charIdx = 0;
  choiceIdx = 0;
  speaker = '';
  active = false;
  private t = 0;

  constructor(trees: Record<string, DialogueTree>) {
    this.trees = trees;
  }

  start(treeId: string, speaker: string, game: Game): void {
    const tree = this.trees[treeId];
    if (!tree) return;
    this.tree = tree;
    this.speaker = speaker;
    this.active = true;
    this.enterNode(tree.start, game);
  }

  private enterNode(id: string, game: Game): void {
    if (!this.tree) return;
    let node = this.tree.nodes[id];
    let guard = 0;
    while (node?.goto && guard++ < 8) {
      id = node.goto(game);
      node = this.tree.nodes[id];
    }
    if (!node) {
      this.end();
      return;
    }
    this.nodeId = id;
    this.pages = Array.isArray(node.text) ? node.text : [node.text];
    this.pageIdx = 0;
    this.charIdx = 0;
    this.choiceIdx = 0;
    this.speaker = node.speaker ?? this.speaker;
    if (node.action) node.action(game);
  }

  private end(): void {
    this.active = false;
    this.tree = null;
    if (this.onEnd) this.onEnd();
  }

  onEnd: (() => void) | null = null;

  update(dt: number, game: Game): void {
    if (!this.active || !this.tree) return;
    this.t += dt;
    if (game.input.hit('Escape')) {
      this.end();
      return;
    }
    const node = this.tree.nodes[this.nodeId];
    if (!node) {
      this.end();
      return;
    }
    const page = this.pages[this.pageIdx] ?? '';
    const full = page.length;
    this.charIdx = Math.min(full, this.charIdx + dt * 42);
    if (Math.floor(this.t * 12) % 2 === 0 && this.charIdx < full) game.audio.sfx('text');
    const input = game.input;
    const adv = input.hit('KeyF') || input.hit('Enter') || input.hit('KeyJ') || input.mouse.pressed;
    if (node.choices && this.charIdx >= full) {
      const n = node.choices.length;
      if (input.hit('ArrowUp') || input.hit('KeyW')) {
        this.choiceIdx = (this.choiceIdx - 1 + n) % n;
        game.audio.sfx('cursor');
      }
      if (input.hit('ArrowDown') || input.hit('KeyS')) {
        this.choiceIdx = (this.choiceIdx + 1) % n;
        game.audio.sfx('cursor');
      }
      if (adv) {
        const c = node.choices[this.choiceIdx];
        game.audio.sfx('select');
        if (c.action) c.action(game);
        if (c.next) this.enterNode(c.next, game);
        else this.end();
      }
      return;
    }
    if (!adv) return;
    if (this.charIdx < full) {
      this.charIdx = full;
      return;
    }
    if (this.pageIdx < this.pages.length - 1) {
      this.pageIdx++;
      this.charIdx = 0;
      return;
    }
    if (node.next) {
      this.enterNode(node.next, game);
    } else if (node.choices) {
      return;
    } else {
      this.end();
    }
  }

  private wrap(text: string, maxW: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (measureText(test, 1) > maxW && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    if (!this.active || !this.tree) return;
    const node = this.tree.nodes[this.nodeId];
    if (!node) return;
    const bx = 8;
    const by = VIEW_H - 52;
    const bw = VIEW_W - 16;
    const bh = 46;
    ctx.fillStyle = 'rgba(8,10,24,0.92)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#e0b34c';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
    ctx.strokeStyle = 'rgba(224,179,76,0.35)';
    ctx.strokeRect(bx + 2.5, by + 2.5, bw - 5, bh - 5);
    const portrait = game.sprites.chars[game.dialoguePortrait]?.portrait;
    if (portrait) {
      ctx.fillStyle = '#141828';
      ctx.fillRect(bx + 4, by + 4, 26, 20);
      drawSprite(ctx, portrait, bx + 9, by + 5, { scale: 2 });
      ctx.strokeStyle = '#e0b34c';
      ctx.strokeRect(bx + 4.5, by + 4.5, 25, 19);
    }
    drawTextShadow(ctx, this.speaker.toUpperCase(), bx + 34, by + 5, 1, '#ffd76a');
    const page = this.pages[this.pageIdx] ?? '';
    const shown = page.slice(0, Math.floor(this.charIdx));
    const lines = this.wrap(shown, bw - 44);
    let ty = by + 15;
    for (const ln of lines.slice(0, 3)) {
      drawText(ctx, ln, bx + 36, ty, 1, '#e8ecf5');
      ty += 6;
    }
    if (node.choices && this.charIdx >= page.length) {
      const cy = by + 15;
      node.choices.forEach((c, i) => {
        const sel = i === this.choiceIdx;
        drawText(ctx, (sel ? '>' : ' ') + ' ' + c.text, bx + 36, cy + i * 7, 1, sel ? '#ffd76a' : '#aab2c5');
      });
    } else if (this.charIdx >= page.length && (node.next || !node.choices)) {
      if (Math.floor(game.time * 3) % 2 === 0) drawText(ctx, 'V', bx + bw - 10, by + bh - 8, 1, '#ffd76a');
    }
  }
}