export const IPFS_IO_IPFS_PROXY = `https://ipfs.io/ipfs/`;
export const CLOUDFLARE_IPFS_PROXY = `https://cloudflare-ipfs.com/ipfs/`;

export enum ResultType {
  TEXT,
  JSON,
  ARRAY_BUFFER,
}

/**
 * Get the text content of an IPFS file using the given HTTP proxy. By default
 * this is IPFS.io but you can also specify `CLOUDFLARE_IPFS_PROXY or your own.
 * Specify a `resultType` if you wish to get something other than text for the
 * result.
 *
 * A list of gateways can be found here: https://ipfs.github.io/public-gateway-checker/
 */
export async function fetchIPFSFile(
  cid: string,
  {
    resultType = ResultType.TEXT,
    httpProxy = IPFS_IO_IPFS_PROXY,
  }: { resultType?: ResultType; httpProxy?: string } = {}
) {
  return fetch(`${httpProxy}${cid}`).then((result) => {
    if (result.ok) {
      switch (resultType) {
        case ResultType.TEXT:
          return result.text();
        case ResultType.JSON:
          return result.json();
      }
      return result.arrayBuffer();
    }

    throw new Error(
      `Could not resolve CID "${cid}" via "${httpProxy}" - status was "${result.status}"`
    );
  });
}
