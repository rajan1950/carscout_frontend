import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import axios from 'axios'

export const ForgotPassword = () => {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm({
		defaultValues: {
			email: '',
		},
		mode: 'onBlur',
	})

	const submitHandler = async (data) => {
		try {
			setIsSubmitting(true)

			const res = await axios.post('http://localhost:4444/user/forgotpassword', data)

			if (res.status === 200) {
				toast.success(res.data.message || 'Reset password link sent to your email')
				reset()
			}
		} catch (error) {
			toast.error(error?.response?.data?.message || 'Failed to send reset link')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="min-h-screen from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
			</div>

			<div className="relative w-full max-w-md">
				<div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 backdrop-blur-sm">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
						<p className="text-slate-400">Enter your email to receive a reset link</p>
					</div>

					<form onSubmit={handleSubmit(submitHandler)} className="space-y-5">
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
							<input
								type="email"
								placeholder="you@example.com"
								{...register('email', {
									required: 'Email is required',
									pattern: {
										value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
										message: 'Invalid email address',
									},
								})}
								className={`w-full px-4 py-3 rounded-lg bg-slate-700 border transition-all focus:outline-none text-white placeholder-slate-500 ${
									errors.email
										? 'border-red-500 focus:border-red-500 focus:bg-slate-700'
										: 'border-slate-600 focus:border-blue-500 focus:bg-slate-700'
								}`}
							/>
							{errors.email && <p className="text-red-400 text-sm mt-1.5">{errors.email.message}</p>}
						</div>

						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
						>
							{isSubmitting ? 'Sending...' : 'Send Reset Link'}
						</button>
					</form>

					<p className="text-center mt-6 text-slate-400 text-sm">
						Remember your password?{' '}
						<Link to="/login" className="text-blue-500 hover:underline">
							Back to Login
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
