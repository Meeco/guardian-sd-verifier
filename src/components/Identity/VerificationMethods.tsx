import React from "react";
import { Form } from "react-bootstrap";

interface VerificationMethodsProps {
  // Verification methods from DID document
  verificationMethods: any;
  selectedMethod: any;
  setSelectedMethod: React.Dispatch<any>;
}

const VerificationMethods: React.FC<VerificationMethodsProps> = ({
  verificationMethods,
  selectedMethod,
  setSelectedMethod,
}) => {
  const getDisplayedMethod = (input: string) => {
    const index = input.indexOf("#");
    if (index !== -1) {
      return input.slice(index + 1);
    }
    return null;
  };

  return (
    <div className="verification-method">
      {verificationMethods
        ? verificationMethods.map((item: any) => (
            <Form.Check
              key={item.id}
              checked={
                selectedMethod ? selectedMethod.id === item.id : undefined
              }
              type="radio"
              label={`#${getDisplayedMethod(item.id)} (${item.type})`}
              id={item.id}
              onChange={() => {
                setSelectedMethod(item);
              }}
            />
          ))
        : null}
    </div>
  );
};

export default VerificationMethods;
