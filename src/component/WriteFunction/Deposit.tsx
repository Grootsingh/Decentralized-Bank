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

interface DepositEmitType {
  DepositerAddress: `0x${string}`;
  DepositedAmount: string;
  accountID: number;
  timestamp: number;
}

interface CustomLogType {
  eventName: "Deposit";
  args: {
    userAddress: `0x${string}`;
    accountID: bigint;
    depositedAmount: bigint;
    timestamp: bigint;
  };
}

function Deposit(props: {
  user: "single" | "multi";
  isClicked: "single" | "multi" | "";
  setClicked: React.Dispatch<React.SetStateAction<"single" | "multi" | "">>;
}) {
  const [accountID, setAccountID] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [error, setError] = React.useState("");
  const writeToContractFn = useWriteToContractFn();
  const [DepositEmit, setDepositEmit] = React.useState<DepositEmitType>();
  const { user, isClicked, setClicked } = props;
  const globalWriteRequestState = useRecoilValue(GlobalWriteRequestState);
  const instanceID = React.useId();
  const unwatchRef = React.useRef<() => void>();
  const [emitState, setEmitState] = React.useState<
    "idle" | "loading" | "success"
  >("idle");

  function handleDeposit() {
    if (!accountID) {
      return setError("accountID required");
    }
    if (isNaN(Number(accountID))) {
      return setError("accountID required to be Number");
    }
    if (!amount) {
      return setError("amount required");
    }
    if (isNaN(Number(amount))) {
      return setError("amount required to be Number");
    }
    const accountIDNumber = Number(accountID);
    const amountNumber = Number(amount);
    setClicked(user);
    setError("");

    writeToContractFn("deposit", amountNumber, BigInt(accountIDNumber));
  }
  React.useEffect(() => {
    if (globalWriteRequestState === "success" && user === isClicked) {
      setEmitState("loading");
      setAccountID("");
      setAmount("");

      const unwatch = watchContractEvent(config, {
        address: contractAddress,
        abi,
        eventName: "Deposit",
        onLogs(logs) {
          //@ts-ignore
          const data: CustomLogType = logs[0];

          if (data.eventName === "Deposit") {
            const accountIDNum =
              Number(formatUnits(data.args.accountID, 1)) * 10;
            const depositedAmountNum = Number(
              formatUnits(data.args.depositedAmount, 18)
            );

            const timestampNum =
              Number(formatUnits(data?.args.timestamp, 1)) * 10;

            setDepositEmit({
              DepositerAddress: data.args.userAddress,
              accountID: accountIDNum,
              DepositedAmount: `${depositedAmountNum} Ether`,
              timestamp: timestampNum,
            });
          }
        },
      });
      unwatchRef.current = unwatch;
      () => {
        unwatch();
        setClicked("");
      };
    }
  }, [globalWriteRequestState]);

  React.useEffect(() => {
    if (typeof unwatchRef.current === "function") {
      unwatchRef?.current();
      setEmitState("success");
      setClicked("");
    }
  }, [DepositEmit?.timestamp]);

  return (
    <div className="flex flex-col gap-1">
      <p className="font-semibold">Add money to your account</p>
      <div className="flex gap-2">
        <div className="flex flex-col ">
          <div className="flex gap-2">
            <div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor={`accountID-${instanceID}`}
                  className="font-semibold text-sm pr-1 text-nowrap"
                >
                  AccountId :
                </label>
                <input
                  type="text"
                  name={`accountID-${instanceID}`}
                  id={`accountID-${instanceID}`}
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
                  htmlFor={`payableAmount-${instanceID}`}
                  className="font-semibold text-sm text-nowrap"
                >
                  Amount :
                </label>
                <input
                  type="text"
                  name={`payableAmount-${instanceID}`}
                  id={`payableAmount-${instanceID}`}
                  className="ring-2 rounded-md h-[30px] pl-1 min-w-10 w-full"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.05"
                  required={true}
                />
              </div>
              <p className="text-xs font-bold text-gray-700 mt-1">
                *amount is in Ether.
              </p>
              {error === "amount required" ||
              error === "amount required to be Number" ? (
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
                {JSON.stringify(DepositEmit, null, 2)}
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
          onClick={handleDeposit}
          className="rounded-md bg-blue-500 shrink-0 font-semibold text-white mr-2 w-fit px-2 py-1 h-fit"
        >
          Add Deposit
        </button>
      </div>
    </div>
  );
}

export default Deposit;
