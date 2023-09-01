import { useContext } from "react";
import { EventKey } from "../../../constants";
import { AppContext } from "../../AppProvider";
import {
  AccordianToggleButton,
  Button as ButtonWithLoader,
  StatusLabel,
} from "../../common";

const CreatePresentationButton = ({
  handleCreatePresentationRequest,
  createPresentationSuccess,
  createPresentationErrMsg,
}: {
  handleCreatePresentationRequest: () => void;
  createPresentationSuccess?: boolean;
  createPresentationErrMsg: string;
}) => {
  const { activeLoaders, credentialVerificationKey } = useContext(AppContext);

  if (credentialVerificationKey) {
    return (
      <>
        <ButtonWithLoader
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
      <AccordianToggleButton
        text="Complete Identity section"
        eventKey={EventKey.Identity}
      />
    );
  }
};

export default CreatePresentationButton;
