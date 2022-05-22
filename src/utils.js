const k_combinations = (set, k) => {
    if (k > set.length || k <= 0) {
        return [];
    }

    if (k == set.length) {
        return [set];
    }

    if (k == 1) {
        return set.reduce((acc, cur) => [...acc, [cur]], []);
    }

    let combs = [],
        tail_combs = [];

    for (let i = 0; i <= set.length - k + 1; i++) {
        tail_combs = k_combinations(set.slice(i + 1), k - 1);
        for (let j = 0; j < tail_combs.length; j++) {
            combs.push([set[i], ...tail_combs[j]]);
        }
    }

    return combs;
};
const sortByTeamBalance = (a, b) => {
    if (a[5][1] === b[5][1]) {
        return 0;
    } else {
        return a[5][1] < b[5][1] ? -1 : 1;
    }
};

const sortByHighest = (a, b) => {
    if (a[1] === b[1]) {
        return 0;
    } else {
        return a[1] < b[1] ? 1 : -1;
    }
};

const parseUrl = (string) => {
    if (!string) return null;
    let test = string.split('/room/')[1];
    if (!test) {
        return string;
    }
    return test;
};

module.exports = { k_combinations, sortByTeamBalance, sortByHighest, parseUrl };
