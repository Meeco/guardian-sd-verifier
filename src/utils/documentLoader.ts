import { fetchResolveDid, resolveDid } from "../didService";
import { ResultType, fetchIPFSFile } from "../fileService";
import fetchJson from "./fetchJson";

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
      const didDocument = await resolveDid(did);

      document = didDocument;
    } else {
      switch (protocol) {
        case "did":
          document = await fetchResolveDid(url);
          break;
        case "ipfs":
          document = await fetchIPFSFile(url, { resultType: ResultType.JSON });
          break;
        case "https":
          document = await fetchJson({ url, retry: 3 });
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
