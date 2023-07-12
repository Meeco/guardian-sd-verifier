const fetchResolveDid = async (did: string) => {
  try {
    const res = await fetch(`http://localhost:8000/resolve-did/${did}`);
    return await res.json();
  } catch (error) {
    console.log({ error });
  }
};

export default fetchResolveDid

