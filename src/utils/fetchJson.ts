import { fetchWithRetry } from "./fetchWithRetry";

const fetchJson = async ({ url, retry }: { url: string; retry?: number }) => {
  const fetchFunction = retry ? fetchWithRetry({ url, retry }) : fetch(url);
  return fetchFunction
    .then(async (result) => {
      if (result.ok) {
        return await result.json();
      }

      throw new Error(
        `Could not fetch "${url}" - status was "${result.status}"`
      );
    })
    .catch((err) => {
      console.log(err);
      throw new Error(`Could not fetch from "${url}"`);
    });
};

export default fetchJson;
