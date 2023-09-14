import React, { useMemo } from "react";
import { CheckCircle, XCircle } from "react-bootstrap-icons";

export enum ActionStatus {
  Idle = "Idle",
  Success = "Success",
  Failed = "Failed",
}

interface StatusLabelProps {
  isSuccess: boolean | undefined;
  text: string;
}

const StatusLabel: React.FC<StatusLabelProps> = ({ isSuccess, text }) => {
  const status = useMemo(() => {
    if (isSuccess) {
      return ActionStatus.Success;
    }
    if (isSuccess === false) {
      return ActionStatus.Failed;
    } else return ActionStatus.Idle;
  }, [isSuccess]);

  return status === ActionStatus.Idle ? null : (
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
