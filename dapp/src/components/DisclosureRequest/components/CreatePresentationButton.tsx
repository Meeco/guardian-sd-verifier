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
}: {
  handleCreatePresentationRequest: () => void;
  createPresentationSuccess?: boolean;
}) => {
  const { loading, credentialKey } = useContext(AppContext);

  if (credentialKey) {
    return (
      <>
        <ButtonWithLoader
          onClick={handleCreatePresentationRequest}
          text="Create presentation"
          loading={loading.id === "createPresentationRequest"}
        />
        <StatusLabel
          isSuccess={
            loading.id === "createPresentationRequest"
              ? undefined
              : createPresentationSuccess
          }
          text={
            createPresentationSuccess ? "Created" : "Create Presentation Failed"
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
