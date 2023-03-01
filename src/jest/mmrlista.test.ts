import { describe, expect, test } from '@jest/globals';
import {
    getFaceitPlayers,
    getMmrList,
    mmrlista,
    clearMmrList,
} from '../mmrlista';

jest.setTimeout(30000);

describe('MMRLista fetch tests', () => {
    test('Fetching mmrlist works', async () => {
        clearMmrList();
        await getMmrList();
        let length = Object.keys(mmrlista).length;
        console.log(`Google docs pelaajien määrä : ${length}`);
        expect(length).toBeGreaterThan(10);
    });
    test('Faceitdata fetch works', async () => {
        clearMmrList();
        await getFaceitPlayers();
        let length = Object.keys(mmrlista).length;
        console.log(`Faceit hubin pelaajien määrä : ${length}`);

        expect(length).toBeGreaterThan(10);
    });
});
