import jsonldSignatures from "jsonld-signatures";

const { extendContextLoader } = jsonldSignatures;

export const documentLoader = extendContextLoader(async (url: string) => {
  if (
    url ===
    "https://ipfs.io/ipfs/QmdafSLzFLrTSp3fPG8CpcjH5MehtDFY4nxjr5CVq3z1rz"
  ) {
    return {
      contextUrl: null,
      documentUrl: url,
      document: {
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
      },
    };
  }
  return {
    contextUrl: null,
    documentUrl: url,
    document: await await fetch(url).then((res) => res.json()),
  };
});
