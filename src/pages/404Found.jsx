import { Link, useLocation } from "react-router-dom";

const Found404 = () => {
	const location = useLocation();

	return (
		<section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#d6f6ff,_#eef9ff_40%,_#f9fdff)] text-slate-900">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -top-24 left-2 h-64 w-64 rounded-full bg-cyan-300/35 blur-3xl" />
				<div className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-orange-300/30 blur-3xl" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(2,132,199,0.14),transparent_45%)]" />
			</div>

			<div className="relative mx-auto flex min-h-screen max-w-5xl items-center px-4 py-12 sm:px-6 lg:px-8">
				<div className="w-full rounded-3xl border border-cyan-100 bg-white/90 p-6 shadow-2xl backdrop-blur-sm sm:p-10">
					<p className="mb-3 inline-flex rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-800">
						404 not found
					</p>

					<h1 className="text-6xl font-extrabold leading-none text-cyan-900 sm:text-8xl">404</h1>
					<h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">This route does not exist</h2>

					<p className="mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
						We could not find <span className="font-semibold text-cyan-700">{location.pathname}</span>. The link may be
						outdated, or the page may have moved.
					</p>

					<div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick help</p>
						<p className="mt-2 text-sm text-slate-600">Go back to Home, Login, Sell Car, or your Admin Dashboard.</p>
					</div>

					<div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						<Link
							to="/"
							className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
						>
							Home
						</Link>
						<Link
							to="/login"
							className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
						>
							Go to Login
						</Link>
						<Link
							to="/sellcar"
							className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
						>
							Sell Car
						</Link>
						<Link
							to="/adminpanel"
							className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
						>
							Admin Panel
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Found404;
