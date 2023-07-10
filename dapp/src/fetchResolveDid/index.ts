const fetchResolveDid = async (did: string) => {
  const res = await fetch(`http://localhost:8000/resolve-did/${did}`);

  return res.json();
};

export default fetchResolveDid;
