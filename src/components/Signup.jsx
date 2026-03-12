import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";


export const Signup = () => {



  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm();


  const navigate = useNavigate();

  const submitHandler = async (data) => {
  try {
    const res = await axios.post(
      "http://localhost:4444/user/register",
      {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: data.password
      }
      
    );
    if (res.status === 201) {
      toast.success("Registration successful! Please login.")
      reset()
      navigate("/login")
    }
    // console.log(res.data);
  } catch (error) {
    console.log("signup error...", error);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-200 to-purple-200">

      <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-xl w-[400px]">

        <h2 className="text-3xl font-bold text-center mb-2">
          Create Account
        </h2>

        <p className="text-center text-gray-400 mb-6">
          Sign up for your Car Scout account
        </p>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">

          {/* firstname */}
          <div>
            <label className="text-sm">First Name</label>
            <input
              type="text"
              placeholder="First Name"
              {...register("firstname", {
                required: "First name is required",
                minLength: {
                  value: 3,
                  message: "Name must be at least 3 characters"
                }
              })}
              className="w-full mt-1 p-2 rounded-md bg-gray-800 border border-gray-700"
            />
            {errors.firstname && (
              <p className="text-red-400 text-sm">{errors.firstname.message}</p>
            )}
          </div>

          {/* lastname */}
          <div>
            <label className="text-sm">Last Name</label>
            <input
              type="text"
              placeholder="Last Name"
              {...register("lastname", {
                required: "Last name is required",
                minLength: {
                  value: 3,
                  message: "Name must be at least 3 characters"
                }
              })}
              className="w-full mt-1 p-2 rounded-md bg-gray-800 border border-gray-700"
            />
            {errors.lastname && (
              <p className="text-red-400 text-sm">{errors.lastname.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm">Email Address</label>
            <input
              type="email"
              placeholder="Enter Email"
              {...register("email", {
                required: "Email is required"
              })}
              className="w-full mt-1 p-2 rounded-md bg-gray-800 border border-gray-700"
            />
            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Account Type */}
          {/* <div>
            <label className="text-sm">Account Type</label>
            <select
              {...register("userType")}
              className="w-full mt-1 p-2 rounded-md bg-gray-800 border border-gray-700"
            >
              <option value="customer">Customer - Buy Cars</option>
              <option value="dealer">Dealer - Sell Cars</option>
            </select>
          </div> */}

          {/* Password */}
          <div>
            <label className="text-sm">Password</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                {...register("password", {
                  required: "Password required",
                  minLength: {
                    value: 6,
                    message: "Password must be 6 characters"
                  }
                })}
                className="w-full mt-1 p-2 rounded-md bg-gray-800 border border-gray-700"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-400"
              >
                👁️
              </button>
            </div>

            {errors.password && (
              <p className="text-red-400 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          {/* <div>
            <label className="text-sm">Confirm Password</label>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                {...register("confirmPassword", {
                  required: "Confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match"
                })}
                className="w-full mt-1 p-2 rounded-md bg-gray-800 border border-gray-700"
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2 text-gray-400"
              >
                👁️
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="text-red-400 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div> */}

          {/* Terms */}
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register("terms", {
                required: "Accept terms & conditions"
              })}
              className="mr-2"
            />
            <span className="text-sm text-gray-400">
              I agree to Terms & Conditions
            </span>
          </div>

          {errors.terms && (
            <p className="text-red-400 text-sm">{errors.terms.message}</p>
          )}

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded-md mt-4"
          >
            Sign Up
          </button>

        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-blue-400 cursor-pointer"
          >
            Sign In
          </span>
        </p>

      </div>
    </div>
  );
};