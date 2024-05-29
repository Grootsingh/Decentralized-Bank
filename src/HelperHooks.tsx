"use client";
import { useAccount, useConnect, useWriteContract } from "wagmi";
import { injected } from "wagmi/connectors";
import { avalancheFuji } from "wagmi/chains";
import abi from "../ABI";
import { contractAddress } from "./Constant";
import { useSetRecoilState } from "recoil";
import {
  ConnectionState,
  GlobalReadRequestErrorCause,
  GlobalReadRequestState,
  GlobalWriteRequestErrorCause,
  GlobalWriteRequestState,
} from "./RecoilState";
import { ConnectErrorType } from "@wagmi/core";
import React from "react";
import { parseEther } from "viem";
import { config } from "./wagmi";
import { readContract } from "@wagmi/core";
function useWriteToContractFn() {
  const account = useAccount();
  const { connectAsync } = useConnect();
  const {
    writeContract,
    status: writeStatus,
    error: writeError,
  } = useWriteContract();

  const setConnectionState = useSetRecoilState(ConnectionState);
  const setGlobalWriteRequestState = useSetRecoilState(GlobalWriteRequestState);
  const setGlobalWriteRequestErrorCause = useSetRecoilState(
    GlobalWriteRequestErrorCause
  );

  React.useEffect(() => {
    if (writeStatus !== "error") {
      setGlobalWriteRequestErrorCause("");
    } else {
      //@ts-ignore
      setGlobalWriteRequestErrorCause(writeError?.cause?.reason);
    }
  }, [writeStatus]);

  React.useEffect(() => {
    setGlobalWriteRequestState(writeStatus);
  }, [writeStatus]);

  async function writeToContractFn(
    functionName: string,
    value = 0,
    ...Allargs: any
  ) {
    if (!account.address) {
      await connectAsync({
        connector: injected(),
        chainId: avalancheFuji.id,
      }).catch((errorMessage: ConnectErrorType) => {
        // @ts-ignore
        setConnectionState(errorMessage?.cause?.message);
      });
    }
    if (value > 0) {
      writeContract({
        abi,
        address: contractAddress,
        functionName,
        value: parseEther(value.toString()),
        args: [...Allargs],
      });
    } else {
      writeContract({
        abi,
        address: contractAddress,
        functionName,
        args: [...Allargs],
      });
    }
  }

  return writeToContractFn;
}

function useReadToContractFn() {
  const account = useAccount();
  const { connectAsync } = useConnect();
  const setGlobalReadRequestState = useSetRecoilState(GlobalReadRequestState);

  const setConnectionState = useSetRecoilState(ConnectionState);

  async function readToContractFn(functionName: string, ...Allargs: any) {
    if (!account.address) {
      await connectAsync({
        connector: injected(),
        chainId: avalancheFuji.id,
      }).catch((errorMessage: ConnectErrorType) =>
        //@ts-ignore
        setConnectionState(errorMessage.cause.message)
      );
    }
    setGlobalReadRequestState("panding");

    const result = await readContract(config, {
      abi,
      address: contractAddress,
      functionName,
      account: account.address,
      args: [...Allargs],
    });

    return result;
  }

  return readToContractFn;
}

export { useWriteToContractFn, useReadToContractFn };
