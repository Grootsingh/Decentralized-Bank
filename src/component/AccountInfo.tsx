"use client";
import { sepolia } from "wagmi/chains";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import React from "react";
import { ConnectionState } from "@/RecoilState";
import { useRecoilState } from "recoil";
function AccountInfo() {
  const account = useAccount();
  const { connectors, connect, error: connectionError } = useConnect();
  const { disconnect } = useDisconnect();
  const [connectState, setConnectionState] = useRecoilState(ConnectionState);

  React.useEffect(() => {
    //@ts-ignore
    setConnectionState(connectionError?.cause?.message);

    //@ts-ignore
  }, [connectionError?.cause?.message]);

  React.useEffect(() => {
    if (connectState !== "none") {
      setTimeout(() => {
        setConnectionState("none");
      }, 10 * 1000);
    }
  }, [connectState]);

  return (
    <>
      <div className="rounded-md px-2 py-1 bg-orange-200 border-orange-300 border-2 ">
        <h2 className="font-bold underline decoration-blue-500 underline-offset-2 decoration-2 w-fit">
          Account Info:
        </h2>
        <p className="font-medium">Status - {account.status}</p>
        <p className="font-medium">
          Address - {JSON.stringify(account.address) || "none"}
        </p>

        {connectState !== "none" ? (
          <p className="font-medium">Error Message - {connectState}</p>
        ) : undefined}
      </div>
      <div className="mt-2 rounded-md px-2 py-1 bg-lime-200 border-lime-300 border-2">
        <h2 className="mr-1 font-bold underline decoration-blue-500 underline-offset-2 decoration-2 w-fit">
          Connect Your Wallet:
        </h2>
        <div className="mt-1">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => {
                connect({ connector, chainId: sepolia.id });
              }}
              type="button"
              className="rounded-md bg-blue-500 font-semibold text-white mr-2 px-2 py-1"
            >
              {connector.name}
            </button>
          ))}

          {account.status === "connected" && (
            <button
              type="button"
              className="rounded-md ring-2 ring-blue-500 font-semibold text-blue-500 bg-white mr-2 px-[6px] py-[2px]"
              onClick={() => disconnect()}
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default AccountInfo;
