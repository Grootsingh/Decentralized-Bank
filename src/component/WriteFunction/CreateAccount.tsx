"use client";

import { contractAddress } from "@/Constant";
import { useWriteToContractFn } from "@/HelperHooks";
import { config } from "@/wagmi";
import React from "react";
import { watchContractEvent } from "wagmi/actions";
import abi from "../../../ABI";
import { formatUnits } from "viem";
import { useRecoilValue } from "recoil";
import { GlobalWriteRequestState } from "@/RecoilState";

interface createAccountEmitType {
  owner: `0x${string}`;
  accountID: number;
  timestamp: number;
}

interface CustomLogType {
  eventName: "AccountCreated";
  args: { accountHolders: `0x${string}`; accountID: bigint; timestamp: bigint };
}

function CreateAccount() {
  const globalWriteRequestState = useRecoilValue(GlobalWriteRequestState);
  const writeToContractFn = useWriteToContractFn();
  const [acountCreatedSingleEmit, setAccountCreaterSingleEmit] =
    React.useState<createAccountEmitType>();
  const unwatchRef = React.useRef<() => void>();
  React.useEffect(() => {
    if (globalWriteRequestState === "success") {
      const unwatch = watchContractEvent(config, {
        address: contractAddress,
        abi,

        onLogs(logs) {
          setTimeout(() => {
            //@ts-ignore
            const data: CustomLogType = logs[0];
            if (
              data?.eventName === "AccountCreated" &&
              typeof data?.args?.accountHolders === "string"
            ) {
              const accountIDNum = Number(
                Number(formatUnits(data?.args.accountID, 1)) * 10
              );

              const timeStampNum = Number(
                Number(formatUnits(data?.args.timestamp, 1)) * 10
              );

              setAccountCreaterSingleEmit({
                owner: data.args.accountHolders,
                accountID: accountIDNum,
                timestamp: timeStampNum,
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
  }, [acountCreatedSingleEmit?.timestamp]);

  return (
    <div className="flex flex-col gap-1">
      <p className="font-semibold">Create a Single user Account</p>
      <button
        className="rounded-md bg-blue-500 font-semibold shrink-0 text-white mr-2 w-fit px-2 py-1"
        onClick={() => {
          writeToContractFn("createAccount");
        }}
      >
        Create Account
      </button>
      {acountCreatedSingleEmit ? (
        <div className="rounded-md flex bg-green-400 px-2 py-1 w-fit">
          <p className="text-xs text-nowrap pr-1 font-bold text-gray-950">
            Emit -
          </p>
          <p className="text-xs font-bold text-gray-950">
            {JSON.stringify(acountCreatedSingleEmit, null, 2)}
          </p>
        </div>
      ) : undefined}
    </div>
  );
}

export default CreateAccount;
