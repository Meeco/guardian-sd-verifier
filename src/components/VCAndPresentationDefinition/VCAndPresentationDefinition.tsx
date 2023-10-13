import { useCallback, useContext, useMemo, useState } from "react";
import { Accordion, Button, Form, FormCheck, FormGroup } from "react-bootstrap";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import ReactJson from "react-json-view";
import { EventKey } from "../../constants";
import { ResultType, fetchIPFSFile } from "../../fileService";
import { downloadJson } from "../../utils";
import { AppContext } from "../AppProvider";
import CreatePresentationButton from "../DisclosureRequest/components/CreatePresentationButton";
import GetVcButton from "../DisclosureRequest/components/GetVcButton";
import createPresentationRequest from "../DisclosureRequest/createPresentationRequest";
import {
  AccordianToggleButton,
  Button as ButtonWithLoader,
  StatusLabel,
} from "../common";

const VCAndPresentationDefinition = () => {
  const {
    activeLoaders,
    addLoader,
    removeLoader,
    vcResponse,
    setVcResponse,
    cid,
    setCid,
    credentialVerificationKey,
    selectedMethod,
    verifiableCredential,
    setPresentationRequest,
  } = useContext(AppContext);

  const [selectedContext, setSelectedContext] = useState<string | undefined>();
  const [presentationDefinition, setPresentationDefinition] = useState<any>();

  const [selectableFields, setSelectableFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const [getVcSchemeSuccess, setGetVcSchemeSuccess] = useState<
    boolean | undefined
  >(undefined);
  const [createPresentationSuccess, setCreatePresentationSuccess] = useState<
    boolean | undefined
  >(undefined);
  const [createPresentationErrMsg, setCreatePresentationErrMsg] = useState("");

  const displayedFields = useMemo(
    () => selectableFields.filter((field) => field !== "select-all"),
    [selectableFields]
  );

  const credentialSubject = verifiableCredential?.credentialSubject;

  const handleFetchIpfs = async () => {
    try {
      addLoader("handleFetchIpfs");
      const file = await fetchIPFSFile(cid, { resultType: ResultType.JSON });
      setVcResponse(file);
      removeLoader("handleFetchIpfs");
    } catch (error) {
      setVcResponse(null);
      removeLoader("handleFetchIpfs");
      console.log({ error });
    }
  };

  const handleChangeCid = (e: React.ChangeEvent<any>) => {
    setCid(e.target.value);
  };

  const fetchVcResponseSuccess = vcResponse ? !!vcResponse?.id : undefined;

  const handleGetFields = useCallback(async () => {
    try {
      addLoader("handleGetFields");
      const selectedContext = vcResponse["@context"].filter((context: string) =>
        context.startsWith("https://ipfs.io/ipfs/")
      )[0];
      setSelectedContext(selectedContext);

      const contextDocument = await (await fetch(selectedContext)).json();

      const credentialSubjectType = vcResponse.credentialSubject.type;
      // setCredntialSubjectType(credentialSubjectType);

      const credentialContext =
        contextDocument["@context"][credentialSubjectType]["@context"];
      const contextFields = Object.keys(credentialContext);
      const preservedFields = [
        "@version",
        "@protected",
        "id",
        "type",
        "schema",
      ];
      const selectableFields = contextFields.filter(
        (field) => !preservedFields.includes(field)
      );
      setSelectableFields([...selectableFields, "select-all"]);
      setGetVcSchemeSuccess(true);
      removeLoader("handleGetFields");
    } catch (error) {
      removeLoader("handleGetFields");
      setGetVcSchemeSuccess(false);
      console.log({ error });
    }
  }, [addLoader, removeLoader, vcResponse]);

  const handleSelectAll = () => {
    if (selectedFields === selectableFields) {
      setSelectedFields([]);
    } else setSelectedFields(selectableFields);
  };

  const handleCreatePresentationRequest = () => {
    if (credentialVerificationKey) {
      try {
        createPresentationRequest({
          credentialSubject,
          credentialVerificationKey,
          selectedMethod,
          selectedFields,
          setCreatePresentationSuccess,
          addLoader,
          removeLoader,
          setPresentationRequest,
          setPresentationDefinition,
          vcResponse,
          verifiableCredential,
        });
        setCreatePresentationErrMsg("");
      } catch (error) {
        setCreatePresentationErrMsg(
          `${(error as any).message}, please try again`
        );
      }
    }
  };

  const handleSelectField = (e: React.ChangeEvent<any>) => {
    if (selectedFields.includes(e?.target.id)) {
      setSelectedFields((prevFields) =>
        prevFields.filter((field) => e.target.id !== field)
      );
    } else {
      setSelectedFields((prevFields) => [...prevFields, e.target.id]);
    }
  };

  return (
    <Accordion.Item eventKey={EventKey.VCAndPresentationDefinition}>
      <Accordion.Header>
        <b>Verifiable Credential/Presentation Definition&nbsp;</b>{" "}
        {vcResponse?.id ? `(${vcResponse?.id})` : ""}
      </Accordion.Header>
      <Accordion.Body>
        <p className="fst-italic">
          Create a request for selective disclosure of a discovered VC
        </p>
        <Form.Label>CID</Form.Label>
        <div className="d-flex align-items-center">
          <Form.Control
            type="text"
            placeholder="CID"
            onChange={handleChangeCid}
            className="w-50"
            value={cid}
          />
          {vcResponse ? (
            <a
              href={`https://ipfs.io/ipfs/${cid}`}
              target="_blank"
              rel="noreferrer"
              className="mx-2 mb-2"
            >
              <BoxArrowUpRight />
            </a>
          ) : null}
        </div>
        <div className="d-flex mt-3">
          <ButtonWithLoader
            onClick={handleFetchIpfs}
            text="Get VC"
            loading={activeLoaders.includes("handleFetchIpfs")}
            disabled={!cid}
          />
          <StatusLabel
            isSuccess={
              activeLoaders.includes("handleFetchIpfs")
                ? undefined
                : fetchVcResponseSuccess
            }
            text={vcResponse?.id ? `VC ID: ${vcResponse?.id}` : "Get VC Failed"}
          />
        </div>
        <div className="d-flex mt-2 align-items-center">
          <GetVcButton
            handleGetFields={handleGetFields}
            getVcSchemeSuccess={getVcSchemeSuccess}
            selectedContext={selectedContext}
          />
        </div>
        {selectableFields.length > 0 && (
          <>
            <FormGroup className="mt-3">
              <FormCheck
                key="select-all"
                id="select-all"
                type="checkbox"
                as="input"
                label="Select all"
                onChange={handleSelectAll}
                checked={selectedFields === selectableFields}
              />
              {displayedFields.map((field: string) => (
                <FormCheck
                  key={field}
                  id={field}
                  type="checkbox"
                  as="input"
                  label={field}
                  onChange={handleSelectField}
                  checked={selectedFields.includes(field)}
                />
              ))}
            </FormGroup>
            <div className="d-flex mt-3">
              <CreatePresentationButton
                handleCreatePresentationRequest={
                  handleCreatePresentationRequest
                }
                createPresentationSuccess={createPresentationSuccess}
                createPresentationErrMsg={createPresentationErrMsg}
              />
            </div>
            {presentationDefinition && (
              <Accordion className="mt-4">
                <Accordion.Item eventKey="presentationRequest">
                  <Accordion.Header>
                    <div className="d-flex w-100 align-items-center justify-content-between">
                      Presentation Definition
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    <ReactJson
                      src={presentationDefinition.presentation_definition}
                      name="presentation_definition"
                      theme={"monokai"}
                      collapseStringsAfterLength={30}
                      collapsed
                    />
                    <Button
                      className="me-3 mt-3"
                      variant="outline-primary"
                      onClick={() =>
                        downloadJson(
                          presentationDefinition.presentation_definition,
                          "presentation_request.json"
                        )
                      }
                    >
                      Download
                    </Button>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            )}
            {presentationDefinition ? (
              <div className="mt-3">
                <AccordianToggleButton
                  text="Next"
                  eventKey={EventKey.QueryResponders}
                />
              </div>
            ) : null}
          </>
        )}
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default VCAndPresentationDefinition;
