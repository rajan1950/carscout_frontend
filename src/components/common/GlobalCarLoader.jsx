import { FaCarSide } from "react-icons/fa";
import { CAR_IMAGE_FALLBACK } from "../../utils/carImage";

export const GlobalCarLoader = ({ visible }) => {
  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[320] grid place-items-center bg-slate-950/70 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(56,189,248,0.22),_transparent_42%),radial-gradient(circle_at_85%_80%,_rgba(34,211,238,0.2),_transparent_40%)]" />

      <div className="relative mx-4 w-full max-w-md rounded-3xl border border-cyan-200/25 bg-slate-900/85 p-6 text-white shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-cyan-200/30 ">
            <img
              src={CAR_IMAGE_FALLBACK}
              alt="Loading car"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
          </div>

          <div>
            <p className="mt-1 text-2xl font-black">Car Scout</p>
            {/* <h2 className="mt-1 text-2xl font-black">Loading Your Drive</h2> */}
            {/* <p className="mt-1 text-sm text-cyan-100/80">Preparing cars, details, and dashboard.</p> */}
          </div>
        </div>

        {/* <div className="mt-6 rounded-2xl border border-cyan-200/20 bg-slate-800/80 px-4 py-4">
          <div className="relative h-8 overflow-hidden rounded-full bg-slate-700/80">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(226,232,240,0.2)_0,rgba(226,232,240,0.2)_20px,transparent_20px,transparent_40px)] animate-[roadMove_1.2s_linear_infinite]" />
          </div>

          <div className="-mt-7 flex justify-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-slate-950 shadow-lg animate-[carHop_0.9s_ease-in-out_infinite]">
              <FaCarSide className="text-lg" />
            </span>
          </div>
        </div> */}
      </div>
    </div>
  );
};
