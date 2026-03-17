import { useNavigate } from "react-router-dom";
import SellCarModel from "../../components/seller/SellCarModel";
import UserNavbar from "../../components/UserNavbar";

const SellCar = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f5f0e8_0%,_#f8f7f3_35%,_#eff3f4_100%)]">
      <UserNavbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">Sell Car Wizard</h1>
          <p className="text-slate-600 mt-1">Complete the popup steps to list your car with the same Car Scout flow.</p>
        </div>
      </div>
      <SellCarModel isOpen onClose={() => navigate("/")} />
    </div>
  );
};

export default SellCar;