import { validActions } from './CombatSystem.js';

export default class RandomGuardPolicy {
    constructor(random = Math.random) {
        this.random = random;
    }

    chooseAction(snapshot) {
        // CombatSystem owns affordability, finite uses and recovery validity;
        // this baseline adds no strategy or action-specific weighting.
        const actions = validActions(snapshot, 'guard');
        return actions.length ? actions[Math.floor(this.random() * actions.length)] : null;
    }
}
