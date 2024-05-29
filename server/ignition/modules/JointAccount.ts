import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const JointAccountModule = buildModule("JointAccountModule", (IMB) => {
  const Contract = IMB.contract("JointAccount");
  console.log("Joint account deplyed");

  return { Contract };
});

export default JointAccountModule;
