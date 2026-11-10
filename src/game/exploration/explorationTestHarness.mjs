import { readFile } from 'node:fs/promises';
import { EventEmitter } from 'node:events';

// Load actual scene/helpers under Node with only Phaser's renderer/input facade
// replaced. Animation manifests, layout math and encounter logic remain real.
const phaserStub = 'data:text/javascript,' + encodeURIComponent(`
    export class Scene { constructor(key) { this.scene = { key }; } }
    export const Textures = { FilterMode: { NEAREST: 1 } };
    export const Input = { Keyboard: { KeyCodes: { A: 65, D: 68, W: 87, S: 83, SPACE: 32, SHIFT: 16 },
        JustDown(key) { const down = !!key.fresh; key.fresh = false; return down; } } };
`);

async function load(relative, replacements = {}) {
    const url = new URL(relative, import.meta.url);
    let source = await readFile(url, 'utf8');
    source = source.replace(/import background from '[^']+';/, "const background = 'BG.png';");
    source = source.replace(/from '([^']+)'/g, (match, name) => {
        if (name === 'phaser') return `from '${phaserStub}'`;
        if (replacements[name]) return `from '${replacements[name]}'`;
        if (name.startsWith('.')) return `from '${new URL(/\.(js|json)$/.test(name) ? name : name + '.js', url).href}'`;
        return match;
    });
    return 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
}

const playerUrl = await load('../player/playerAnimations.js');
const guardUrl = await load('../guard/guardAnimations.js');
export const playerAnimations = await import(playerUrl);
export const guardAnimations = await import(guardUrl);
export const { default: SchoolScene } = await import(await load('../scenes/SchoolScene.js', {
    '../player/playerAnimations': playerUrl, '../guard/guardAnimations': guardUrl
}));

export function createSchoolFixture({ missingMusician = false,game=null } = {}) {
    const scene = new SchoolScene(), calls = [], sprites = [], labels = [], shadows = [];
    if(game)scene.game=game;
    scene.scale = { width: 1024, height: 768 };
    let room = null;
    scene.textures = {
        exists: key => !missingMusician || !key.startsWith('musician-'),
        get: key => key === 'school-background' ? {
            has: () => room != null,
            add: (name, source, x, y, width, height) => { room = { x, y, width, height }; }
        } : { setFilter() {} }
    };
    scene.anims = { exists: () => false, create: config => calls.push(['animation', config]) };
    scene.add = {
        container:()=>({children:[],setScrollFactor(){return this;},setDepth(){return this;},setScale(){return this;},setPosition(){return this;},add(items){this.children.push(...(Array.isArray(items)?items:[items]));return this;},destroy(){this.destroyed=true;}}),
        rectangle:()=>({events:{},setInteractive(){return this;},on(e,f){this.events[e]=f;return this;},setPosition(x,y){this.x=x;this.y=y;return this;},setScale(x,y){this.scaleX=x;this.scaleY=y;return this;},setOrigin(){return this;},setStrokeStyle(){return this;},destroy(){}}),
        image: (x,y,texture) => ({ texture,width: room.width, height: room.height, setOrigin() { return this; },destroy(){this.destroyed=true;},
            setScale(scale) { this.scale=scale;this.displayWidth = this.width * scale; this.displayHeight = this.height * scale; return this; } }),
        ellipse: (x, y, width, height, color, alpha) => {
            const shadow = { x, y, width, height, color, alpha, depth: 0,
                setDepth(value) { this.depth = value; return this; },
                setPosition(x, y) { this.x = x; this.y = y; return this; } };
            shadows.push(shadow); return shadow;
        },
        sprite: (x, y, texture) => {
            const sprite = { x, y, texture, flipX: false, scale: 1, animation: null,
                setDepth(value) { this.depth = value; return this; },
                setScale(value) { this.scale = value; return this; },
                setOrigin(x, y) { this.origin = [x, y]; return this; },
                setFlipX(value) { this.flipX = value; return this; },
                play(key) { this.animation = key; return this; } };
            sprites.push(sprite); return sprite;
        },
        text: (x, y, text) => {
            const label = { x, y, text, visible: true,events:{},setInteractive(){return this;},on(e,f){this.events[e]=f;return this;},setColor(v){this.color=v;return this;}, setOrigin() { return this; }, setScrollFactor() { return this; },
                destroy() { this.destroyed = true; }, setDepth() { return this; }, setVisible(value) { this.visible = value; return this; },
                setText(value) { this.text = value; return this; } };
            labels.push(label); return label;
        }
    };
    scene.cameras = { main: { setBounds: (...args) => calls.push(['cameraBounds', ...args]),
        centerOn: (...args) => calls.push(['cameraCenter', ...args]), startFollow: (...args) => calls.push(['cameraFollow', ...args]) } };
    scene.input = Object.assign(new EventEmitter(), { keyboard: Object.assign(new EventEmitter(), {
        addKeys: bindings => Object.fromEntries(Object.keys(bindings).map(key => [key, { isDown: false, fresh: false }])),
        createCursorKeys: () => Object.fromEntries(['left', 'right', 'up', 'down'].map(key => [key, { isDown: false }]))
    }) });
    scene.events = new EventEmitter();
    scene.sound = Object.assign(new EventEmitter(), { noAudio: true });
    scene.cache = { audio: { exists: () => false } };
    let now=0;const timers=[];
    scene.time = {get now(){return now;},delayedCall: (ms, fn) => {const t={at:now+ms,removed:false,remove(){this.removed=true;},fire:fn};timers.push(t);return t;} };
    scene.advanceTime=ms=>{const end=now+ms;for(;;){const t=timers.filter(t=>!t.removed&&t.at<=end).sort((a,b)=>a.at-b.at)[0];if(!t)break;now=t.at;t.removed=true;t.fire();}now=end;};
    scene.tweens={add(config){const timer=scene.time.delayedCall(config.duration,()=>{for(const target of Array.isArray(config.targets)?config.targets:[config.targets])if(config.scaleY!==undefined)target.scaleY=config.scaleY;config.onComplete?.();});return {stop:()=>timer.remove(),remove:()=>timer.remove()};}};
    scene.scene.launch = (...args) => calls.push(['launch', ...args]);
    scene.scene.pause = () => { calls.push(['pause']); scene.events.emit('pause'); };
    scene.create();
    return { scene, calls, sprites, labels, shadows, room: () => room };
}
