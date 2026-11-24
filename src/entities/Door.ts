import { Entity, Interactable } from './Entity';
import type { Game } from '../game/Game';
import { ItemId } from '../types';
import { drawSprite } from '../graphics/PixelArt';

export type DoorKind = 'house' | 'gate' | 'puzzle' | 'key' | 'brazier';

export class Door extends Entity implements Interactable {
  id: string;
  kind: DoorKind;
  open = false;
  requireFlag: string | null;
  lockedText: string;
  questFlag: string | null;
  requireItem: string | null;
  bossLocked = false;
  radius = 16;

  constructor(id: string, kind: DoorKind, tx: number, ty: number, requireFlag: string | null = null, lockedText = '', questFlag: string | null = null, requireItem: string | null = null) {
    super();
    this.id = id;
    this.kind = kind;
    this.x = tx * 16 + 8;
    this.y = ty * 16 + (kind === 'gate' ? 20 : 12);
    if (kind === 'gate') {
      this.w = 16;
      this.h = 30;
    } else {
      this.w = 14;
      this.h = 10;
    }
    this.requireFlag = requireFlag;
    this.lockedText = lockedText;
    this.questFlag = questFlag;
    this.requireItem = requireItem;
  }

  prompt(game: Game): string {
    if (this.bossLocked) return 'Sealed by the guardian!';
    if (this.kind === 'gate') {
      if (this.open || (this.requireFlag && game.flags[this.requireFlag])) return 'Enter';
      return 'Sealed';
    }
    if (this.kind === 'key') {
      if (this.open) return '';
      return game.player.inv.count(this.requireItem as ItemId) > 0 ? 'Unlock' : 'Locked';
    }
    if (this.kind === 'puzzle') return this.open ? '' : 'Sealed by roots';
    if (this.kind === 'brazier') return this.open ? '' : 'Sealed by cold water';
    return this.open ? 'Close' : 'Open';
  }

  interact(game: Game): void {
    if (this.bossLocked) {
      game.toast('The guardian seals this door!');
      game.audio.sfx('gate');
      return;
    }
    if (this.kind === 'gate') {
      if (this.open || (this.requireFlag && game.flags[this.requireFlag])) {
        this.open = true;
        this.solid = false;
        game.persistEntity(this.id, { open: true });
        if (this.questFlag) game.setFlag(this.questFlag, 1);
        game.audio.sfx('gate');
        return;
      }
      game.toast(this.lockedText || 'Sealed by a fell ward.');
      game.audio.sfx('gate');
      game.camera.shake(2);
      return;
    }
    if (this.kind === 'key') {
      if (this.open) return;
      if (this.requireItem && game.player.inv.count(this.requireItem as ItemId) <= 0) {
        game.toast('Locked. It needs a ' + game.itemName(this.requireItem as ItemId) + '.');
        game.audio.sfx('error');
        return;
      }
      if (this.requireItem) game.player.inv.remove(this.requireItem as ItemId);
      this.open = true;
      this.solid = false;
      game.persistEntity(this.id, { open: true });
      game.toast('Unlocked!');
      game.audio.sfx('door');
      return;
    }
    if (this.kind === 'puzzle' || this.kind === 'brazier') {
      if (!this.open) game.toast(this.lockedText || 'Sealed.');
      return;
    }
    this.open = !this.open;
    this.solid = !this.open;
    game.persistEntity(this.id, { open: this.open });
    game.audio.sfx('door');
  }

  update(_dt: number, _game: Game): void {}

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    if (this.kind === 'gate' || this.kind === 'puzzle' || this.kind === 'brazier') {
      if (this.open) {
        ctx.fillStyle = 'rgba(20,16,40,0.85)';
        ctx.fillRect(this.x - 8, this.y - 20, 16, 32);
        return;
      }
      drawSprite(ctx, game.sprites.props['gate'], this.x - 8, this.y - 20);
    } else {
      drawSprite(ctx, this.open ? game.sprites.props['doorOpen'] : game.sprites.props['door'], this.x - 8, this.y - 14);
    }
  }
}
