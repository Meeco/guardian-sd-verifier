import { Buffer } from "buffer";

interface JWK {
  kty: string;
  crv: string;
  x: string;
}

const derivePublicKeyHexFromJwk = (jwk: JWK) => {
  const buffer = decodeUrlSafe64(jwk.x);
  const hex = buffer.toString("hex");
  return hex;
};

function decodeUrlSafe64(base64: string) {
  // Add removed at end '='
  base64 += Array(5 - (base64.length % 4)).join("=");
  base64 = base64
    .replace(/-/g, "+") // Convert '-' to '+'
    .replace(/_/g, "/"); // Convert '_' to '/'

  return Buffer.from(base64, "base64");
}

export default derivePublicKeyHexFromJwk;
