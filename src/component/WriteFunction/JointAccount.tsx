"use client";
import { contractAddress } from "@/Constant";
import { useWriteToContractFn } from "@/HelperHooks";
import React from "react";
import { formatUnits, isAddress } from "viem";
import abi from "../../../ABI";
import { watchContractEvent } from "wagmi/actions";
import { config } from "@/wagmi";
import { useRecoilValue } from "recoil";
import { GlobalWriteRequestState } from "@/RecoilState";

interface JointAccountEmitType {
  owners: `0x${string}`[];
  accountID: number;
  timestamp: number;
}

interface CustomLogType {
  eventName: "AccountCreated";
  args: { accountHolders: `0x${string}`; accountID: bigint; timestamp: bigint };
}

function JointAccount() {
  const [inputValue, setInputValue] = React.useState("");
  const [error, setError] = React.useState("");
  const writeToContractFn = useWriteToContractFn();
  const [acountCreatedMultipleEmit, setAccountCreaterMultipleEmit] =
    React.useState<JointAccountEmitType>();
  const globalWriteRequestState = useRecoilValue(GlobalWriteRequestState);
  const unwatchRef = React.useRef<() => void>();
  const [emitState, setEmitState] = React.useState<
    "idle" | "loading" | "success"
  >("idle");
  const [isClicked, setClicked] = React.useState<"jointAccount" | "">("");

  function handleJointAccount() {
    if (!inputValue) {
      return setError("Other UserAddress Required");
    }
    const jointAccountArray = inputValue.split(",");

    if (jointAccountArray.length > 0) {
      let hasValidAddress = jointAccountArray.every((eachAddress) =>
        isAddress(eachAddress)
      );
      if (hasValidAddress) {
        writeToContractFn("createAccount", 0, jointAccountArray);
        setClicked("jointAccount");
        setError("");
      } else {
        setError("incorrect userAddress");
      }
    }
  }

  React.useEffect(() => {
    if (globalWriteRequestState === "success" && isClicked === "jointAccount") {
      setEmitState("loading");
      setClicked("");
      setInputValue("");
      const unwatch = watchContractEvent(config, {
        address: contractAddress,
        abi,
        eventName: "AccountCreated",
        onLogs(logs) {
          //@ts-ignore
          const data: CustomLogType = logs[0];
          setTimeout(() => {
            if (
              data.eventName === "AccountCreated" &&
              Array.isArray(data?.args?.accountHolders)
            ) {
              const accountIDNum =
                Number(formatUnits(data.args.accountID, 1)) * 10;

              const timestampNum =
                Number(formatUnits(data?.args.timestamp, 1)) * 10;

              setAccountCreaterMultipleEmit({
                owners: data.args.accountHolders,
                accountID: accountIDNum,
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
  }, [acountCreatedMultipleEmit?.timestamp]);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="createJointAccount" className="font-semibold">
        Create multi user Account
      </label>
      <div className="flex gap-2">
        <div className="flex flex-col">
          <input
            type="text"
            name="createJointAccount"
            id="createJointAccount"
            className="ring-2 rounded-md h-[30px] pl-1 min-w-10"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="otherUserAddress1, otherUserAddress2..."
            required={true}
          />
          <p className="text-xs font-bold text-gray-700 mt-1">
            *require address's of other users that you want to create an Account
            with.
          </p>
          <p className="text-xs font-bold text-gray-700">
            Ex: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
          </p>
          {error ? (
            <p className="text-xs font-bold text-red-500 mt-1">
              Error - {error}
            </p>
          ) : undefined}
          {emitState === "success" ? (
            <div className="rounded-md flex bg-green-400 px-2 py-1 w-fit mt-1">
              <p className="text-xs font-bold pr-1 text-nowrap text-gray-950">
                Emit -
              </p>
              <p className="text-xs font-bold text-gray-950">
                {JSON.stringify(acountCreatedMultipleEmit, null, 2)}
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
          onClick={handleJointAccount}
          className="rounded-md bg-blue-500 shrink-0 font-semibold text-white mr-2 w-fit px-2 py-1 h-fit"
        >
          Create JointAccount
        </button>
      </div>
    </div>
  );
}

export default JointAccount;
