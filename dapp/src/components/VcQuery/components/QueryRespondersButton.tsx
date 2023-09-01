import { useContext } from "react";
import { EventKey } from "../../../constants";
import { AppContext } from "../../AppProvider";
import { AccordianToggleButton, Button, StatusLabel } from "../../common";

const QueryRespondersButton = ({
  handleQueryResponders,
  getRespondersSuccess,
  getRespondersErrMsg,
}: {
  handleQueryResponders: () => Promise<void>;
  getRespondersSuccess?: boolean;
  getRespondersErrMsg: string;
}) => {
  const { signer, activeLoaders, vcVerificaitonResult } =
    useContext(AppContext);

  if (!signer || !vcVerificaitonResult) {
    return (
      <AccordianToggleButton
        text={!signer ? "Connect to wallet" : "Complete Identity section"}
        eventKey={!signer ? EventKey.HederaAccount : EventKey.Identity}
      />
    );
  } else {
    return (
      <>
        <Button
          onClick={handleQueryResponders}
          text="Query Responders"
          loading={activeLoaders.includes("handleQueryResponders")}
        />
        <StatusLabel
          isSuccess={
            activeLoaders.includes("handleQueryResponders")
              ? undefined
              : getRespondersSuccess
          }
          text={
            getRespondersSuccess
              ? "Query Responders Success"
              : getRespondersErrMsg
          }
        />
      </>
    );
  }
};

export default QueryRespondersButton;
