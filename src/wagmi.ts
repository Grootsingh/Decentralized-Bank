import { http, createConfig, cookieStorage, createStorage } from "wagmi";
import { sepolia, hardhat } from "wagmi/chains";
import { injected } from "wagmi/connectors";
require("dotenv").config();

export const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [sepolia.id]: http(process.env.SEPOLIA_ENDPOINT),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
