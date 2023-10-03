import { useContext, useEffect } from "react";
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
    setHashconnect,
    setHashConnectData,
    setAccountId,
    setSigner,
    setProvider,
  } = useContext(AppContext);

  useEffect(() => {
    initConnection({
      setHashconnect,
      setHashConnectData,
      setAccountId,
      setSigner,
      setProvider,
    });
  }, [
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
