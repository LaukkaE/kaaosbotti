import { describe, expect, test } from '@jest/globals';

import { getMatchInfo, getLatestMatch } from '../routing';
import { parseUrl } from '../utils';

describe('URL parsing tests', () => {
    test('URL parsing works with correct matchID', () => {
        let result = parseUrl('1-c175754d-4c66-425d-8b98-b5d737d3ddcd');
        expect(result).toBe('1-c175754d-4c66-425d-8b98-b5d737d3ddcd');
    });
    test('URL parsing works with correct url', () => {
        let result = parseUrl(
            'https://www.faceit.com/fi/dota2/room/1-c175754d-4c66-425d-8b98-b5d737d3ddcd'
        );
        expect(result).toBe('1-c175754d-4c66-425d-8b98-b5d737d3ddcd');
    });
    test('URL parsing FAILS with malformatted matchID', () => {
        let result = parseUrl('Sectumsempra');
        expect(result).toBe('FAIL');
    });
    test('URL parsing FAILS with malformatted URL', () => {
        let result = parseUrl('www.google.com/asdasdasd');
        expect(result).toBe('FAIL');
    });
});

describe('Routing tests', () => {
    test('Getting matchinfo with matchid works', async () => {
        let data = await getMatchInfo('1-c175754d-4c66-425d-8b98-b5d737d3ddcd');
        expect(data).toBeInstanceOf(Object);
    });
    test('Getting matchinfo with wrong matchid fails', async () => {
        let data = await getMatchInfo('1-jaajaa-keskikaljaa');
        expect(data).toBe(null);
    });
    test('Getting latest match works', async () => {
        let data = await getLatestMatch();
        expect(data).toBeInstanceOf(Object);
    });
});
