import { Link, useLocation } from "react-router-dom";

const Found404 = () => {
	const location = useLocation();

	return (
		<section className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -top-32 left-8 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
				<div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_45%)]" />
			</div>

			<div className="relative mx-auto flex min-h-screen max-w-4xl items-center px-4 py-12 sm:px-6 lg:px-8">
				<div className="w-full rounded-2xl border border-slate-800/90 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-sm sm:p-10">
					<p className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
						Route not found
					</p>

					<h1 className="text-6xl font-extrabold leading-none text-white sm:text-8xl">404</h1>
					<h2 className="mt-3 text-2xl font-bold text-slate-100 sm:text-3xl">This page took a wrong turn</h2>

					<p className="mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
						We could not find <span className="font-semibold text-cyan-200">{location.pathname}</span>. The link may be
						outdated, or the page may have moved.
					</p>

					<div className="mt-8 flex flex-col gap-3 sm:flex-row">
						<Link
							to="/login"
							className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
						>
							Go to Login
						</Link>
						{/* <Link
							to="/customer/carlist"
							className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
						>
							Browse Cars
						</Link> */}
					</div>
				</div>
			</div>
		</section>
	);
};

export default Found404;
