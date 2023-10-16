import derivePublicKeyHexFromJwk from "./derivePublicKeyHexFromJwk";

describe("derivePublicKeyHexFromJwk", () => {
  it("should derive publicKeyHex from JWK", async () => {
    const mockPublicKeyhex =
      "bad154c10b608d71394137f30b6f8e3bc39692a7d6a71668e88e37a511e92dfe";
    const mockPublicJwk = {
      kty: "OKP",
      crv: "Ed25519",
      x: "utFUwQtgjXE5QTfzC2-OO8OWkqfWpxZo6I43pRHpLf4",
    };

    const publicKeyhex = derivePublicKeyHexFromJwk(mockPublicJwk);

    expect(publicKeyhex).toBe(mockPublicKeyhex);
  });
});
