import QLearningGuardPolicy, { POLICY_MODE } from '../ai/QLearningGuardPolicy.js';
import QTable from '../ai/QTable.js';
import RandomGuardPolicy from '../combat/RandomGuardPolicy.js';
import HeuristicGuardPolicy from '../ai/HeuristicGuardPolicy.js';
import TrainingEnvironment from './TrainingEnvironment.js';
import { trainingConfig, epsilonForEpisode, REWARDS, EVALUATION_CONFIG } from './TrainingConfig.js';
import { seededRandom, deriveSeed } from './SeededRandom.js';
import { BOT_TYPES, weightedChoice, PLAYER_BOT_SCHEMA } from './PlayerBots.js';
import { summarizeEpisodes } from './Metrics.js';
import { START_SCHEMA } from './RandomizedStarts.js';

export function trainGuard(overrides = {}, onProgress = () => {}, {checkpointEpisodes = [], onCheckpoint = () => {}} = {}) {
    const config = trainingConfig(overrides), table = new QTable();
    if (!Array.isArray(checkpointEpisodes) || new Set(checkpointEpisodes).size !== checkpointEpisodes.length
        || checkpointEpisodes.some(n=>!Number.isInteger(n)||n<1||n>config.episodes)) throw Error('Invalid checkpoints');
    const checkpoints = new Set(checkpointEpisodes);
    const botRandom = seededRandom(deriveSeed(config.seed, 'bot-pool'));
    const startRandom = seededRandom(deriveSeed(config.seed, 'start-pool'));
    const policy = new QLearningGuardPolicy({ table, mode: POLICY_MODE.TRAIN, alpha: config.alpha, gamma: config.gamma,
        random: seededRandom(deriveSeed(config.seed, 'guard-policy')) });
    const records = [];
    for (let episode = 0; episode < config.episodes; episode++) {
        const bot = weightedChoice(config.botDistribution, botRandom);
        const env = new TrainingEnvironment({ seed: deriveSeed(config.seed, 'episode', String(episode)), bot,
            maxRounds: config.maxRounds, gamma: config.gamma, randomizedStart: startRandom() < config.randomizedStartFraction });
        const epsilon = epsilonForEpisode(episode, config); policy.setEpsilon(epsilon);
        while (!env.terminal) {
            // Only a public pre-round observation exists when Guard selects.
            const state = env.observation(), action = policy.chooseAction(state);
            const transition = env.step(action);
            policy.learn(state, action, transition.reward, transition.nextState, { terminal: transition.terminal, rounds: transition.rounds });
        }
        records.push({ episode: episode + 1, seed: env.seed, bot, epsilon, qStates: table.stateCount, ...env.summary() });
        // Serialize synchronously at the boundary before any subsequent update.
        // Snapshots contain the prefix of one continuous, seeded training run.
        if (checkpoints.has(episode+1)) onCheckpoint(buildResult(episode+1));
        if ((episode + 1) % 500 === 0 || episode + 1 === config.episodes) onProgress({ episode: episode + 1, states: table.stateCount });
    }
    return buildResult(config.episodes);
    function buildResult(completedEpisodes) {
    const summary = summarizeEpisodes(records);
    const coverage=table.coverage();
    if(coverage.totalVisits!==records.reduce((n,r)=>n+r.decisions,0))throw Error('Decision/update/visit counts diverged');
    return { table, config, metrics: { config: {...config, episodes:completedEpisodes, plannedEpisodes:config.episodes}, summary, coverage, perBot: Object.fromEntries(BOT_TYPES.map(bot =>
        [bot, summarizeEpisodes(records.filter(record => record.bot === bot))])),
        perStart: Object.fromEntries(['normal','randomized'].map(type=>[type,summarizeEpisodes(records.filter(record=>record.startType===type))])), episodes: records },
        metadata: { config, initialization: 'empty-zero-Q', startSchema: START_SCHEMA, rewardWeights: { ...REWARDS }, playerBotSchema: PLAYER_BOT_SCHEMA, rng: 'mulberry32-named-fnv1a-streams', episodes: completedEpisodes, plannedEpisodes:config.episodes, seed: config.seed, alpha: config.alpha, gamma: config.gamma,
            finalEpsilon: policy.epsilon, stateCount: table.stateCount, pairCount: table.pairCount,coverage,
            visitSemantics:'one visit per Q-updated committed decision, including cancellation; forced skips have none',
            forcedTransition: 'discounted multi-round return and gamma^rounds bootstrap; no forced action Q rows' } };
    }
}
export function evaluateGuard(table, { seed = EVALUATION_CONFIG.seed, episodesPerBot = EVALUATION_CONFIG.episodesPerBot, maxRounds = EVALUATION_CONFIG.maxRounds } = {}) {
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error('Evaluation seed must be uint32');
    if (!Number.isInteger(episodesPerBot) || episodesPerBot < 1) throw new Error('Invalid evaluation count');
    const before = JSON.stringify(table.toJSON()), results = [];
    for (const bot of BOT_TYPES) for (const kind of ['random','q-learning','heuristic']) {
        const records = [];
        for (let episode = 0; episode < episodesPerBot; episode++) {
            const episodeSeed = deriveSeed(seed, bot, String(episode));
            const random = seededRandom(deriveSeed(episodeSeed, 'guard-policy'));
            const policy = kind === 'random' ? new RandomGuardPolicy(random) : kind==='heuristic'?new HeuristicGuardPolicy(random)
                : new QLearningGuardPolicy({ table, mode: POLICY_MODE.EVAL, random });
            const env = new TrainingEnvironment({ seed: episodeSeed, bot, maxRounds, randomizedStart: false });
            while (!env.terminal) env.step(policy.chooseAction(env.observation()));
            records.push(env.summary());
        }
        results.push({ policy: kind, bot, ...summarizeEpisodes(records) });
    }
    if (JSON.stringify(table.toJSON()) !== before) throw new Error('Evaluation mutated Q-table');
    return { seed, episodesPerBot, maxRounds, learning: false, startMode: 'normal-only', results };
}
