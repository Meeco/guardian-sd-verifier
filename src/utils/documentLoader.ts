import * as ed25519 from "@transmute/did-key-ed25519";
import { ResultType, fetchIPFSFile } from "../fileService";
import fetchJson from "./fetchJson";
import resolveDidDocument from "./resolveDid";

const wrapResponse = (url: string, document: any) => {
  return {
    contextUrl: null,
    document,
    documentUrl: url,
  };
};

export const documentLoader = async (url: string) => {
  try {
    let document: any;

    const [protocol] = url.split(":");

    if (url.startsWith("did:key")) {
      const [did] = url.split("#");
      const { didDocument } = await ed25519.resolve(did, {
        accept: "application/did+json",
      });

      document = didDocument;
    } else {
      switch (protocol) {
        case "did":
          document = await resolveDidDocument(url);
          break;
        case "ipfs":
          document = await fetchIPFSFile(url, { resultType: ResultType.JSON });
          break;
        case "https":
          document = await fetchJson(url);
          break;
        default:
          throw new Error(
            `Refused to load document "${url}" - unsupported protocol`
          );
      }
    }

    if (!document) {
      const error = `Failed to load document at: "${url}"`;
      throw new Error(error);
    }

    return wrapResponse(url, document);
  } catch (error) {
    console.log({ error });
  }
};
