import { parseAbi } from "viem";

const abi = [
  "event AccountCreated(address[] accountHolders, uint256 indexed accountID, uint256 timestamp)",
  "event AccountCreated(address accountHolders, uint256 indexed accountID, uint256 timestamp)",
  "event Deposit(uint256 indexed accountID, address indexed userAddress, uint256 depositedAmount, uint256 timestamp)",
  "event WithdrawMultiUser(uint256 indexed accountID, uint256 indexed withdrawID, uint256 requestedAmount, uint256 balanceLeftAfterWithdrawal, uint256 timestamp)",
  "event WithdrawRequested(uint256 indexed accountID, uint256 indexed withdrawID, address indexed requestedBy, uint256 requestedAmount, uint256 timestamp)",
  "event WithdrawSingleUser(address withdrawer, uint256 withdrawedAmount, uint256 balanceLeftAfterWithdrawal, uint256 timestamp)",
  "event approved(address[] approvedBy,address[] approvalLeftFrom, bool isReadyToWithdaw, uint256 timestamp)",
  "function approveWithdrawal(uint256 _accountID, uint256 _withdrawID)",
  "function createAccount()",
  "function createAccount(address[] OtherAccountHolders)",
  "function deposit(uint256 _accountID) payable",
  "function getAccount() view returns (uint256[])",
  "function getAcountHolders(uint256 _accountID) view returns (address[])",
  "function getBalance(uint256 _accountID) view returns (uint256)",
  "function getWithdrawApproveBy(uint256 _accountID, uint256 _withdrawID) view returns (address[])",
  "function getWithdrawApprovalLeftFrom(uint256 _accountID, uint256 _withdrawID) view returns (address[])",
  "function requestWithdrawal(uint256 _accountID, uint256 requestedAmount)",
  "function withdrawMulti(uint256 _accountID, uint256 _withdrawID) payable",
  "function withdrawSingle(uint256 _accountID, uint256 _withdrawAmount) payable",
];

export default parseAbi(abi);
