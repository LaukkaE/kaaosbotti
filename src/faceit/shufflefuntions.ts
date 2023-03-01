import { k_combinations, sortByHighest, sortByTeamBalance } from '../utils';
import { calcTotalTeamMmr, ParsedPlayer, sortTeam } from './faceitfunctions';

const NUMBERTORANDOMTEAMSFROM = 5;

const appendCaptain = (
    combinations: any[],
    captain: ParsedPlayer,
    poolMmr: number
) => {
    for (let i = 0; i < combinations.length; i++) {
        combinations[i].unshift(captain);
        combinations[i].push([
            'MMRDEVIATIONFROMAVG',
            Math.abs(calcTotalTeamMmr(combinations[i]) - poolMmr / 2),
        ]);
    }
    return combinations;
};
const randomATeam = (sortedTeams: any[]): ParsedPlayer[] => {
    let team = sortedTeams[Math.floor(Math.random() * NUMBERTORANDOMTEAMSFROM)]; // valitsee jonkun parhaiten balansoidusta
    team.pop(); //poista MMR
    team = sortTeam(team);
    return team;
};

const constructDireTeam = (
    radiant: ParsedPlayer[],
    playerpool: ParsedPlayer[],
    direCapWithMmr: ParsedPlayer
): ParsedPlayer[] => {
    const radiantToDelete = new Set(radiant);

    const team = [
        direCapWithMmr,
        ...playerpool
            .filter((e) => {
                return !radiantToDelete.has(e); //voi olla et ei toimi näin
            })
            .sort(sortByHighest),
    ];
    return team;
};

const generateTeamsWithShuffle = (playerList: ParsedPlayer[]) => {
    let poolMmr = calcTotalTeamMmr(playerList);
    let direCaptain = playerList.splice(5, 1)[0];
    let radiantCaptain = playerList.shift();
    // parsedPlayerList = removeCaptains(parsedPlayerList);
    let poolCombinations = k_combinations(playerList, 4);
    let appendedCombinations = appendCaptain(
        poolCombinations,
        radiantCaptain,
        poolMmr
    );
    appendedCombinations.sort(sortByTeamBalance);
    let teamRadiant = randomATeam(appendedCombinations);
    let teamDire = constructDireTeam(teamRadiant, playerList, direCaptain);
    return { teamRadiant, teamDire };
};

export {
    appendCaptain,
    randomATeam,
    constructDireTeam,
    generateTeamsWithShuffle,
};
