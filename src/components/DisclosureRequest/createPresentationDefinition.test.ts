import { createPresentationDefinition } from "./createPresentationDefinition";

describe("createPresentationDefinition", () => {
  const id = "urn:uuid:688daba5-fbd4-4643-8f9e-eb11289f5cfb";
  it("should create presentation definition successfully", () => {
    const selectedFields = ["field0", "field1", "field2"];
    const presentationDefinition = createPresentationDefinition(
      id,
      selectedFields
    );

    expect(
      JSON.stringify(
        presentationDefinition.presentation_definition.input_descriptors
      )
    ).toBe(
      JSON.stringify([
        {
          id: "audit",
          name: "Audit Report Request",
          purpose: "Require further information to complete audit report.",
          constraints: {
            fields: [
              {
                path: ["$.id"],
                filter: {
                  type: "string",
                  const: id, //vc.id
                },
              },
              {
                path: [
                  "$.credentialSubject.field0",
                  "$.credentialSubject.field1",
                  "$.credentialSubject.field2",
                ],
              },
            ],
          },
        },
      ])
    );
  });
});
