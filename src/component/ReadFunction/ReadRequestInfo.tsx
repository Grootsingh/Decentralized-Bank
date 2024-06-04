"use client";

import {
  GlobalReadRequestErrorCause,
  GlobalReadRequestState,
} from "@/RecoilState";
import { useRecoilValue } from "recoil";

function ReadRequestInfo() {
  const globalReadRequestState = useRecoilValue(GlobalReadRequestState);
  const globalReadRequestErrorCause = useRecoilValue(
    GlobalReadRequestErrorCause
  );

  return (
    <>
      <p className="font-bold underline decoration-blue-500 underline-offset-2 decoration-2 w-fit">
        Read Function Request Info:
      </p>
      <p className="font-medium"> Status - {globalReadRequestState}</p>
      {globalReadRequestErrorCause ? (
        <div className="rounded-md flex bg-red-400 px-2 py-1 w-fit mt-1">
          <p className="font-bold text-sm">
            Error Message - {globalReadRequestErrorCause}
          </p>
        </div>
      ) : undefined}
    </>
  );
}

export default ReadRequestInfo;
