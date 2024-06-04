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
        <div className="rounded-md flex bg-red-400 px-2 py-1 w-fit mt-1">
          <p className="font-bold text-sm">
            Error Message - {globalWriteRequestErrorCause}
          </p>
        </div>
      ) : undefined}
    </>
  );
}

export default WriteRequestInfo;
