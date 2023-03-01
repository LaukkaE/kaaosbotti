import { describe, expect, test } from '@jest/globals';
import { getFaceitPlayers, getMmrList } from '../mmrlista';
import { webHookMmr, webHookPool, webHookShuffle } from '../webhookfunctions';

const sampleData = {
    event: 'match_status_configuring',
    payload: {
        id: '1-5867182e-c5c8-43da-81ef-70207d9344ad',
        teams: [
            {
                roster: [
                    {
                        nickname: 'kapu_-',
                    },
                    {
                        nickname: 'axpa10',
                    },
                    {
                        nickname: 'Stonetroll',
                    },
                    {
                        nickname: 'Darbaaax',
                    },
                    {
                        nickname: 'Uuzo',
                    },
                ],
            },
            {
                roster: [
                    {
                        nickname: 'flehm',
                    },
                    {
                        nickname: 'klashbert',
                    },
                    {
                        nickname: 'Thomppu',
                    },
                    {
                        nickname: 'Sepeli',
                    },
                    {
                        nickname: 'Jaasz',
                    },
                ],
            },
        ],
    },
};

jest.setTimeout(30000);

beforeAll(async () => {
    await getMmrList();
    console.log('google docs fetch');
    await getFaceitPlayers();
    console.log('faceitdata fetch');
});

describe('WebhookFunction tests', () => {
    test('Webhookpool returns discord embed', async () => {
        let result = await webHookPool(
            '1-c175754d-4c66-425d-8b98-b5d737d3ddcd'
        );
        expect(result).toBeInstanceOf(Object);
    });
    test('WebhookShuffle returns embed', async () => {
        let result = await webHookShuffle(
            '1-c175754d-4c66-425d-8b98-b5d737d3ddcd'
        );
        expect(result).toBeInstanceOf(Object);
    });
    test('WebhookMMR works with sample data', () => {
        let result = webHookMmr(sampleData);
        expect(result).toBeInstanceOf(Object);
    });
    test('WebhookMMR fails with no data', () => {
        let result = webHookMmr({});
        expect(result).toBe(null);
    });
});
