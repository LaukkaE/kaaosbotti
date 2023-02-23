import { mmrlista, Player } from '../mmrlista';
const parseWinrate = (player: Player) => {
    if (!player) {
        return '[-]';
    }
    if (player.matchesPlayed) {
        if (player.matchesPlayed >= 20) {
            return `[${player.winRate} %]`;
        } else {
            return `[NEW]`;
        }
    }
};

const getPlayer = (name: string): Player | null => {
    let player = mmrlista[name.toLowerCase().replace(/ /g, '').substring(0, 7)];
    if (!player) return null;
    return player;
};

const appendPlayerInfo = (team: string[]) => {
    return team.map((e: string) => {
        let player =
            mmrlista[e.toLowerCase().replace(/ /g, '').substring(0, 7)];
        return [
            player.alias || null,
            player.mmr || 4004, // jos mmr ei löydy, defaultataan 4004
            player.roles || null,
            parseWinrate(player),
        ];
    });
};

export { appendPlayerInfo, getPlayer };
