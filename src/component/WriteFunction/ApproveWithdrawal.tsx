"use client";
import { useWriteToContractFn } from "@/HelperHooks";
import React from "react";
import { useRecoilValue } from "recoil";
import { GlobalWriteRequestState } from "@/RecoilState";
import { watchContractEvent } from "wagmi/actions";
import { config } from "@/wagmi";
import { contractAddress } from "@/Constant";
import abi from "../../../ABI";
import { formatUnits } from "viem";

interface DepositEmitType {
  approvedBy: `0x${string}`[];
  approvalLeftFrom: `0x${string}`[];
  isReadyToWithdraw: boolean;
  timestamp: number;
}

interface CustomLogType {
  eventName: "approved";
  args: {
    approvedBy: `0x${string}`[];
    approvalLeftFrom: `0x${string}`[];
    isReadyToWithdaw: boolean;
    timestamp: bigint;
  };
}

function ApproveWithdrawal() {
  const [accountID, setAccountID] = React.useState("");
  const [withdrawID, setWithdrawID] = React.useState("");
  const [error, setError] = React.useState("");
  const writeToContractFn = useWriteToContractFn();
  const [approveEmit, setApproveEmit] = React.useState<DepositEmitType>();
  const globalWriteRequestState = useRecoilValue(GlobalWriteRequestState);
  const unwatchRef = React.useRef<() => void>();
  const [emitState, setEmitState] = React.useState<
    "idle" | "loading" | "success"
  >("idle");
  const [isClicked, setClicked] = React.useState<"approveWithdrawal" | "">("");
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
    setClicked("approveWithdrawal");
    setError("");
    writeToContractFn(
      "approveWithdrawal",
      0,
      BigInt(accountIDNumber),
      BigInt(withdrawIDNumber)
    );
  }

  React.useEffect(() => {
    if (
      globalWriteRequestState === "success" &&
      isClicked === "approveWithdrawal"
    ) {
      setEmitState("loading");
      setClicked("");
      setAccountID("");
      setWithdrawID("");

      const unwatch = watchContractEvent(config, {
        address: contractAddress,
        abi,
        eventName: "approved",
        onLogs(logs) {
          //@ts-ignore
          const data: CustomLogType = logs[0];
          setTimeout(() => {
            if (data.eventName === "approved") {
              const timestampNum =
                Number(formatUnits(data?.args.timestamp, 1)) * 10;

              const approveByWithOutZeroAddress = data.args.approvedBy.filter(
                (eachAddress) =>
                  eachAddress !== "0x0000000000000000000000000000000000000000"
              );
              const approvalLeftFromWithOutZeroAddress =
                data.args.approvalLeftFrom.filter(
                  (eachAddress) =>
                    eachAddress !== "0x0000000000000000000000000000000000000000"
                );

              setApproveEmit({
                approvedBy: approveByWithOutZeroAddress,
                approvalLeftFrom: approvalLeftFromWithOutZeroAddress,
                isReadyToWithdraw: data.args.isReadyToWithdaw,
                timestamp: timestampNum,
              });
            }
          }, 0);
        },
      });

      unwatchRef.current = unwatch;
      () => unwatch();
    }
  }, [globalWriteRequestState]);

  React.useEffect(() => {
    if (typeof unwatchRef.current === "function") {
      unwatchRef?.current();
      setEmitState("success");
      setClicked("");
    }
  }, [approveEmit?.timestamp]);

  return (
    <div className="flex flex-col gap-1">
      <p className="font-semibold">Approve withdrawal request</p>
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
                  className="ring-2 rounded-md h-[30px] pl-1 w-full min-w-10"
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

          {emitState === "success" ? (
            <div className="rounded-md flex bg-green-400 px-2 py-1 w-fit mt-1">
              <p className="text-xs font-bold pr-1 text-nowrap text-gray-950">
                Emit -
              </p>
              <p className="text-xs font-bold text-gray-950">
                {JSON.stringify(approveEmit, null, 2)}
              </p>
            </div>
          ) : undefined}
          {emitState === "loading" ? (
            <div className="rounded-md flex bg-green-400 px-2 py-1 w-fit mt-1">
              <p className="text-xs font-bold pr-1 text-nowrap text-gray-950">
                Loading...
              </p>
            </div>
          ) : undefined}
        </div>

        <button
          onClick={handleApprovealRequest}
          className="rounded-md bg-blue-500 font-semibold text-white mr-2 shrink-0 w-fit px-2 py-1 h-fit"
        >
          Approve Request
        </button>
      </div>
    </div>
  );
}

export default ApproveWithdrawal;
