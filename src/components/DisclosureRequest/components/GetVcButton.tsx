import { useContext } from "react";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import { AppContext } from "../../AppProvider";
import { Button as ButtonWithLoader, StatusLabel } from "../../common";

const GetVcButton = ({
  handleGetFields,
  getVcSchemeSuccess,
  selectedContext,
}: {
  handleGetFields: () => Promise<void>;
  getVcSchemeSuccess?: boolean;
  selectedContext?: string;
}) => {
  const { activeLoaders, vcResponse } = useContext(AppContext);

  return (
    <>
      <ButtonWithLoader
        onClick={handleGetFields}
        text="Get VC Schema"
        disabled={!vcResponse}
        loading={activeLoaders.includes("handleGetFields")}
      />
      <StatusLabel
        isSuccess={
          activeLoaders.includes("handleGetFields")
            ? undefined
            : getVcSchemeSuccess
        }
        text={
          getVcSchemeSuccess ? "Get VC Schema Success" : "Get VC Schema Failed"
        }
      />
      {selectedContext ? (
        <a
          href={`${selectedContext}`}
          target="_blank"
          rel="noreferrer"
          className="mb-1"
        >
          <BoxArrowUpRight />
        </a>
      ) : null}
    </>
  );
};

export default GetVcButton;
