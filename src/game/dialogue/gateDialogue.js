import {tierForDay} from '../progression/RunState.js';
import {GAME_DIALOGUE} from './dialogueScript.js';
export const GATE_DIALOGUE=GAME_DIALOGUE.gate;
export function gateDialogue(day,scripts=GATE_DIALOGUE){const lines=scripts[tierForDay(day)]??scripts[1]??GATE_DIALOGUE[1];return Array.isArray(lines)&&lines.length?lines:GATE_DIALOGUE[1];}
