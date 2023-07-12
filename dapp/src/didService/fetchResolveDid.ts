const fetchResolveDid = async (did: string) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_VERIFIER_SERVER_URL}/resolve-did/${did}`);
    return await res.json();
  } catch (error) {
    console.log('Fetch resolve did failed', error);
  }
};

export default fetchResolveDid

