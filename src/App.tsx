import { useContext, useEffect } from "react";
import { Accordion } from "react-bootstrap";
import "./App.css";
import {
  DisclosureRequest,
  HederaAccount,
  Identity,
  VcQuery,
} from "./components";
import { AppContext } from "./components/AppProvider";
import { EventKey } from "./constants";
import { initConnection } from "./hashConnectService";

function App() {
  const { setHashconnect, setHashConnectData, setAccountId, setSigner } =
    useContext(AppContext);

  useEffect(() => {
    initConnection({
      setHashconnect,
      setHashConnectData,
      setAccountId,
      setSigner,
    });
  }, [setHashConnectData, setHashconnect, setSigner, setAccountId]);

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
        <VcQuery />
        <DisclosureRequest />
      </Accordion>
    </div>
  );
}

export default App;