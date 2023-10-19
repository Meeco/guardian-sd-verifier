import { useContext } from "react";
import { EventKey } from "../../constants";
import { AppContext } from "../AppProvider";
import { AccordianToggleButton, Button, StatusLabel } from "../common";

const QueryRespondersButton = ({
  handleQueryResponders,
  getRespondersSuccess,
  getRespondersErrMsg,
  disabled,
}: {
  handleQueryResponders: () => Promise<void>;
  getRespondersSuccess?: boolean;
  getRespondersErrMsg: string;
  disabled?: boolean;
}) => {
  const {
    signer,
    activeLoaders,
    vcVerificaitonResult,
    presentationDefinition,
  } = useContext(AppContext);

  if (!signer) {
    return (
      <AccordianToggleButton
        text={"Connect to wallet"}
        eventKey={EventKey.HederaAccount}
      />
    );
  } else if (!vcVerificaitonResult) {
    return (
      <AccordianToggleButton
        text={"Complete Identity section"}
        eventKey={EventKey.Identity}
      />
    );
  } else if (!presentationDefinition) {
    return (
      <AccordianToggleButton
        text={
          "Complete Verifiable credential and Presentation definition section"
        }
        eventKey={EventKey.VCAndPresentationDefinition}
      />
    );
  } else {
    return (
      <>
        <Button
          disabled={disabled}
          onClick={handleQueryResponders}
          text="Query Responders"
          loading={activeLoaders.includes("handleQueryResponders")}
          requireApproval
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
