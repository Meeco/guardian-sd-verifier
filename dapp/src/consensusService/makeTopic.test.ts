import { TopicCreateTransaction } from "@hashgraph/sdk";
import makeTopic from "./makeTopic";

describe('makeTopic', () => {
    const client = {} as any;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should make a topic successfully', async () => {
        const executeMock = jest
            .spyOn(TopicCreateTransaction.prototype, 'execute')
            .mockResolvedValueOnce({
                getReceipt: jest.fn().mockResolvedValueOnce({ topicId: '0.0.123' }),
            } as any);

        const topicId = await makeTopic(client);
        expect(executeMock).toHaveBeenCalledWith(client);
        expect(topicId).toBe('0.0.123');
    }, 10000);

    it('should handle making topic failures', async () => {
        jest
            .spyOn(TopicCreateTransaction.prototype, 'execute')
            .mockRejectedValueOnce(new Error('Failed to making topic'));

        const logSpy = jest.spyOn(console, 'log');

        const topicId = await makeTopic(client);

        expect(topicId).toBe(undefined);
        expect(logSpy).toHaveBeenCalledWith(
            'Make topic failed',
            new Error('Failed to making topic')
        );
    }, 10000);
});