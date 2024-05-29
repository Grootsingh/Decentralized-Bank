import GetAccount from "./GetAccount";
import GetAccountHolders from "./GetAcountHolders";
import GetBalance from "./GetBalance";
import ReadRequestInfo from "./ReadRequestInfo";
import GetWithdrawApproveBy from "./GetWithdrawApproveBy";

function ReadFunction() {
  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="sticky top-2 bg-emerald-200 border-2 border-emerald-300 rounded-md px-2 py-1 overflow-x-auto">
        <ReadRequestInfo />
      </div>
      <div className="flex flex-col gap-2 rounded-md px-2 py-1 overflow-x-auto bg-amber-200 border-amber-300 border-2">
        <GetAccount />
        <GetAccountHolders />
        <GetBalance />
        <GetWithdrawApproveBy />
      </div>
    </div>
  );
}
export default ReadFunction;
