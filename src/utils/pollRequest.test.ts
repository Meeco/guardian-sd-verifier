import { jest } from "@jest/globals";
import pollRequest from "./pollRequest";

describe("pollRequest", () => {
  it("should return response when got response from requestFunction", async () => {
    const mockFunc = jest.fn().mockImplementation(async () => {
      return {
        data: 123,
      } as any;
    }) as unknown as jest.Mock;
    const res = (await pollRequest(mockFunc, 300, 300)) as any;
    expect(res.data).toBe(123);
  });

  it("should call requestFunction again when we don't get response from requestFunction(within timeout)", async () => {
    const mockFetch = jest
      .fn()
      .mockImplementationOnce(async () => Promise.reject({ ok: false }))
      .mockImplementationOnce(async () => Promise.reject({ ok: false }))
      .mockImplementationOnce(async () => Promise.reject({ ok: false }))
      .mockImplementationOnce(async () => {
        return {
          data: 123,
        } as any;
      }) as unknown as jest.Mock;

    const res = (await pollRequest(mockFetch, 1500, 300)) as any;
    expect(res.data).toBe(123);
    expect(mockFetch).toBeCalledTimes(4);
  });
});
