import { CrownIcon } from "lucide-react";

const Winner = () => {
  return (
    <span className=" ml-2 text-xs font-bold bg-green-100 text-green-700 border border-green-700 rounded p-0.5">
      WINNER <CrownIcon height={18} className="inline-block ml-2" />
    </span>
  );
};

export default Winner;
