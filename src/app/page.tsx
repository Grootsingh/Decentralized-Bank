import AccountInfo from "@/component/AccountInfo";
import WriteFunction from "@/component/WriteFunction/WriteFunction";
import ReadFunction from "@/component/ReadFunction/ReadFunction";
import Overview from "@/component/Overview";

function App() {
  return (
    <div className="max-w-[1350px] mx-auto">
      <div className="bg-gray-200 border-2 rounded-md border-gray-300 h-12 flex items-center">
        <h2 className="text-lg font-bold m-auto w-fit">Bank Smart Contract</h2>
      </div>
      <div className="flex p-2">
        <div className="flex-grow mr-2">
          <AccountInfo />
          <WriteFunction />
        </div>
        <div className="w-1/2">
          <Overview />
          <ReadFunction />
        </div>
      </div>
      <div className="bg-gray-200 border-2 rounded-md border-gray-300 h-12 flex items-center">
        <h2 className="text-lg font-bold m-auto w-fit">
          Created By Rajat Singh
        </h2>
      </div>
    </div>
  );
}

export default App;
