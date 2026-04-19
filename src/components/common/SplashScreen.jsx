import { useEffect } from "react";
import { FaCarSide } from "react-icons/fa";

export const SplashScreen = ({ isFading }) => {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[300] grid place-items-center bg-[radial-gradient(circle_at_20%_10%,_#cffafe_0%,_#082f49_38%,_#020617_100%)] px-6 transition-opacity duration-500 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-8%] top-[-12%] h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute right-[-10%] bottom-[-10%] h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl rounded-3xl border border-cyan-200/20 bg-white/10 px-8 py-10 text-center shadow-2xl backdrop-blur-md">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-200/30 bg-cyan-500/20 text-cyan-100 shadow-lg">
          <FaCarSide className="text-3xl" />
        </div>

        <p className="mt-6 text-xs uppercase tracking-[0.28em] text-cyan-100/80">Welcome To</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-white sm:text-5xl">Car Scout</h1>
        <p className="mt-3 text-sm text-cyan-100/85">Smart listings. Fast discovery. Trusted deals.</p>

        <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <div className="h-full w-1/2 animate-[splashLoad_1.4s_ease-in-out_infinite] rounded-full bg-cyan-300" />
        </div>
      </div>
    </div>
  );
};
