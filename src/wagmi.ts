import { http, createConfig, cookieStorage, createStorage } from "wagmi";
import { avalancheFuji, hardhat } from "wagmi/chains";
import { injected } from "wagmi/connectors";
require("dotenv").config();

export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [injected()],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [avalancheFuji.id]: http(process.env.INFURA_AVALANCHE_ENDPOINT),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
