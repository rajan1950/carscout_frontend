import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import axios from 'axios'

export const ResetPassword = () => {
	const { token } = useParams()
	const navigate = useNavigate()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [serverMessage, setServerMessage] = useState('')

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
		reset,
	} = useForm({
		defaultValues: {
			newpassword: '',
			confirmpassword: '',
		},
		mode: 'onBlur',
	})

	const newPassword = watch('newpassword')

	const submitHandler = async (data) => {
		try {
			setServerMessage('')

			if (!token) {
				const message = 'Reset token is missing or invalid. Please request a new reset link.'
				setServerMessage(message)
				toast.error(message)
				return
			}

			setIsSubmitting(true)

			const payload = {
				newpassword: data.newpassword,
				token,
			}

			const res = await axios.put('http://localhost:4444/user/resetpassword', payload)

			if (res.status === 200) {
				toast.success(res.data.message || 'Password reset successful')
				reset()
				navigate('/login')
			}
		} catch (error) {
			const apiMessage = error?.response?.data?.message || 'Failed to reset password'
			setServerMessage(apiMessage)
			toast.error(apiMessage)
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
						<h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
						<p className="text-slate-400">Enter your new password to continue. Reset link expires in 15 minutes.</p>
					</div>

					{serverMessage && (
						<div className="mb-5 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
							{serverMessage}
						</div>
					)}

					<form onSubmit={handleSubmit(submitHandler)} className="space-y-5">
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
							<div className="relative">
								<input
									type={showPassword ? 'text' : 'password'}
									placeholder="********"
									{...register('newpassword', {
										required: 'New password is required',
										minLength: {
											value: 8,
											message: 'Password must be at least 8 characters',
										},
										pattern: {
											value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
											message: 'Use uppercase, lowercase, number, and special character',
										},
									})}
									className={`w-full px-4 py-3 rounded-lg bg-slate-700 border transition-all focus:outline-none text-white placeholder-slate-500 ${
										errors.newpassword
											? 'border-red-500 focus:border-red-500 focus:bg-slate-700'
											: 'border-slate-600 focus:border-blue-500 focus:bg-slate-700'
									}`}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
									className="absolute right-3 top-3 text-slate-400 hover:text-slate-300 transition"
								>
									{showPassword ? 'Hide' : 'Show'}
								</button>
							</div>
							{errors.newpassword && (
								<p className="text-red-400 text-sm mt-1.5">{errors.newpassword.message}</p>
							)}
							<p className="text-slate-500 text-xs mt-1.5">
								Must contain 8+ chars, uppercase, lowercase, number, and special character.
							</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
							<div className="relative">
								<input
									type={showConfirmPassword ? 'text' : 'password'}
									placeholder="********"
									{...register('confirmpassword', {
										required: 'Please confirm your password',
										validate: (value) => value === newPassword || 'Passwords do not match',
									})}
									className={`w-full px-4 py-3 rounded-lg bg-slate-700 border transition-all focus:outline-none text-white placeholder-slate-500 ${
										errors.confirmpassword
											? 'border-red-500 focus:border-red-500 focus:bg-slate-700'
											: 'border-slate-600 focus:border-blue-500 focus:bg-slate-700'
									}`}
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword((prev) => !prev)}
									className="absolute right-3 top-3 text-slate-400 hover:text-slate-300 transition"
								>
									{showConfirmPassword ? 'Hide' : 'Show'}
								</button>
							</div>
							{errors.confirmpassword && (
								<p className="text-red-400 text-sm mt-1.5">{errors.confirmpassword.message}</p>
							)}
						</div>

						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
						>
							{isSubmitting ? 'Resetting...' : 'Reset Password'}
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
