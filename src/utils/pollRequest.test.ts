import { jest } from "@jest/globals";
import pollRequest from "./pollRequest";

describe("pollRequest", () => {
  it("should return response when got response from requestFunction", async () => {
    const mockFunc = jest
      .fn()
      .mockImplementation(() => new Promise((resolve) => resolve(true))) as any;
    const res = await pollRequest(mockFunc, 3000);
    expect(res).toBe(true);
  });

  it("should call requestFunction again when we don't get response from requestFunction(within timeout)", async () => {
    const mockFetch = jest
      .fn()
      .mockReturnValueOnce("one")
      .mockReturnValueOnce("two");

    const requestFunction = jest.fn().mockImplementation(() => {
      const res = mockFetch();
      return new Promise((resolve) => {
        if (res === "two") resolve(true);
      });
    }) as any;

    const res = await pollRequest(requestFunction, 8000);
    expect(res).toBe(true);
    expect(requestFunction).toBeCalledTimes(2);
  }, 8000);
});
