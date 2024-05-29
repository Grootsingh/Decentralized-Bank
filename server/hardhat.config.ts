import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ignition-viem";
require("dotenv").config();
const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    fuji: {
      url: process.env.INFURA_AVALANCHE_ENDPOINT,
      accounts: [process.env.PRIVATE_KEY as string],
    },
  },
};

export default config;
