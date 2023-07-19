import { Buffer } from "buffer";

interface JWK {
  kty: string;
  crv: string;
  x: string;
}

const getPublicKeyHexFromJwk = (jwk: JWK) => {
  const buffer = Buffer.from(jwk.x, "base64");
  const hex = buffer.toString("hex");

  return hex;
};

export default getPublicKeyHexFromJwk;
