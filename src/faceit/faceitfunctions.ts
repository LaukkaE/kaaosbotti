import { mmrlista, Player } from '../mmrlista';
import { sortByHighest } from '../utils';

const parseTeam = (team: ParsedPlayer[]) => {
    let string = '';
    team.forEach((player) => {
        string += `**${player.parsedName}**[${player.mmr}] ${
            player.mmr === 4004 ? '** Ei löytynyt**' : '' // Kukaan ei sit ilmota MMR:n olevan 4004
        }${player.roles != null ? `: **${player.roles}**` : ''}\n`;
    });
    return string;
};
const parseCap = (cap: ParsedPlayer) => {
    return `**${cap.parsedName}**[${cap.mmr}]`;
};

const sortTeam = (team: ParsedPlayer[]) => {
    let cap = team.shift();
    team.sort(sortByHighest);
    team.unshift(cap);
    return team;
};

const calcTotalTeamMmr = (team: ParsedPlayer[]): number => {
    return team.reduce((acc, val) => {
        return acc + val.mmr;
    }, 0);
};

const parseWinrate = (player: Player): string => {
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

//
const getAliasFromList = (player: Player): string | null => {
    if (!player) return null;

    if (player.alias) {
        return `${player.alias}(${player.nickname})`;
    }
    return player.nickname;
};

//Poistaa kapteenit listasta, faceit antaa positioissa [0] ja [5], jos muuttuvat käytä filtteriä.
const removeCaptains = (list: ParsedPlayer[]): ParsedPlayer[] => {
    let tempList = [...list];
    tempList.splice(5, 1); //poista direcap
    tempList.shift(); //poista radcap
    // .filter(
    //     (player) =>
    //     !player?.nickname.toLowerCase().includes(`${radiantCap}`) &&
    //     !player?.nickname.toLowerCase().includes(`${direCap}`)
    // )
    return tempList;
};

export interface ParsedPlayer {
    nickname: string;
    parsedName: string;
    mmr: number;
    roles: string | null;
    parsedWinrate: string;
}

const appendPlayerInfo = (team: string[]): ParsedPlayer[] => {
    return team.map((e: string) => {
        let player =
            mmrlista[e.toLowerCase().replace(/ /g, '').substring(0, 7)];
        let playerObj: ParsedPlayer = {
            parsedName: getAliasFromList(player) || e,
            nickname: player?.nickname || e,
            mmr: player?.mmr || 4004,
            roles: player?.roles || null,
            parsedWinrate: parseWinrate(player),
        };
        return playerObj;
    });
};

export {
    appendPlayerInfo,
    getPlayer,
    calcTotalTeamMmr,
    sortTeam,
    parseTeam,
    parseCap,
    removeCaptains,
};
