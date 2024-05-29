"use client";
import { contractAddress } from "@/Constant";
import { useReadToContractFn, useWriteToContractFn } from "@/HelperHooks";
import React from "react";
import { formatUnits, isAddress } from "viem";
import abi from "../../../ABI";

import { useSetRecoilState } from "recoil";
import {
  GlobalReadRequestErrorCause,
  GlobalReadRequestState,
} from "@/RecoilState";

function GetWithdrawApproveBy() {
  const [accountID, setAccountID] = React.useState("");
  const [withdrawID, setWithdrawID] = React.useState("");
  const [approvedBy, setApprovedBy] = React.useState<string[]>([]);
  const [error, setError] = React.useState("");
  const readToContractFn = useReadToContractFn();
  const setGlobalReadRequestState = useSetRecoilState(GlobalReadRequestState);
  const setGlobalReadRequestErrorCause = useSetRecoilState(
    GlobalReadRequestErrorCause
  );
  function handleApprovealRequest() {
    if (!accountID) {
      return setError("accountID required");
    }
    if (isNaN(Number(accountID))) {
      return setError("accountID required to be Number");
    }
    if (!withdrawID) {
      return setError("withdrawID required");
    }
    if (isNaN(Number(withdrawID))) {
      return setError("withdrawID required to be Number");
    }
    const accountIDNumber = Number(accountID);
    const withdrawIDNumber = Number(withdrawID);

    readToContractFn(
      "getWithdrawApproveBy",
      BigInt(accountIDNumber),
      BigInt(withdrawIDNumber)
    ).then((result) => {
      if (Array.isArray(result) && result.length === 0) {
        setGlobalReadRequestErrorCause("Invalid AccountID");
        setGlobalReadRequestState("error");
      } else if (Array.isArray(result) && result.length > 0) {
        const approveByWithOutZeroAddress = result.filter(
          (eachAddress) =>
            eachAddress !== "0x0000000000000000000000000000000000000000"
        );
        setApprovedBy(approveByWithOutZeroAddress);
        setGlobalReadRequestState("success");
        setAccountID("");
        setWithdrawID("");
        setError("");
      }
    });
  }

  React.useEffect(() => {
    if (error) {
      setApprovedBy([]);
    }
  }, [error]);

  return (
    <div className="flex flex-col gap-1">
      <p className="font-semibold">
        Know who have approved the withdrawal request
      </p>
      <div className="flex gap-2">
        <div className="flex flex-col">
          <div className="flex gap-2">
            <div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="accountID"
                  className="font-semibold text-sm pr-1 text-nowrap"
                >
                  AccountId :
                </label>
                <input
                  type="text"
                  name="accountID"
                  id="accountID"
                  className="ring-2 rounded-md h-[30px] pl-1 w-full min-w-10"
                  value={accountID}
                  onChange={(event) => setAccountID(event.target.value)}
                  placeholder="1"
                  required={true}
                />
              </div>

              {error === "accountID required" ||
              error === "accountID required to be Number" ? (
                <p className="text-xs font-bold text-red-500 mt-1">
                  Error - {error}
                </p>
              ) : undefined}
            </div>
            <div>
              <div className="flex items-center gap-2 ">
                <label
                  htmlFor="withdrawID"
                  className="font-semibold text-sm text-nowrap"
                >
                  WithdrawId :
                </label>
                <input
                  type="text"
                  name="withdrawID"
                  id="withdrawID"
                  className="ring-2 rounded-md h-[30px] pl-1  w-full min-w-10"
                  value={withdrawID}
                  onChange={(event) => setWithdrawID(event.target.value)}
                  placeholder="1"
                  required={true}
                />
              </div>

              {error === "withdrawID required" ||
              error === "withdrawID required to be Number" ? (
                <p className="text-xs font-bold text-red-500 mt-1">
                  Error - {error}
                </p>
              ) : undefined}
            </div>
          </div>
        </div>

        <button
          onClick={handleApprovealRequest}
          className="rounded-md bg-blue-500 shrink-0 font-semibold text-white mr-2 w-fit px-2 py-1 h-fit"
        >
          Get ApprovedBy
        </button>
      </div>
      {approvedBy.length > 0 ? (
        <p className="font-medium">
          approvedByUser : {JSON.stringify(approvedBy, null, 2)}
        </p>
      ) : undefined}
    </div>
  );
}

export default GetWithdrawApproveBy;
