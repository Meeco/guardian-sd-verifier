import { HashConnect } from "hashconnect";
import { useContext, useEffect, useState } from "react";
import { Accordion } from "react-bootstrap";
import "./App.css";
import {
  DisclosureRequest,
  HederaAccount,
  Identity,
  QueryResponders,
  VCAndPresentationDefinition,
} from "./components";
import { AppContext } from "./components/AppProvider";
import { EventKey } from "./constants";
import { initConnection } from "./hashConnectService";

function App() {
  const {
    network,
    setHashconnect,
    setHashConnectData,
    setAccountId,
    setSigner,
    setProvider,
  } = useContext(AppContext);

  const [hcInstance, setHcInstance] = useState<HashConnect>();

  useEffect(() => {
    //create the hashconnect instance
    const hashconnect = new HashConnect();
    setHcInstance(hashconnect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hcInstance)
      initConnection({
        network,
        hcInstance,
        setHashconnect,
        setHashConnectData,
        setAccountId,
        setSigner,
        setProvider,
      });
  }, [
    network,
    hcInstance,
    setHashConnectData,
    setHashconnect,
    setSigner,
    setAccountId,
    setProvider,
  ]);

  return (
    <div className="App">
      <div className="d-flex align-items-center">
        <img
          src="/hedera_guardian_logo.png"
          alt="hedera_guardian_logo"
          className="app-icon"
        />
        <div>
          <h1>Verifier</h1>
          <h3>Hedera Guardian Selective Disclosure</h3>
        </div>
      </div>
      <Accordion className="mt-4" defaultActiveKey={EventKey.HederaAccount}>
        <HederaAccount />
        <Identity />
        <VCAndPresentationDefinition />
        <QueryResponders />
        <DisclosureRequest />
      </Accordion>
    </div>
  );
}

export default App;
