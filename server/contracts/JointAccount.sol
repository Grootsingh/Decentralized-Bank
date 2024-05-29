// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

contract JointAccount {
    event Deposit(
        uint indexed accountID,
        address indexed userAddress,
        uint depositedAmount,
        uint timestamp
    );
    event WithdrawRequested(
        uint indexed accountID,
        uint indexed withdrawID,
        address indexed requestedBy,
        uint requestedAmount,
        uint timestamp
    );
    event WithdrawMultiUser(
        uint indexed accountID,
        uint indexed withdrawID,
        uint requestedAmount,
        uint balanceLeftAfterWithdrawal,
        uint timestamp
    );
    event WithdrawSingleUser(
        address withdrawer,
        uint withdrawedAmount,
        uint balanceLeftAfterWithdrawal,
        uint timestamp
    );
    event AccountCreated(
        address[] accountHolders,
        uint indexed accountID,
        uint timestamp
    );
    event AccountCreated(
        address accountHolders,
        uint indexed accountID,
        uint timestamp
    );
    event approved(
        address[] approvedBy,
        address[] approvalLeftFrom,
        bool isReadyToWithdraw,
        uint timestamp
    );

    struct Account {
        uint accountID;
        address[] accountHolders;
        uint balance;
        // withdrawID => withdrawRequestInfo
        mapping(uint => WithdrawRequest) WithdrawRequestMap;
    }
    struct WithdrawRequest {
        uint withdrawID;
        address requestedBy;
        uint requestedAmount;
        bool isApproved;
        uint approveCount;
        // array of accountHolder that has approved this withdrawRequest
        mapping(address => bool) approvedBy;
    }

    // accountID => AcountInfo
    mapping(uint => Account) accountMap;
    // userAddress => AccountID[]
    mapping(address => uint[]) userToAccountMap;

    uint accountID;
    uint withdrawID;

    modifier validAccountUser(uint _accountID) {
        bool isValidUser;
        address[] memory accountHolders = accountMap[_accountID].accountHolders;

        for (uint index; index < accountHolders.length; index++) {
            if (accountHolders[index] == msg.sender) {
                isValidUser = true;
                break;
            }
        }

        require(isValidUser, "You are not a Owner of this account");
        _;
    }

    function deposit(
        uint _accountID
    ) external payable validAccountUser(_accountID) {
        accountMap[_accountID].balance += msg.value;
        emit Deposit(_accountID, msg.sender, msg.value, block.timestamp);
    }

    modifier validAccountHolders(address[] calldata OtherAccountHolders) {
        // limit the number of user that can own the same account
        require(
            OtherAccountHolders.length + 1 <= 3,
            "an account can have Max of 3 owners"
        );
        // No duplicate address for same account
        for (uint i; i < OtherAccountHolders.length; i++) {
            for (uint j = i + 1; j < OtherAccountHolders.length; j++) {
                if (
                    OtherAccountHolders[i] == OtherAccountHolders[j] ||
                    OtherAccountHolders[i] == msg.sender
                ) {
                    revert("duplicate Account found");
                }
            }
        }
        _;
    }

    // one account multiple Users
    function createAccount(
        address[] calldata OtherAccountHolders
    ) external validAccountHolders(OtherAccountHolders) {
        accountID++;
        address[] memory allAccountHolders = new address[](
            OtherAccountHolders.length + 1
        );

        for (uint index; index < allAccountHolders.length; index++) {
            // cloning otherAccount + adding the user who called this function
            if (index < allAccountHolders.length - 1) {
                allAccountHolders[index] = OtherAccountHolders[index];
            } else {
                allAccountHolders[index] = msg.sender;
            }
            // limiting number of account a user can have
            if (userToAccountMap[allAccountHolders[index]].length < 3) {
                userToAccountMap[allAccountHolders[index]].push(accountID);
            } else {
                revert("a user can have Max of 3 Account");
            }
        }

        accountMap[accountID].accountHolders = allAccountHolders;
        accountMap[accountID].accountID = accountID;
        emit AccountCreated(allAccountHolders, accountID, block.timestamp);
    }

    // one account single user
    function createAccount() external {
        accountID++;
        accountMap[accountID].accountHolders = [msg.sender];
        accountMap[accountID].accountID = accountID;
        // limiting number of account a user can have
        if (userToAccountMap[msg.sender].length < 3) {
            userToAccountMap[msg.sender].push(accountID);
        } else {
            revert("a user can have Max of 3 Account");
        }

        emit AccountCreated(msg.sender, accountID, block.timestamp);
    }

    modifier sufficientBalance(uint _accountID, uint requestedAmount) {
        require(
            requestedAmount <= accountMap[_accountID].balance,
            "insufficient balance"
        );
        _;
    }

    modifier onlyAccountWithMultiOwners(uint _accountID) {
        require(
            accountMap[_accountID].accountHolders.length > 1,
            "only Joint account owners can make a request"
        );
        _;
    }

    function requestWithdrawal(
        uint _accountID,
        uint requestedAmount
    )
        external
        validAccountUser(_accountID)
        sufficientBalance(_accountID, requestedAmount)
        onlyAccountWithMultiOwners(_accountID)
    {
        withdrawID++;
        WithdrawRequest storage requestMap = accountMap[_accountID]
            .WithdrawRequestMap[withdrawID];
        requestMap.withdrawID = withdrawID;
        requestMap.requestedBy = msg.sender;
        requestMap.approvedBy[msg.sender] = true;
        requestMap.requestedAmount = requestedAmount;

        emit WithdrawRequested(
            _accountID,
            withdrawID,
            msg.sender,
            requestedAmount,
            block.timestamp
        );
    }

    modifier canApprove(uint _accountID, uint _withdrawID) {
        WithdrawRequest storage requestMap = accountMap[_accountID]
            .WithdrawRequestMap[_withdrawID];

        require(requestMap.requestedBy != address(0), "Request doesn't exist");
        require(
            requestMap.requestedBy != msg.sender,
            "Request is already Approved by You"
        );
        require(!requestMap.isApproved, "Request is already Approved by You");

        require(
            !requestMap.approvedBy[msg.sender],
            "You have already approved this request"
        );

        _;
    }

    function approveWithdrawal(
        uint _accountID,
        uint _withdrawID
    )
        external
        validAccountUser(_accountID)
        canApprove(_accountID, _withdrawID)
    {
        WithdrawRequest storage requestMap = accountMap[_accountID]
            .WithdrawRequestMap[_withdrawID];
        requestMap.approveCount++;
        requestMap.approvedBy[msg.sender] = true;

        if (
            requestMap.approveCount ==
            accountMap[_accountID].accountHolders.length - 1
        ) {
            requestMap.isApproved = true;
        }

        emit approved(
            getWithdrawApproveBy(_accountID, _withdrawID),
            getWithdrawApprovalLeftFrom(_accountID, _withdrawID),
            requestMap.isApproved,
            block.timestamp
        );
    }

    modifier CanWithdraw(uint _accountID, uint _withdrawID) {
        WithdrawRequest storage requestMap = accountMap[_accountID]
            .WithdrawRequestMap[_withdrawID];
        require(requestMap.withdrawID != 0, "request doesn't exist");
        require(
            requestMap.requestedBy == msg.sender,
            "You didn't created this request"
        );
        require(requestMap.isApproved, "request is not approved by all owners");

        _;
    }

    // for multi user account
    function withdrawMulti(
        uint _accountID,
        uint _withdrawID
    ) external payable CanWithdraw(_accountID, _withdrawID) {
        uint requestedAmount = accountMap[_accountID]
            .WithdrawRequestMap[_withdrawID]
            .requestedAmount;
        require(
            requestedAmount <= accountMap[_accountID].balance,
            "Insufficient balance"
        );

        accountMap[_accountID].balance -= requestedAmount;

        delete accountMap[_accountID].WithdrawRequestMap[_withdrawID];
        (bool status, ) = payable(msg.sender).call{value: requestedAmount}("");
        require(status, "payment failed");

        emit WithdrawMultiUser(
            _accountID,
            _withdrawID,
            requestedAmount,
            accountMap[_accountID].balance,
            block.timestamp
        );
    }

    modifier accountWithSingleOwner(uint _accountID) {
        require(
            accountMap[_accountID].accountHolders.length == 1,
            "only account with one owner can withdraw directly"
        );
        require(
            accountMap[_accountID].accountHolders[0] == msg.sender,
            "You are not the owner of this account"
        );
        _;
    }

    // only for single user account
    function withdrawSingle(
        uint _accountID,
        uint _withdrawAmount
    ) external payable accountWithSingleOwner(_accountID) {
        require(
            _withdrawAmount <= accountMap[_accountID].balance,
            "Insufficient balance"
        );

        accountMap[_accountID].balance -= _withdrawAmount;

        (bool status, ) = payable(msg.sender).call{value: _withdrawAmount}("");
        require(status, "payment failed");

        emit WithdrawSingleUser(
            msg.sender,
            _withdrawAmount,
            accountMap[_accountID].balance,
            block.timestamp
        );
    }

    function getBalance(uint _accountID) public view returns (uint) {
        return accountMap[_accountID].balance;
    }

    function getAcountHolders(
        uint _accountID
    ) public view returns (address[] memory) {
        return accountMap[_accountID].accountHolders;
    }

    function getWithdrawApproveBy(
        uint _accountID,
        uint _withdrawID
    ) public view returns (address[] memory) {
        WithdrawRequest storage requestMap = accountMap[_accountID]
            .WithdrawRequestMap[_withdrawID];

        address[] memory approvedBy = new address[](
            accountMap[_accountID].accountHolders.length
        );

        for (
            uint i = 0;
            i < accountMap[_accountID].accountHolders.length;
            i++
        ) {
            if (
                requestMap.approvedBy[accountMap[_accountID].accountHolders[i]]
            ) {
                approvedBy[i] = accountMap[_accountID].accountHolders[i];
            }
        }

        return approvedBy;
    }

    function getWithdrawApprovalLeftFrom(
        uint _accountID,
        uint _withdrawID
    ) public view returns (address[] memory) {
        WithdrawRequest storage requestMap = accountMap[_accountID]
            .WithdrawRequestMap[_withdrawID];

        address[] memory approvalLeftFrom = new address[](
            accountMap[_accountID].accountHolders.length - 1
        );

        for (
            uint i = 0;
            i < accountMap[_accountID].accountHolders.length;
            i++
        ) {
            if (
                !requestMap.approvedBy[accountMap[_accountID].accountHolders[i]]
            ) {
                approvalLeftFrom[i] = accountMap[_accountID].accountHolders[i];
            }
        }

        return approvalLeftFrom;
    }

    function getAccount() public view returns (uint[] memory) {
        return userToAccountMap[msg.sender];
    }
}
