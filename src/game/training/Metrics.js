// Shared metrics for training and paired evaluation, always Guard-perspective.
export function summarizeEpisodes(records) {
    const totals = { episodes: records.length, wins: 0, losses: 0, draws: 0, averageReward: 0, averageRounds: 0,
        forcedRounds: 0, roundLimitDraws: 0, cancelledGuardActions: 0, actionCounts: {}, startCounts: {normal:0,randomized:0} };
    for (const record of records) {
        totals.startCounts[record.startType ?? 'normal']++;
        totals[record.outcome === 'win' ? 'wins' : record.outcome === 'loss' ? 'losses' : 'draws']++;
        totals.averageReward += record.totalReward; totals.averageRounds += record.rounds;
        totals.forcedRounds += record.forcedRounds; totals.cancelledGuardActions += record.cancelledGuardActions;
        totals.roundLimitDraws += Number(record.roundLimitReached);
        for (const [action, count] of Object.entries(record.actionCounts)) totals.actionCounts[action] = (totals.actionCounts[action] ?? 0) + count;
    }
    totals.winRate = records.length ? totals.wins / records.length : 0;
    totals.averageReward /= records.length || 1; totals.averageRounds /= records.length || 1;
    return totals;
}
