"use client";

import {
  GlobalWriteRequestErrorCause,
  GlobalWriteRequestState,
} from "@/RecoilState";
import { useRecoilValue } from "recoil";

function WriteRequestInfo() {
  const globalWriteRequestState = useRecoilValue(GlobalWriteRequestState);
  const globalWriteRequestErrorCause = useRecoilValue(
    GlobalWriteRequestErrorCause
  );

  return (
    <>
      <p className="font-medium"> Status - {globalWriteRequestState}</p>
      {globalWriteRequestErrorCause ? (
        <p className="font-medium">
          Error Message - {globalWriteRequestErrorCause}
        </p>
      ) : undefined}
    </>
  );
}

export default WriteRequestInfo;
