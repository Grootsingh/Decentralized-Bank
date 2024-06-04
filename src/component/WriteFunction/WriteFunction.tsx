"use client";
import CreateAccount from "./CreateAccount";
import JointAccount from "./JointAccount";
import Deposit from "./Deposit";
import WriteRequestInfo from "./WriteRequestInfo";
import RequestWithdrawal from "./RequestWithdrawal";
import ApproveWithdrawal from "./ApproveWithdrawal";
import WithdrawSingle from "./WitdrawSingle";
import WithdrawMulti from "./WithdrawMulti";
import React from "react";

function WriteFunction() {
  const [isClicked, setClicked] = React.useState<"single" | "multi" | "">("");
  return (
    <>
      <div className="flex flex-col gap-2 mt-2">
        <div className="sticky top-2 bg-green-200 border-2 border-green-300 rounded-md px-2 py-1 overflow-x-auto">
          <h2 className="font-bold underline decoration-blue-500 underline-offset-2 decoration-2 w-fit">
            Write Function Request Info:
          </h2>
          <WriteRequestInfo />
        </div>
        <div className="flex flex-col gap-2 rounded-md px-2 py-1 overflow-x-auto bg-teal-200 border-teal-300 border-2">
          <h2 className="font-bold underline decoration-blue-500 underline-offset-2 decoration-2 w-fit">
            Individual Account:
          </h2>

          <CreateAccount />
          <Deposit
            user={"single"}
            isClicked={isClicked}
            setClicked={setClicked}
          />
          <WithdrawSingle />
        </div>
        <div className="flex flex-col gap-2 rounded-md px-2 py-1 overflow-x-auto bg-sky-200 border-sky-300 border-2">
          <h2 className="font-bold underline decoration-blue-500 underline-offset-2 decoration-2 w-fit">
            Joint Account:
          </h2>
          <JointAccount />
          <Deposit
            user={"multi"}
            isClicked={isClicked}
            setClicked={setClicked}
          />
          <RequestWithdrawal />
          <ApproveWithdrawal />
          <WithdrawMulti />
        </div>
      </div>
    </>
  );
}

export default WriteFunction;
