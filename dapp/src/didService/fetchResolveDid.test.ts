import mockDidDoc from '../mock/did_document.json';
import fetchResolveDid from './fetchResolveDid';
describe('fetchResolveDid', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch resolve did successfully', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(mockDidDoc),
            }),
        ) as jest.Mock;

        const data = await fetchResolveDid('123');
        expect(data).toEqual(mockDidDoc);
    });

    it('should handle fetch resolve did failures', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Failed to resolve did'));

        const logSpy = jest.spyOn(console, 'log');

        const data = await fetchResolveDid('123');
        expect(data).toBe(undefined);
        expect(logSpy).toHaveBeenCalledWith(
            'Fetch resolve did failed',
            new Error('Failed to resolve did')
        );

    });
});