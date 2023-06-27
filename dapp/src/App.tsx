import { useEffect, useState } from "react";

import "./App.css";
import { initHashconnect, pairWallet } from "./hashConnect";
import { HashConnectTypes } from "hashconnect";
import buildCreateFileTransaction from "./fileCreate";



function App() {
  // const [hashConnectData, setHashConnectData] = useState<HashConnectTypes.InitilizationData | undefined>()
  const [pairingData, setPairingData] = useState<HashConnectTypes.SavedPairingData | undefined>()

  const existingInitDataPromise = initHashconnect()

  const accountIds = pairingData?.accountIds

  const handleSetPairingData = (val?: HashConnectTypes.SavedPairingData) => setPairingData(val)

  const pair = async () => {
    await pairWallet(handleSetPairingData);
    // setHashConnectData(initData)
  };

  useEffect(() => {
    existingInitDataPromise.then((initData) => {
      // setHashConnectData(initData)
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
        <button onClick={buildCreateFileTransaction}>Create File</button>
      </div>
    </div>
  );
}

export default App;
