// Zones use world coordinates and the player's foot position. No physics needed.
export default class InteractionZones {
    constructor() {
        this.zones = [];
    }

    add({ id, x, y, radius, prompt, onInteract }) {
        this.zones.push({ id, x, y, radius, prompt, onInteract });
    }

    findAt(x, y) {
        return this.zones.find(zone => Math.hypot(x - zone.x, y - zone.y) <= zone.radius);
    }

    interactAt(x, y) {
        const zone = this.findAt(x, y);
        if (!zone) return false;
        zone.onInteract();
        return true;
    }
}
