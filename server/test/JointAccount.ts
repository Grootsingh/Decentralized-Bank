import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import hre from "hardhat";
import { WalletClient } from "viem";
import { expect } from "chai";
describe("JointAccount", function () {
  async function deploySmartContract() {
    const [ownerWallet, account1, account2, account3, account4, account5] =
      await hre.viem.getWalletClients();

    const JointAccount = await hre.viem.deployContract("JointAccount");
    const publicClient = await hre.viem.getPublicClient();

    return {
      JointAccount,
      ownerWallet,

      account1,
      account2,
      account3,
      account4,
      account5,
      publicClient,
    };
  }

  interface ContractType {
    address: `0x${string}`;
  }

  async function getContractFromWallet(
    Contract: ContractType,
    wallet: WalletClient
  ) {
    // @ts-ignore
    return await hre.viem.getContractAt("JointAccount", Contract.address, {
      client: {
        wallet,
      },
    });
  }

  async function getDeployedAccount(
    owners = 1,
    deposit = 0n,
    withdrawAmount: bigint[] = []
  ) {
    const {
      JointAccount,
      account1,
      account2,
      account3,
      publicClient,
      ownerWallet,
    } = await loadFixture(deploySmartContract);

    let ownerAddress: `0x${string}`[] = [];

    if (owners === 2) {
      ownerAddress = [account1.account.address];
    } else if (owners === 3) {
      ownerAddress = [account1.account.address, account2.account.address];
    }

    if (owners === 1) {
      await JointAccount.write.createAccount();
    } else {
      await JointAccount.write.createAccount([ownerAddress]);
    }

    if (deposit > 0) {
      await JointAccount.write.deposit([1n], { value: deposit });
    }

    for (let value of withdrawAmount) {
      await JointAccount.write.requestWithdrawal([1n, value]);
    }

    return {
      JointAccount,
      publicClient,
      ownerWallet,
      account1,
      account2,
      account3,
    };
  }

  describe("Deployment", () => {
    it("JointAccount smartcontract has been deployed sucessfully", async () => {
      await loadFixture(deploySmartContract);
    });
  });

  describe("createAccount", () => {
    describe("one account multiple user", () => {
      it("one account, 1 user", async () => {
        const { JointAccount } = await loadFixture(deploySmartContract);
        await JointAccount.write.createAccount();
        const ownerContractGetAccount = await JointAccount.read.getAccount();
        expect(ownerContractGetAccount.length).to.equal(1);
      });

      it("one account, 2 user", async () => {
        const { JointAccount, account1, account2 } = await loadFixture(
          deploySmartContract
        );
        const Addr1 = account1.account.address;
        await JointAccount.write.createAccount([[Addr1]]);

        const ownerContractGetAccount =
          await JointAccount.read.getAcountHolders([1n]);
        expect(ownerContractGetAccount.length).to.equal(2);
      });
      it("one account, 3 user", async () => {
        const { JointAccount, account1, account2, ownerWallet } =
          await loadFixture(deploySmartContract);
        const Addr1 = account1.account.address;
        const Addr2 = account2.account.address;
        await JointAccount.write.createAccount([[Addr1, Addr2]]);

        const ownerContractGetAccount =
          await JointAccount.read.getAcountHolders([1n]);
        expect(ownerContractGetAccount.length).to.equal(3);
      });
      it("one account, 4 user (Not allowed)", async () => {
        const { JointAccount, account1, account2, account3 } =
          await loadFixture(deploySmartContract);
        const Addr1 = account1.account.address;
        const Addr2 = account2.account.address;
        const Addr3 = account3.account.address;

        const errorRecived = await JointAccount.write
          .createAccount([[Addr1, Addr2, Addr3]])
          .catch((error) =>
            String(error.details.slice(72, error.details.length - 1))
          );

        expect(errorRecived).to.equal("an account can have Max of 3 owners");
      });
      it("one account, duplicate user (Not allowed)", async () => {
        const { JointAccount, account1, account2, account3 } =
          await loadFixture(deploySmartContract);
        const Addr1 = account1.account.address;
        const Addr2 = account2.account.address;
        const Addr3 = account3.account.address;

        const errorRecived = await JointAccount.write
          .createAccount([[Addr1, Addr1]])
          .catch((error) =>
            String(error.details.slice(72, error.details.length - 1))
          );
        expect(errorRecived).to.equal("duplicate Account found");
      });
    });

    describe("N account one user each", () => {
      it("2 account 1 user each", async () => {
        const { JointAccount, account1 } = await loadFixture(
          deploySmartContract
        );

        await JointAccount.write.createAccount();
        const ownerContractGetAccount =
          await JointAccount.read.getAcountHolders([1n]);
        expect(ownerContractGetAccount.length).to.equal(1);

        //-----------------------------------------------------
        const account1Contract = await getContractFromWallet(
          JointAccount,
          account1
        );
        await account1Contract.write.createAccount();

        const account1ContractGetAccount =
          await account1Contract.read.getAcountHolders([2n]);
        expect(account1ContractGetAccount.length).to.equal(1);
      });
      it("3 account 1 user each", async () => {
        const { JointAccount, account1, account2 } = await loadFixture(
          deploySmartContract
        );

        await JointAccount.write.createAccount();
        const ownerContractGetAccount =
          await JointAccount.read.getAcountHolders([1n]);
        expect(ownerContractGetAccount.length).to.equal(1);
        //-----------------------------------------------------
        const account1Contract = await getContractFromWallet(
          JointAccount,
          account1
        );
        await account1Contract.write.createAccount();

        const account1ContractGetAccount =
          await account1Contract.read.getAcountHolders([2n]);
        expect(account1ContractGetAccount.length).to.equal(1);
        //-----------------------------------------------------
        const account2Contract = await getContractFromWallet(
          JointAccount,
          account2
        );
        await account2Contract.write.createAccount();

        const account2ContractGetAccount =
          await account2Contract.read.getAcountHolders([3n]);
        expect(account2ContractGetAccount.length).to.equal(1);
      });
    });
    describe("How many account can one user can Own", () => {
      it("1 user, 2 account", async () => {
        const { JointAccount } = await loadFixture(deploySmartContract);
        await JointAccount.write.createAccount();
        await JointAccount.write.createAccount();
        const ownerContractGetAccount1 = await JointAccount.read.getAccount();
        expect(ownerContractGetAccount1.length).to.equal(2);
      });
      it("1 user, 3 account", async () => {
        const { JointAccount } = await loadFixture(deploySmartContract);
        await JointAccount.write.createAccount();
        await JointAccount.write.createAccount();
        await JointAccount.write.createAccount();
        const ownerContractGetAccount1 = await JointAccount.read.getAccount();
        expect(ownerContractGetAccount1.length).to.equal(3);
      });
      it("1 user, 4 account (not allowed)", async () => {
        const { JointAccount, account1, account2, account3, account4 } =
          await loadFixture(deploySmartContract);
        // calling one account single user
        await JointAccount.write.createAccount();
        await JointAccount.write.createAccount();
        await JointAccount.write.createAccount();

        const catchError = await JointAccount.write
          .createAccount()
          .catch((error) =>
            String(error.details.slice(72, error.details.length - 1))
          );

        expect(catchError).to.equal("a user can have Max of 3 Account");
        // one account multiple user
        const account1Contract = await getContractFromWallet(
          JointAccount,
          account1
        );
        await account1Contract.write.createAccount([
          [account2.account.address],
        ]);
        await account1Contract.write.createAccount([
          [account3.account.address],
        ]);
        await account1Contract.write.createAccount([
          [account4.account.address],
        ]);

        const catchError2 = await account1Contract.write
          .createAccount([[account2.account.address]])
          .catch((error) =>
            String(error.details.slice(72, error.details.length - 1))
          );

        expect(catchError2).to.equal("a user can have Max of 3 Account");
      });
    });
  });
  describe("deposit", () => {
    it("should allow deposit from owner account", async () => {
      const { JointAccount } = await getDeployedAccount(1);
      const depositRecipt = await JointAccount.write.deposit([1n], {
        value: 100n,
      });
    });
    it("should not allow deposit from  non-owner account", async () => {
      const { JointAccount, account1 } = await getDeployedAccount(1);
      const account1Contract = await getContractFromWallet(
        JointAccount,
        account1
      );
      const depositRecipt = await account1Contract.write
        .deposit([1n], {
          value: 100n,
        })
        .catch((error) =>
          String(error.details.slice(72, error.details.length - 1))
        );
      expect(depositRecipt).to.equal("You are not a Owner of this account");
    });
  });
  describe("withdrawSingle", () => {
    it("accountOwner can make a withdraw", async () => {
      const { JointAccount } = await getDeployedAccount(1, 100n);
      await JointAccount.write.withdrawSingle([1n, 90n]);
      expect(await JointAccount.read.getBalance([1n])).to.equal(10n);
    });
    it("accountOwner can't withdraw if account doesn't have enough balance", async () => {
      const { JointAccount } = await getDeployedAccount(1, 100n);
      const response = await JointAccount.write
        .withdrawSingle([1n, 110n])
        .catch((error) =>
          String(error.details.slice(72, error.details.length - 1))
        );

      expect(response).to.equal("Insufficient balance");
    });
    it("non-accountOwner can't make a withdraw", async () => {
      const { JointAccount, account1 } = await getDeployedAccount(1, 100n);

      const account1Contract = await getContractFromWallet(
        JointAccount,
        account1
      );

      const response = await account1Contract.write
        .withdrawSingle([1n, 80n])
        .catch((error) =>
          String(error.details.slice(72, error.details.length - 1))
        );

      expect(response).to.equal("You are not the owner of this account");
    });
    it("this account can't have multiple owners", async () => {
      const { JointAccount, account1 } = await loadFixture(deploySmartContract);
      await JointAccount.write.createAccount([[account1.account.address]]);
      await JointAccount.write.deposit([1n], { value: 100n });

      const response = await JointAccount.write
        .withdrawSingle([1n, 80n])
        .catch((error) =>
          String(error.details.slice(72, error.details.length - 1))
        );

      expect(response).to.equal(
        "only account with one owner can withdraw directly"
      );
    });
  });
  describe("withdrawMulti", () => {
    describe("request withdrawMulti", () => {
      it("accountOwner can make a request withdrawMulti", async () => {
        const { JointAccount } = await getDeployedAccount(2, 100n);
        // request will fail if it was incorrect
        await JointAccount.write.requestWithdrawal([1n, 100n]);
      });
      it("invalidAccountOwner can not make a request withdrawMulti", async () => {
        const { JointAccount, account1 } = await getDeployedAccount(1, 100n);
        const account1Contract = await getContractFromWallet(
          JointAccount,
          account1
        );
        const response = await account1Contract.write
          .requestWithdrawal([1n, 100n])
          .catch((error) =>
            String(error.details.slice(72, error.details.length - 1))
          );
        expect(response).to.equal("You are not a Owner of this account");
      });
      it("accountOwner can not make a request withdrawMulti with invalid amount", async () => {
        const { JointAccount } = await getDeployedAccount(2, 100n);
        const response = await JointAccount.write
          .requestWithdrawal([1n, 101n])
          .catch((error) =>
            String(error.details.slice(72, error.details.length - 1))
          );
        expect(response).to.equal("insufficient balance");
      });
      it("accountOwner can make multiple request withdrawMulti", async () => {
        const { JointAccount, publicClient } = await getDeployedAccount(
          2,
          100n
        );

        await JointAccount.write.requestWithdrawal([1n, 90n]);
        await JointAccount.write.requestWithdrawal([1n, 10n]);
      });
    });
    describe("approve withdrawMulti", () => {
      it("should allow accountOwner to Aprrove withdrawMulti", async () => {
        const { JointAccount, publicClient, account1 } =
          await getDeployedAccount(2, 100n, [100n]);
        const account1Contract = await getContractFromWallet(
          JointAccount,
          account1
        );
        await account1Contract.write.approveWithdrawal([1n, 1n]);
      });
      it("should not allow non-accountOwner to Aprrove withdrawMulti", async () => {
        const { JointAccount, account1, account2 } = await getDeployedAccount(
          2,
          100n,
          [100n]
        );
        const account2Contract = await getContractFromWallet(
          JointAccount,
          account2
        );
        const response = await account2Contract.write
          .approveWithdrawal([1n, 1n])
          .catch((error) =>
            String(error.details.slice(72, error.details.length - 1))
          );
        expect(response).to.equal("You are not a Owner of this account");
      });
      it("should not allow accountOwner to Aprrove withdrawMulti multiple times", async () => {
        const { JointAccount, account1 } = await getDeployedAccount(2, 100n, [
          100n,
        ]);
        const account1Contract = await getContractFromWallet(
          JointAccount,
          account1
        );
        await account1Contract.write.approveWithdrawal([1n, 1n]);

        const response = await account1Contract.write
          .approveWithdrawal([1n, 1n])
          .catch((error) =>
            String(error.details.slice(72, error.details.length - 1))
          );
        expect(response).to.equal("Request is already Approved by You");
      });
      it("account that made the request can't approve the request", async () => {
        const { JointAccount } = await getDeployedAccount(2, 100n, [100n]);

        const response = await JointAccount.write
          .approveWithdrawal([1n, 1n])
          .catch((error) =>
            String(error.details.slice(72, error.details.length - 1))
          );
        expect(response).to.equal("Request is already Approved by You");
      });
    });
    describe("make withdrawMulti", () => {
      it("should allow accountOwner to withdrawMulti Aprroved request", async () => {
        const { JointAccount, publicClient, account1, ownerWallet } =
          await getDeployedAccount(2, 100n, [100n]);
        const account1Contract = await getContractFromWallet(
          JointAccount,
          account1
        );

        // approve the request
        await account1Contract.write.approveWithdrawal([1n, 1n]);
        // withdrawMulti the money
        await JointAccount.write.withdrawMulti([1n, 1n]);

        expect(await JointAccount.read.getBalance([1n])).to.equal(0n);
      });
      it("should not allow accountOwner to withdrawMulti Aprroved request twice", async () => {
        const { JointAccount, publicClient, account1, ownerWallet } =
          await getDeployedAccount(2, 200n, [100n]);

        const account1Contract = await getContractFromWallet(
          JointAccount,
          account1
        );
        // approve the request
        await account1Contract.write.approveWithdrawal([1n, 1n]);
        // withdrawMulti the money
        await JointAccount.write.withdrawMulti([1n, 1n]);

        expect(
          await publicClient.getBalance({ address: JointAccount.address })
        ).to.equal(100n);

        const response = await JointAccount.write
          .withdrawMulti([1n, 1n])
          .catch((error) =>
            String(error.details.slice(72, error.details.length - 1))
          );
        expect(response).to.equal("request doesn't exist");
      });
      it("should not allow non-accountOwner to withdrawMulti Aprroved request", async () => {
        const { JointAccount, publicClient, account1, account2 } =
          await getDeployedAccount(2, 100n, [100n]);
        const account1Contract = await getContractFromWallet(
          JointAccount,
          account1
        );
        const account2Contract = await getContractFromWallet(
          JointAccount,
          account2
        );
        // approve the request
        await account1Contract.write.approveWithdrawal([1n, 1n]);
        // withdrawMulti the money
        const response = await account2Contract.write
          .withdrawMulti([1n, 1n])
          .catch((error) =>
            String(error.details.slice(72, error.details.length - 1))
          );
        expect(response).to.equal("You didn't created this request");
      });
      it("should not allow accountOwner to withdrawMulti non-Aprroved withdrawMulti request", async () => {
        const { JointAccount, publicClient, account1, ownerWallet } =
          await getDeployedAccount(2, 100n, [100n]);
        const account1Contract = await getContractFromWallet(
          JointAccount,
          account1
        );
        // withdrawMulti the money
        const response = await JointAccount.write
          .withdrawMulti([1n, 1n])
          .catch((error) =>
            String(error.details.slice(72, error.details.length - 1))
          );
        expect(response).to.equal("request is not approved by all owners");
      });
    });
  });
});
