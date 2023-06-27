const getTransactionBytesString = async () => {
  const res = await fetch("http://localhost:8000/tx-bytes-string");
  return res.json();
};

export default getTransactionBytesString;
