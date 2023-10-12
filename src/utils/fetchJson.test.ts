import { describe, expect, it, jest } from "@jest/globals";
import fetchJson from "./fetchJson";

describe("fetchJson", () => {
  it("fetches json data", async () => {
    const json = () => ({
      key: "value",
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({ json, status: 200, ok: true })
    ) as unknown as jest.Mock;

    const response = await fetchJson("https://example.com/json");
    expect(response).toEqual({
      key: "value",
    });
  });
});
