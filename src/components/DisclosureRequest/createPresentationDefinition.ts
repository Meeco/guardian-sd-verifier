import { v4 as uuidv4 } from "uuid";

export const createPresentationDefinition = (
  id: string,
  selectedFields: string[]
) => {
  const path = selectedFields.map((field) => `$.credentialSubject.${field}`);
  return {
    presentation_definition: {
      id: uuidv4(),
      input_descriptors: [
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
                path,
              },
            ],
          },
        },
      ],
    },
  };
};
