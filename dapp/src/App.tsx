import { useEffect, useState } from "react";

import "./App.css";
import { initHashconnect, pairWallet } from "./hashConnect";
import { HashConnectTypes } from "hashconnect";



function App() {
  const [hashConnectData, setHashConnectData] = useState<HashConnectTypes.InitilizationData | undefined>()
  const [pairingData, setPairingData] = useState<HashConnectTypes.SavedPairingData | undefined>()

  const hashConnectPromise = initHashconnect()

  const accountIds = pairingData?.accountIds

  const handleSetPairingData = (val?: HashConnectTypes.SavedPairingData) => setPairingData(val)

  const pair = async () => {
    const initData = await pairWallet(hashConnectPromise, handleSetPairingData);
    setHashConnectData(initData)
  };

  useEffect(() => {
    hashConnectPromise.then(({ hashconnect, initData }) => {
      setHashConnectData(initData)
      setPairingData(initData?.savedPairings[0])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  return (
    <div className="App">
      <div className="card">
        {accountIds && (
          <>
            <p>Account IDs:</p>
            <p>{accountIds}</p>
          </>
        )}
        {/* {pairingString && (
          <>
            <h1>Pairing string:</h1>
            <p>{pairingString}</p>
          </>
        )} */}
        <button onClick={pair}>Pair wallet</button>
      </div>
    </div>
  );
}

export default App;
