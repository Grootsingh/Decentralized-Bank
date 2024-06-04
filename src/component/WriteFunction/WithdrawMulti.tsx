"use client";
import { contractAddress } from "@/Constant";
import { useWriteToContractFn } from "@/HelperHooks";
import React from "react";
import { formatUnits } from "viem";
import abi from "../../../ABI";
import { watchContractEvent } from "wagmi/actions";
import { config } from "@/wagmi";
import { useRecoilValue } from "recoil";
import { GlobalWriteRequestState } from "@/RecoilState";

interface WithdrawMultiEmitType {
  accountID: number;
  withdrawID: number;
  requestedAmount: string;
  balanceLeft: string;
  timestamp: number;
}

interface CustomLogType {
  eventName: "WithdrawMultiUser";
  args: {
    accountID: bigint;
    withdrawID: bigint;
    requestedAmount: bigint;
    balanceLeftAfterWithdrawal: bigint;
    timestamp: bigint;
  };
}

function WithdrawMulti() {
  const [accountID, setAccountID] = React.useState("");
  const [withdrawID, setWithdrawID] = React.useState("");
  const [error, setError] = React.useState("");
  const writeToContractFn = useWriteToContractFn();
  const [withdrawalMultiEmit, setWithdrawalMultiEmit] =
    React.useState<WithdrawMultiEmitType>();
  const globalWriteRequestState = useRecoilValue(GlobalWriteRequestState);
  const unwatchRef = React.useRef<() => void>();
  const [emitState, setEmitState] = React.useState<
    "idle" | "loading" | "success"
  >("idle");
  const [isClicked, setClicked] = React.useState<"withdrawMulti" | "">("");
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
    setClicked("withdrawMulti");
    writeToContractFn(
      "withdrawMulti",
      0,
      BigInt(accountIDNumber),
      BigInt(withdrawIDNumber)
    );
    setError("");
  }

  React.useEffect(() => {
    if (
      globalWriteRequestState === "success" &&
      isClicked === "withdrawMulti"
    ) {
      setEmitState("loading");
      setClicked("");
      setAccountID("");
      setWithdrawID("");
      const unwatch = watchContractEvent(config, {
        address: contractAddress,
        abi,
        eventName: "WithdrawMultiUser",
        onLogs(logs) {
          //@ts-ignore
          const data: CustomLogType = logs[0];
          setTimeout(() => {
            if (data.eventName === "WithdrawMultiUser") {
              const accountIDNum =
                Number(formatUnits(data.args.accountID, 1)) * 10;
              const withdrawIDNum =
                Number(formatUnits(data.args.withdrawID, 1)) * 10;
              const requestedAmountNum = Number(
                formatUnits(data.args.requestedAmount, 18)
              );
              const balanceLeftNum = Number(
                formatUnits(data.args.balanceLeftAfterWithdrawal, 18)
              );
              const timestampNum =
                Number(formatUnits(data?.args.timestamp, 1)) * 10;

              setWithdrawalMultiEmit({
                accountID: accountIDNum,
                withdrawID: withdrawIDNum,
                requestedAmount: `${requestedAmountNum} Ether`,
                balanceLeft: `${balanceLeftNum} Ether`,
                timestamp: timestampNum,
              });
            }
          }, 0);
        },
      });
      unwatchRef.current = unwatch;
      () => unwatch();
    } else {
      setWithdrawalMultiEmit(undefined);
    }
  }, [globalWriteRequestState]);

  React.useEffect(() => {
    if (typeof unwatchRef.current === "function") {
      unwatchRef?.current();
      setEmitState("success");
      setClicked("");
    }
  }, [withdrawalMultiEmit?.timestamp]);
  return (
    <div className="flex flex-col gap-1">
      <p className="font-semibold">Withdraw requested amount</p>
      <div className="flex gap-2">
        <div className="flex flex-col ">
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
                  className="ring-2 rounded-md h-[30px] pl-1 min-w-0 w-full"
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
                {JSON.stringify(withdrawalMultiEmit, null, 2)}
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
          className="rounded-md bg-blue-500 shrink-0 font-semibold text-white mr-2 w-fit px-2 py-1 h-fit"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}

export default WithdrawMulti;
