import { ResultType, fetchIPFSFile } from "./fetchIPFSFile";
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
    const [protocol] = url.split(":");

    if (
      url ===
      "https://ipfs.io/ipfs/QmdafSLzFLrTSp3fPG8CpcjH5MehtDFY4nxjr5CVq3z1rz"
    ) {
      return wrapResponse(url, {
        "@context": {
          "@version": 1.1,
          "@protected": true,
          name: "http://schema.org/name",
          description: "http://schema.org/description",
          identifier: "http://schema.org/identifier",
          auditor_template: {
            "@id": "https://example-credentials.org#auditor_template",
            "@context": {
              "@version": 1.1,
              "@protected": true,
              id: "@id",
              type: "@type",
              schema: "http://schema.org/",
              given_name: {
                "@id": "custom:given_name",
                "@type": "schema:text",
              },
              member_id: {
                "@id": "custom:member_id",
                "@type": "schema:text",
              },
              member_since: {
                "@id": "custom:member_since",
                "@type": "schema:text",
              },
              valid_until: {
                "@id": "custom:valid_until",
                "@type": "schema:text",
              },
            },
          },
        },
      });
    }

    let document: any;
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

    if (!document) {
      const error = `Failed to load document at: "${url}"`;
      throw new Error(error);
    }

    return wrapResponse(url, document);
  } catch (error) {
    console.log({ error });
  }
};
