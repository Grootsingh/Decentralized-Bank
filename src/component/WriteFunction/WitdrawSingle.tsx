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

interface WithdrawSingleEmit {
  withdrawer: `0x${string}`;
  withdrawedAmount: string;
  balanceLeft: string;
  timestamp: number;
}

interface CustomLogType {
  eventName: "WithdrawSingleUser";
  args: {
    withdrawer: `0x${string}`;
    withdrawedAmount: bigint;
    balanceLeftAfterWithdrawal: bigint;
    timestamp: bigint;
  };
}

function WithdrawSingle() {
  const [accountID, setAccountID] = React.useState("");
  const [withdrawAmount, setWithdrawAmount] = React.useState("");
  const [error, setError] = React.useState("");
  const writeToContractFn = useWriteToContractFn();
  const [WithdrawalSingleEmit, setWithdrawalSingleEmit] =
    React.useState<WithdrawSingleEmit>();
  const globalWriteRequestState = useRecoilValue(GlobalWriteRequestState);
  const unwatchRef = React.useRef<() => void>();
  function handleRequestWithdrawal() {
    if (!accountID) {
      return setError("accountID required");
    }
    if (isNaN(Number(accountID))) {
      return setError("accountID required to be Number");
    }
    if (!withdrawAmount) {
      return setError("withdrawAmount required");
    }
    if (isNaN(Number(withdrawAmount))) {
      return setError("withdrawAmount required to be Number");
    }
    const accountIDNumber = Number(accountID);
    const withdrawSingleNum = Number(withdrawAmount);
    writeToContractFn(
      "withdrawSingle",
      0,
      BigInt(accountIDNumber),
      parseEther(withdrawAmount)
    );
    setError("");
  }

  React.useEffect(() => {
    if (globalWriteRequestState === "success") {
      setAccountID("");
      setWithdrawAmount("");

      const unwatch = watchContractEvent(config, {
        address: contractAddress,
        abi,
        eventName: "WithdrawSingleUser",
        onLogs(logs) {
          //@ts-ignore
          const data: CustomLogType = logs[0];
          setTimeout(() => {
            if (data.eventName === "WithdrawSingleUser") {
              const withdrawedAmountNum = Number(
                formatUnits(data.args.withdrawedAmount, 18)
              );
              const balanceLeftNum = Number(
                formatUnits(data.args.balanceLeftAfterWithdrawal, 18)
              );

              const timestampNum =
                Number(formatUnits(data?.args.timestamp, 1)) * 10;

              setWithdrawalSingleEmit({
                withdrawer: data.args.withdrawer,
                withdrawedAmount: `${withdrawedAmountNum} Ether`,
                balanceLeft: `${balanceLeftNum} Ether`,
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
  }, [WithdrawalSingleEmit?.timestamp]);

  return (
    <div className="flex flex-col gap-1">
      <p className="font-semibold">Make a withdrawal request</p>
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
                  htmlFor="withdrawSingle"
                  className="font-semibold text-sm text-nowrap"
                >
                  Withdraw Amount :
                </label>
                <input
                  type="text"
                  name="withdrawSingle"
                  id="withdrawSingle"
                  className="ring-2 rounded-md h-[30px] pl-1 min-w-10 w-full"
                  value={withdrawAmount}
                  onChange={(event) => setWithdrawAmount(event.target.value)}
                  placeholder="0.05"
                  required={true}
                />
              </div>
              <p className="text-xs font-bold text-gray-700 mt-1">
                *withdrawAmount is in Ether.
              </p>
              {error === "withdrawAmount required" ||
              error === "withdrawAmount required to be Number" ? (
                <p className="text-xs font-bold text-red-500 mt-1">
                  Error - {error}
                </p>
              ) : undefined}
            </div>
          </div>

          {WithdrawalSingleEmit ? (
            <div className="rounded-md flex bg-green-400 px-2 py-1 w-fit mt-1">
              <p className="text-xs font-bold pr-1 text-nowrap text-gray-950">
                Emit -
              </p>
              <p className="text-xs font-bold text-gray-950">
                {JSON.stringify(WithdrawalSingleEmit, null, 2)}
              </p>
            </div>
          ) : undefined}
        </div>

        <button
          onClick={handleRequestWithdrawal}
          className="rounded-md shrink-0 bg-blue-500 font-semibold text-white mr-2 w-fit px-2 py-1 h-fit"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}

export default WithdrawSingle;
