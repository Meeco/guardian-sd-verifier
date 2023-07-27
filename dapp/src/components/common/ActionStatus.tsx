import React from "react";
import { CheckCircle, XCircle } from "react-bootstrap-icons";

export enum ActionStatus {
  Success = "Success",
  Failed = "Failed",
}

interface StatusLabelProps {
  status: ActionStatus;
  text: string;
}

const StatusLabel: React.FC<StatusLabelProps> = ({ status, text }) => {
  return (
    <div className="d-flex algin-items-center mx-2">
      <div className="d-flex align-items-center">
        {status === ActionStatus.Success ? (
          <>
            <CheckCircle color="green" className="mx-1" />
            {text}
          </>
        ) : (
          <>
            <XCircle color="red" className="mx-1" />
            {text}
          </>
        )}
      </div>
    </div>
  );
};

export default StatusLabel;
