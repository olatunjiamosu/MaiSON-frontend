import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import { ArrowLeft } from "lucide-react"; // Back icon

const SelectUserType = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
      
      {/* Back to Landing Page */}
      <div className="absolute top-4 left-4">
        <button onClick={() => navigate("/")} className="text-gray-600 hover:text-gray-900 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </button>
      </div>

      {/* Top Section */}
      <div className="flex flex-col justify-center items-center flex-grow p-6">
        
        {/* MaiSON Branding */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">
            <span>M</span>
            <span className="text-emerald-600">ai</span>
            <span>SON</span>
          </h2>
          <p className="text-gray-600 mt-2">
            Your smart AI-powered property platform.
          </p>
        </div>

        {/* Get Started Title */}
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          We're Glad You're Here
        </h2>
        <p className="text-gray-600 mb-4">
          Are you looking to buy or sell a property?
        </p>

        {/* Selection Buttons */}
        <div className="space-y-4 w-full max-w-md">
          <button
            className="w-full bg-emerald-600 text-white py-3 rounded-md hover:bg-emerald-700"
            onClick={() => navigate("/register-buyer")}
          >
            I'm a Buyer
          </button>

          <button
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
            onClick={() => navigate("/register-seller")}
          >
            I'm a Seller
          </button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SelectUserType;
