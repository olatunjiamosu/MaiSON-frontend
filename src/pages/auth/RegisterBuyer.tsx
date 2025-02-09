import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const RegisterBuyer = () => {
  const navigate = useNavigate();
  const totalSteps = 3;
  const [currentStep, setCurrentStep] = useState(1);

  const [buyerDetails, setBuyerDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: "",
    city: "",
    postcode: "",
    propertyType: "",
    budget: "",
    bedrooms: "",
    features: [],
  });

  const handleChange = (e) => {
    setBuyerDetails({ ...buyerDetails, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setBuyerDetails((prevState) => {
      const updatedFeatures = checked
        ? [...prevState.features, value]
        : prevState.features.filter((feature) => feature !== value);
      return { ...prevState, [name]: updatedFeatures };
    });
  };

  const validateStep = () => {
    const stepFields = {
      1: ["firstName", "lastName", "email", "password"],
      2: ["country", "city", "postcode", "propertyType", "budget"],
      3: ["bedrooms", "features"],
    };

    return stepFields[currentStep].every(
      (field) => buyerDetails[field].length > 0
    );
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    } else {
      alert("Please fill in all fields before proceeding.");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Buyer Registration Data:", buyerDetails);
    navigate("/buyer-dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate("/")}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </button>
      </div>

      {/* MaiSON Branding */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">
          <span>M</span>
          <span className="text-emerald-600">ai</span>
          <span>SON</span>
        </h2>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mb-6">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            id="progress"
            className="bg-emerald-600 h-2 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <p className="text-center text-gray-600 mt-2">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {/* Registration Form */}
      <form
        className="space-y-4 w-full max-w-md bg-white p-6 shadow rounded-lg"
        onSubmit={handleSubmit}
      >
        {/* Step 1: Personal Details */}
        {currentStep === 1 && (
          <div id="step1">
            <div className="flex gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={buyerDetails.firstName}
                onChange={handleChange}
                className="w-1/2 px-4 py-3 border border-gray-300 rounded-md"
                required
              />

              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={buyerDetails.lastName}
                onChange={handleChange}
                className="w-1/2 px-4 py-3 border border-gray-300 rounded-md"
                required
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={buyerDetails.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={buyerDetails.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        )}

        {/* Step 2: Buyer Preferences */}
        {currentStep === 2 && (
          <div id="step2">
            {/* Preferred Location */}
            <select
              name="country"
              value={buyerDetails.country}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Country</option>
              <option value="UK">United Kingdom</option>
              <option value="USA">United States</option>
            </select>

            <select
              name="city"
              value={buyerDetails.city}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select City</option>
              <option value="London">London</option>
              <option value="New York">New York</option>
            </select>

            <input
              type="text"
              name="postcode"
              placeholder="Postcode"
              value={buyerDetails.postcode}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md"
              required
            />

            {/* Property Type */}
            <select
              name="propertyType"
              value={buyerDetails.propertyType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Property Type</option>
              <option value="Flat">Flat</option>
              <option value="Bungalow">Bungalow</option>
              <option value="Semi-Detached">Semi-Detached</option>
            </select>

            {/* Budget */}
            <select
              name="budget"
              value={buyerDetails.budget}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Price Range</option>
              <option value="0-50k">£0 - £50k</option>
              <option value="50k-100k">£50k - £100k</option>
            </select>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          {currentStep > 1 && (
            <button
              type="button"
              className="px-6 py-2 border border-gray-600 text-gray-600 rounded-lg hover:bg-gray-100"
              onClick={prevStep}
            >
              Previous
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              onClick={nextStep}
            >
              Next
            </button>
          ) : (
            <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              Submit Preferences
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegisterBuyer;


