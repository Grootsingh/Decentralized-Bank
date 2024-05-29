"use client";
import { contractAddress } from "@/Constant";
import { useWriteToContractFn } from "@/HelperHooks";
import React from "react";
import { formatUnits, parseEther } from "viem";
import abi from "../../../ABI";
import { watchContractEvent } from "wagmi/actions";
import { config } from "@/wagmi";
import { useRecoilValue } from "recoil";
import { GlobalWriteRequestState } from "@/RecoilState";

interface DepositEmitType {
  requestedBy: `0x${string}`;
  accountID: number;
  withdrawID: number;
  requestedAmount: string;
  timestamp: number;
}

interface CustomLogType {
  eventName: "WithdrawRequested";
  args: {
    requestedBy: `0x${string}`;
    accountID: bigint;
    withdrawID: bigint;
    requestedAmount: bigint;
    timestamp: bigint;
  };
}

function RequestWithdrawal() {
  const [accountID, setAccountID] = React.useState("");
  const [requestedAmount, setRequestedAmount] = React.useState("");
  const [error, setError] = React.useState("");
  const writeToContractFn = useWriteToContractFn();
  const [requestWithdrawalEmit, setRequestWithdrawalEmit] =
    React.useState<DepositEmitType>();
  const globalWriteRequestState = useRecoilValue(GlobalWriteRequestState);
  const unwatchRef = React.useRef<() => void>();
  function handleRequestWithdrawal() {
    if (!accountID) {
      return setError("accountID required");
    }
    if (isNaN(Number(accountID))) {
      return setError("accountID required to be Number");
    }
    if (!requestedAmount) {
      return setError("requestedAmount required");
    }
    if (isNaN(Number(requestedAmount))) {
      return setError("requestedAmount required to be Number");
    }
    const accountIDNumber = Number(accountID);

    writeToContractFn(
      "requestWithdrawal",
      0,
      BigInt(accountIDNumber),
      parseEther(requestedAmount)
    );
    setError("");
  }

  React.useEffect(() => {
    if (globalWriteRequestState === "success") {
      setAccountID("");
      setRequestedAmount("");

      const unwatch = watchContractEvent(config, {
        address: contractAddress,
        abi,
        eventName: "WithdrawRequested",
        onLogs(logs) {
          //@ts-ignore
          const data: CustomLogType = logs[0];
          setTimeout(() => {
            if (data.eventName === "WithdrawRequested") {
              const accountIDNum =
                Number(formatUnits(data.args.accountID, 1)) * 10;
              const withdrawIDNum =
                Number(formatUnits(data.args.withdrawID, 1)) * 10;
              const requestedAmountNum = Number(
                formatUnits(data.args.requestedAmount, 18)
              );
              const timestampNum =
                Number(formatUnits(data?.args.timestamp, 1)) * 10;

              setRequestWithdrawalEmit({
                requestedBy: data.args.requestedBy,
                accountID: accountIDNum,
                withdrawID: withdrawIDNum,
                requestedAmount: `${requestedAmountNum} Ether`,
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
    }
  }, [requestWithdrawalEmit?.timestamp]);

  return (
    <div className="flex flex-col gap-1">
      <p className="font-semibold">Make a withdrawal request</p>
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
                  htmlFor="RequestedAmount"
                  className="font-semibold text-sm text-nowrap"
                >
                  Requested Amount :
                </label>
                <input
                  type="text"
                  name="RequestedAmount"
                  id="RequestedAmount"
                  className="ring-2 rounded-md h-[30px] pl-1 w-full min-w-10"
                  value={requestedAmount}
                  onChange={(event) => setRequestedAmount(event.target.value)}
                  placeholder="0.05"
                  required={true}
                />
              </div>
              <p className="text-xs font-bold text-gray-700 mt-1">
                *requestedAmount is in Ether.
              </p>
              {error === "requestedAmount required" ||
              error === "requestedAmount required to be Number" ? (
                <p className="text-xs font-bold text-red-500 mt-1">
                  Error - {error}
                </p>
              ) : undefined}
            </div>
          </div>

          {requestWithdrawalEmit ? (
            <div className="rounded-md flex bg-green-400 px-2 py-1 w-fit mt-1">
              <p className="text-xs font-bold pr-1 text-nowrap text-gray-950">
                Emit -
              </p>
              <p className="text-xs font-bold text-gray-950">
                {JSON.stringify(requestWithdrawalEmit, null, 2)}
              </p>
            </div>
          ) : undefined}
        </div>

        <button
          onClick={handleRequestWithdrawal}
          className="rounded-md shrink-0 bg-blue-500 font-semibold text-white mr-2 w-fit px-2 py-1 h-fit"
        >
          Request Withdrawal
        </button>
      </div>
    </div>
  );
}

export default RequestWithdrawal;
