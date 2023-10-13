import { describe, it, jest } from "@jest/globals";
import fetchJson from "./fetchJson";

describe("fetchJson", () => {
  it("should fetches json data", async () => {
    const json = () => ({
      key: "value",
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({ json, status: 200, ok: true })
    ) as unknown as jest.Mock;

    const response = await fetchJson({ url: "https://example.com/json" });
    expect(response).toEqual({
      key: "value",
    });
  });

  it("should call retry to call fetchJson", async () => {
    const json = () => ({
      key: "value",
    });

    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => Promise.reject({ ok: false }))
      .mockImplementationOnce(() => Promise.reject({ ok: false }))
      .mockImplementationOnce(() =>
        Promise.resolve({ json, status: 200, ok: true })
      ) as unknown as jest.Mock;

    const response = await fetchJson({
      url: "https://example.com/json",
      retry: 3,
    });
    expect(response).toEqual({
      key: "value",
    });
  });
});
