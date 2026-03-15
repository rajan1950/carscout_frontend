import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import axios from 'axios'
import { normalizeRole, saveAuthSession } from '../utils/auth'

export const Login = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onBlur'
  })

const submitHandler = async (data) => {
  try {

    const res = await axios.post("http://localhost:4444/user/login", data)

    console.log("response...", res.data)

    if (res.status === 200) {

      toast.success("Login successful!")

      const rawUser =
        res.data.user ||
        res.data.profile ||
        res.data.data?.user ||
        res.data.data ||
        {}

      const role = normalizeRole(res.data.role || rawUser.role)
      const fallbackName = String(data.email || "").split("@")[0] || "User"

      const safeUser = {
        ...rawUser,
        name:
          rawUser.name ||
          rawUser.fullName ||
          rawUser.username ||
          rawUser.firstName ||
          fallbackName,
        email: rawUser.email || data.email,
        profileImage:
          rawUser.profileImage ||
          rawUser.profilePicture ||
          rawUser.avatar ||
          rawUser.photo ||
          "",
      }

      saveAuthSession({
        role,
        token: res.data.token || res.data.accessToken || res.data.jwt,
        user: safeUser,
      })

      if (role === "admin") {
        navigate("/adminpanel")
      }
      else if (role === "seller" || role === "buyer" || role === "user") {
        navigate("/")
      }
      else {
        toast.error("Invalid Role")
        navigate("/login")
      }

    }

  } catch (error) {

    console.log("login error...", error)
    toast.error("Invalid credentials. Please try again.")

  }
}

  return (
    <div className="min-h-screen from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400">Sign in to your Car Scout account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(submitHandler)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address'
                    }
                  })}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-700 border transition-all focus:outline-none text-white placeholder-slate-500 ${errors.email
                    ? 'border-red-500 focus:border-red-500 focus:bg-slate-700'
                    : 'border-slate-600 focus:border-blue-500 focus:bg-slate-700'
                    }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-700 border transition-all focus:outline-none text-white placeholder-slate-500 ${errors.password
                    ? 'border-red-500 focus:border-red-500 focus:bg-slate-700'
                    : 'border-slate-600 focus:border-blue-500 focus:bg-slate-700'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-300 transition"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-slate-400 cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">or</span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-400 text-sm">
            Don't have an account?
            <button
              onClick={() => navigate('/signup')}
              className="text-blue-400 hover:text-blue-300 font-medium ml-1 transition"
            >
              Create one
            </button>
          </p>
        </div>

        {/* Security Info */}
        <p className="text-center text-slate-500 text-xs mt-4">
          🔒 Your data is secure and encrypted
        </p>
      </div>
    </div>
  )
}
