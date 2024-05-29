"use client";
import { useReadToContractFn } from "@/HelperHooks";
import { GlobalReadRequestState } from "@/RecoilState";
import React from "react";
import { useSetRecoilState } from "recoil";
import { formatUnits } from "viem";

function GetAccount() {
  const readToContractFn = useReadToContractFn();
  const [accountOwned, setAccountOwned] = React.useState<number[]>([]);
  const [clickGetAccount, setClickGetAccount] = React.useState(false);
  const setGlobalReadRequestState = useSetRecoilState(GlobalReadRequestState);

  function handleGetAccount() {
    setClickGetAccount(true);
    readToContractFn("getAccount").then((result) => {
      setGlobalReadRequestState("success");
      if (Array.isArray(result)) {
        const numberArr = result?.map((eachAccount: bigint) => {
          const resultNum = Number(formatUnits(eachAccount, 1));
          return Number(resultNum * 10);
        });
        setAccountOwned(numberArr);
      }
    });
  }

  return (
    <>
      <p className="font-semibold">Want to know Accounts that you Owns :</p>
      <button
        className="rounded-md shrink-0 bg-blue-500 font-semibold text-white mr-2 px-2 py-1 w-fit"
        onClick={handleGetAccount}
      >
        getAccounts
      </button>
      {clickGetAccount ? (
        accountOwned.length > 1 ? (
          <p className="font-medium">
            List of accountIds that you owns - {JSON.stringify(accountOwned)}
          </p>
        ) : accountOwned.length > 0 ? (
          <p className="font-medium">
            accountId that you owns - {accountOwned[0]}
          </p>
        ) : (
          <p className="font-medium">create an account first</p>
        )
      ) : undefined}
    </>
  );
}

export default GetAccount;
