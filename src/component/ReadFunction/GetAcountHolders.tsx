"use client";
import { useReadToContractFn } from "@/HelperHooks";
import {
  GlobalReadRequestErrorCause,
  GlobalReadRequestState,
} from "@/RecoilState";
import React from "react";
import { useSetRecoilState } from "recoil";
import { formatUnits } from "viem";

function GetAccountHolders() {
  const [inputValue, setInputValue] = React.useState("");
  const [accountHolders, setAccountHolders] = React.useState<string[]>([]);

  const [error, setError] = React.useState("");
  const readToContractFn = useReadToContractFn();
  const setGlobalReadRequestState = useSetRecoilState(GlobalReadRequestState);
  const setGlobalReadRequestErrorCause = useSetRecoilState(
    GlobalReadRequestErrorCause
  );
  function handleGetAccountHolders() {
    if (!inputValue) {
      return setError("accountID is Required");
    }
    if (isNaN(Number(inputValue))) {
      return setError("accountID Required to be Number");
    }
    const InputValueNum = Number(inputValue);

    readToContractFn("getAcountHolders", BigInt(InputValueNum)).then(
      (result) => {
        if (Array.isArray(result) && result.length === 0) {
          setGlobalReadRequestErrorCause("Invalid AccountID");
          setGlobalReadRequestState("error");
        } else if (Array.isArray(result) && result.length > 0) {
          setAccountHolders(result);
          setGlobalReadRequestState("success");
          setInputValue("");
          setError("");
        }
      }
    );
  }

  React.useEffect(() => {
    if (error) {
      setAccountHolders([]);
    }
  }, [error]);

  return (
    <div className="flex flex-col gap-1">
      <p className="font-semibold">Know who own's this account</p>
      <div className="flex gap-2">
        <div className="flex items-center gap-1">
          <label
            htmlFor="createJointAccount"
            className="text-nowrap text-sm font-semibold"
          >
            AccountId :
          </label>
          <input
            type="text"
            name="getBalance"
            id="getBalance"
            className="ring-2 rounded-md h-[30px] w-full pl-1 min-w-10"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="1"
            required={true}
          />
        </div>

        <button
          onClick={handleGetAccountHolders}
          className="rounded-md bg-blue-500 shrink-0 font-semibold text-white mr-2 w-fit px-2 py-1 h-fit"
        >
          Get AccountHolders
        </button>
      </div>

      {error ? (
        <p className="text-xs font-bold text-red-500">Error - {error}</p>
      ) : undefined}
      {accountHolders.length > 0 ? (
        <p className="font-medium">
          list of accountHolders : {JSON.stringify(accountHolders, null, 2)}
        </p>
      ) : undefined}
    </div>
  );
}

export default GetAccountHolders;
