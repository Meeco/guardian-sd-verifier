import { useContext } from "react";
import { EventKey } from "../../../constants";
import { AppContext } from "../../AppProvider";
import {
  AccordionToggleButton,
  Button as ButtonWithLoader,
  StatusLabel,
} from "../../common";

const CreatePresentationButton = ({
  handleCreatePresentationRequest,
  createPresentationSuccess,
  createPresentationErrMsg,
  disabled,
}: {
  handleCreatePresentationRequest: () => void;
  createPresentationSuccess?: boolean;
  createPresentationErrMsg: string;
  disabled: boolean;
}) => {
  const { activeLoaders, credentialVerificationKey } = useContext(AppContext);

  if (credentialVerificationKey) {
    return (
      <>
        <ButtonWithLoader
          disabled={disabled}
          onClick={handleCreatePresentationRequest}
          text="Create presentation"
          loading={activeLoaders.includes("createPresentationRequest")}
        />
        <StatusLabel
          isSuccess={
            activeLoaders.includes("createPresentationRequest")
              ? undefined
              : createPresentationSuccess
          }
          text={
            createPresentationSuccess
              ? "Created"
              : createPresentationErrMsg || "Create Presentation Failed"
          }
        />
      </>
    );
  } else {
    return (
      <AccordionToggleButton
        text="Complete Identity section"
        eventKey={EventKey.Identity}
      />
    );
  }
};

export default CreatePresentationButton;
