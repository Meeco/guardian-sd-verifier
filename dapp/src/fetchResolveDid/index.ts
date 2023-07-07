const fetchResolveDid = async (did: string) => {
  const res = await fetch(`https://dev.uniresolver.io/1.0/identifiers/${did}`);

  return res.json();
};

export default fetchResolveDid;
