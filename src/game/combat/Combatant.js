export default class Combatant {
    constructor(name, { hasDonut = false, hasWifeCall = false, maxHp = 1000 } = {}) {
        this.name = name;
        this.maxHp = maxHp;
        this.maxSp = 100;
        this.hp = this.maxHp;
        this.sp = this.maxSp;
        this.baseAttackDamage = 80;
        this.baseAccuracy = 0.9;
        this.baseCriticalChance = 0.1;
        this.criticalDamageMultiplier = 1.5;
        this.defending = false;
        this.status = null;
        this.stunned = false;
        this.offGuard = false; // Transient interruption plus next-round skip; not a mental status.
        this.donutAvailable = hasDonut;
        this.wifeCallAvailable = hasWifeCall;
    }
}
