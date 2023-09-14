const fetchJson = async (url: string) => {
  return fetch(url)
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
