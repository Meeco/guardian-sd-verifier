import { jest } from "@jest/globals";
import { fetchWithRetry } from "./fetchWithRetry";

describe("fetchWithRetry", () => {
  const url = "https://test.com";
  it("should retry and return fetch response", async () => {
    const text = "Hello";

    global.fetch = jest
      .fn()
      .mockImplementationOnce(async () => Promise.reject({ ok: false }))
      .mockImplementationOnce(async () => Promise.reject({ ok: false }))
      .mockImplementationOnce(async () => {
        return { text, status: 200, ok: true } as any;
      }) as unknown as jest.Mock;

    const res = await fetchWithRetry({
      url,
      retry: 2,
    });

    expect(res.text).toBe(text);
  });

  it('should reject error when retry attemp is more than "retry"', async () => {
    const text = "Hello";

    global.fetch = jest
      .fn()
      .mockImplementationOnce(async () => Promise.reject({ ok: false }))
      .mockImplementationOnce(async () => Promise.reject({ ok: false }))
      .mockImplementationOnce(async () => {
        return { text, status: 200, ok: true } as any;
      }) as unknown as jest.Mock;

    try {
      await fetchWithRetry({
        url,
        retry: 1,
      });
    } catch (error) {
      expect((error as any).message).toBe(`Could not fetch from "${url}"`);
    }
  });
});
