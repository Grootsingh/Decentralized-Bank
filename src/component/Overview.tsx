function Overview() {
  return (
    <div className=" px-2 py-1 bg-rose-200 border-rose-300  border-2 rounded-md">
      <h2 className="font-semibold underline decoration-blue-500 underline-offset-2 decoration-2 w-fit">
        Basic Overview for testing it effectively:
      </h2>
      <div className="mb-3">
        <p>There are two types of accounts:</p>
        <ListItem itemNumber={1}>
          <p>Single Owner Account (Individual Account)</p>
        </ListItem>
        <ListItem itemNumber={2}>
          <p>Multi Owner Account (Joint Account)</p>
        </ListItem>
      </div>

      <h2 className="font-semibold underline decoration-blue-500 underline-offset-2 decoration-2 w-fit">
        Individual Account:
      </h2>
      <div className="my-3">
        <ListItem itemNumber={1}>
          <p>
            Create an account with{" "}
            <strong className="text-blue-500">Create Account</strong>
          </p>
        </ListItem>
        <p className="pl-3 -mt-1 leading-6">
          - Single user can have max of 3 accounts
        </p>
        <ListItem itemNumber={2}>
          <p>
            Add money to your account with{" "}
            <strong className="text-blue-500">Add Deposit</strong>
          </p>
        </ListItem>
        <ListItem itemNumber={3}>
          <p>
            Withdraw money from the account with{" "}
            <strong className="text-blue-500">Withdraw</strong>
          </p>
        </ListItem>
      </div>

      <h2 className="font-semibold underline decoration-blue-500 underline-offset-2 decoration-2 w-fit">
        Joint Account:
      </h2>
      <div className="mt-3">
        <ListItem itemNumber={1}>
          <p>
            Create an account with{" "}
            <strong className="text-blue-500">Joint Account</strong>
          </p>
        </ListItem>
        <p className="pl-3 -mt-1 leading-6">
          - Joint account can have max of 3 user
        </p>
        <ListItem itemNumber={2}>
          <p>
            Add money to your account with{" "}
            <strong className="text-blue-500">Add Deposit</strong>
          </p>
        </ListItem>
        <ListItem itemNumber={3}>
          <p>
            Create a request for withdrawal with{" "}
            <strong className="text-blue-500">Request Withdrawal</strong>
          </p>
        </ListItem>

        <p className="pl-3 -mt-1 leading-6">
          - All the members of the account have to approve the request first,
          except the request creator (since they initiated the request).
        </p>

        <ListItem itemNumber={4}>
          <p>
            All members need to approve the request by{" "}
            <strong className="text-blue-500">Approve Request</strong>
          </p>
        </ListItem>
        <ListItem itemNumber={5}>
          <p>
            the account that raised the request can withdraw the money with{" "}
            <strong className="text-blue-500">Withdraw</strong>
          </p>
        </ListItem>
        <p className="pl-3 -mt-1 leading-6">
          - only Request creater can withdraw{" "}
        </p>
      </div>
      <p className="mt-3 font-semibold">That's all! Enjoy testing.</p>
    </div>
  );
}

export default Overview;

function ListItem(props: {
  itemNumber: number;
  children: React.ReactNode;
  marginTop?: number;
}) {
  const { itemNumber, children, marginTop = 0 } = props;
  return (
    <div className={`flex items-baseline mt-${marginTop} `}>
      <div className="rounded-full   bg-blue-500 text-white shrink-0 h-5 w-5 mr-1 grid place-content-center">
        <p className="text-sm font-semibold">{itemNumber}</p>
      </div>
      {children}
    </div>
  );
}
