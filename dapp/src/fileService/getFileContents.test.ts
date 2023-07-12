import { FileContentsQuery } from "@hashgraph/sdk";
import getFileContents from "./getFileContents";

describe('getFileContents', () => {
    const client = {} as any;
    const fileId = '0.0.123';

    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should get file contents successfully', async () => {
        const mockQuery = jest
            .fn()
            .mockResolvedValue(Buffer.from('{"x":5,"y":6}'));

        const setFileId = jest.spyOn(FileContentsQuery.prototype, 'setFileId');
        const setMaxAttempts = jest.spyOn(
            FileContentsQuery.prototype,
            'setMaxAttempts'
        );
        jest
            .spyOn(FileContentsQuery.prototype, 'execute')
            .mockImplementation(mockQuery);

        const contents = await getFileContents(client, fileId);

        expect(setFileId).toHaveBeenCalledWith('0.0.123');
        expect(setMaxAttempts).toHaveBeenCalledWith(2);

        expect(mockQuery).toHaveBeenCalledWith(client);
        expect(contents).toEqual({ x: 5, y: 6 });
    });

    it('should handle getting file contents failures', async () => {
        jest
            .spyOn(FileContentsQuery.prototype, 'execute')
            .mockRejectedValue(new Error("Failed to get file contents"));

        const logSpy = jest.spyOn(console, 'log');

        const contents = await getFileContents(client, fileId);

        expect(contents).toBe(undefined);
        expect(logSpy).toHaveBeenCalledWith(
            'Get file contents failed',
            new Error('Failed to get file contents')
        );
    });
});