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
    const promise = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => setTimeout(resolve, 6000, true));
    }) as any;

    try {
      await promiseWithTimeout({ promise: promise(), time: 1000 });
    } catch (error) {
      expect((error as any).message).toBe("Promise timed out");
    }
  });
});
