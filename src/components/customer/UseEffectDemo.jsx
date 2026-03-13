import React, { useEffect, useState } from "react";

export const UseEffectDemo = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-5">
      <h2 className="text-2xl font-semibold mb-3">useEffect Demo</h2>
      <p className="text-gray-700">Component mounted for {seconds} seconds.</p>
    </div>
  );
};
