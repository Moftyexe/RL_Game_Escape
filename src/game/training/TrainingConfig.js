export const TRAINING_CONFIG = Object.freeze({
    seed: 20261106, episodes: 100000, alpha: 0.10, gamma: 0.95,
    epsilonStart: 1, epsilonEnd: 0.05, epsilonDecayEpisodes: 45000, maxRounds: 100,
    randomizedStartFraction: 0.25,
    botDistribution: Object.freeze({ random: 1, aggressive: 2, tricky: 1 })
});
export const EVALUATION_CONFIG = Object.freeze({ seed: 20261107, episodesPerBot: 1000, maxRounds: TRAINING_CONFIG.maxRounds });
export const REWARDS = Object.freeze({ win: 100, loss: -100, draw: -10, damageDivisor: 20, roundCost: -0.2 });
export function trainingConfig(overrides = {}) {
    const config = { ...TRAINING_CONFIG, ...overrides, botDistribution: { ...TRAINING_CONFIG.botDistribution, ...overrides.botDistribution } };
    for (const name of ['episodes','maxRounds','epsilonDecayEpisodes']) if (!Number.isInteger(config[name]) || config[name] < 1) throw new Error(`Invalid ${name}`);
    if (!Number.isInteger(config.seed) || config.seed < 0 || config.seed > 0xffffffff) throw new Error('Seed must be uint32');
    for (const name of ['alpha','gamma','epsilonStart','epsilonEnd','randomizedStartFraction'])
        if (!Number.isFinite(config[name]) || config[name] < 0 || config[name] > 1) throw new Error(`Invalid ${name}`);
    if (!config.alpha || config.epsilonStart < config.epsilonEnd) throw new Error('Invalid training schedule');
    if (Object.keys(config.botDistribution).some(name => !['random','aggressive','tricky'].includes(name))
        || Object.values(config.botDistribution).some(v => !Number.isFinite(v) || v < 0)
        || !Object.values(config.botDistribution).some(v => v > 0)) throw new Error('Invalid bot distribution');
    return config;
}
export function epsilonForEpisode(episode, config) {
    // Fixed episode-index horizon: never stretches when the run gets longer.
    const fraction = Math.min(1, Math.max(0, episode / config.epsilonDecayEpisodes));
    if (fraction === 1) return config.epsilonEnd;
    return config.epsilonStart + (config.epsilonEnd - config.epsilonStart) * fraction;
}
