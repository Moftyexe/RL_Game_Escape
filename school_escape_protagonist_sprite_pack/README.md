# School Escape RPG - Protagonist Sprite Pack

Generated filler sprite pack for your Phaser prototype.

## Format
- PNG frames with transparent backgrounds
- Uniform frame canvas: 128x128 px
- Horizontal sprite sheets in `sheets/`
- Individual frames in `animations/<animation>/`
- `metadata.json` contains frame counts, FPS and loop flags

## Included animations
- idle_down
- walk_down
- run_down
- idle_left
- walk_left
- run_left
- idle_right
- walk_right
- run_right
- idle_up
- walk_up
- run_up
- blink
- interact
- hurt
- victory
- defeat
- attack
- defend
- hit_combat
- knockdown
- get_up
- buff
- debuff

## Phaser example

```js
this.load.spritesheet('player_walk_right', 'assets/player/sheets/walk_right.png', {
  frameWidth: 128,
  frameHeight: 128
});

this.anims.create({
  key: 'walk_right',
  frames: this.anims.generateFrameNumbers('player_walk_right', {
    start: 0,
    end: 3
  }),
  frameRate: 10,
  repeat: -1
});
```

## Notes
These are filler/generated sprites, so some frames may need pixel cleanup before final submission.
The movement set is the most consistent. Combat actions were extracted from the earlier character sheet and are suitable as placeholders.
