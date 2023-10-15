import { jest } from "@jest/globals";
import { promiseWithTimeout } from "./promiseWithTimeout";

describe("promiseWithTimeout", () => {
  it("should resolve promise", async () => {
    const promise = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => resolve(true));
    }) as any;
    const res = await promiseWithTimeout({ promise: promise(), time: 1000 });
    expect(res).toBe(true);
  });

  it("should reject error if timeout", async () => {
    let timeout;
    const promise = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        timeout = setTimeout(resolve, 600, true);
      });
    }) as any;

    try {
      await promiseWithTimeout({ promise: promise(), time: 100 });
    } catch (error) {
      expect((error as any).message).toBe("Promise timed out");
    }
    clearTimeout(timeout);
  });
});
