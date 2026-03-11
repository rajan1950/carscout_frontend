import React from "react";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="bg-white min-h-screen">

      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-bold mb-6"
          >
            Find Your Perfect Car 🚗
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg mb-8"
          >
            Buy and sell cars easily with Car Scout marketplace
          </motion.p>

          {/* SEARCH BAR */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center"
          >
            <div className="flex bg-white rounded-lg overflow-hidden shadow-lg w-full max-w-xl">

              <input
                type="text"
                placeholder="Search by brand, model..."
                className="flex-1 px-4 py-3 text-gray-700 outline-none"
              />

              <button className="bg-indigo-600 hover:bg-indigo-700 px-6 flex items-center text-white">
                <FaSearch />
              </button>

            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURED CARS */}
      <section className="max-w-7xl mx-auto px-6 py-16">

        <h2 className="text-3xl font-bold text-center mb-12">
          Featured Cars
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          {[1, 2, 3].map((car) => (
            <motion.div
              whileHover={{ scale: 1.05 }}
              key={car}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >

              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70"
                alt="car"
                className="h-48 w-full object-cover"
              />

              <div className="p-4">

                <h3 className="text-xl font-semibold">
                  BMW X5
                </h3>

                <p className="text-gray-500">
                  2022 • Petrol • Automatic
                </p>

                <p className="text-indigo-600 font-bold mt-2">
                  ₹45,00,000
                </p>

                <button className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-2 rounded-lg hover:opacity-90">
                  View Details
                </button>

              </div>
            </motion.div>
          ))}

        </div>
      </section>

      {/* WHY CHOOSE US */}
      {/* <section className="bg-gray-50 py-16">

        <div className="max-w-7xl mx-auto px-6">

          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Car Scout
          </h2>

          <div className="grid md:grid-cols-3 gap-10 text-center">

            <div className="p-6 bg-white shadow rounded-lg">
              <h3 className="text-xl font-semibold mb-2">
                Huge Car Collection
              </h3>
              <p className="text-gray-500">
                Explore thousands of cars from trusted sellers.
              </p>
            </div>

            <div className="p-6 bg-white shadow rounded-lg">
              <h3 className="text-xl font-semibold mb-2">
                Verified Listings
              </h3>
              <p className="text-gray-500">
                Every car is verified by our admin team.
              </p>
            </div>

            <div className="p-6 bg-white shadow rounded-lg">
              <h3 className="text-xl font-semibold mb-2">
                Easy Test Drive
              </h3>
              <p className="text-gray-500">
                Request a test drive with a single click.
              </p>
            </div>

          </div>
        </div>
      </section> */}

      {/* CTA SECTION */}
      <section className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-16 text-center">

        <h2 className="text-3xl font-bold mb-4">
          Ready to Sell Your Car?
        </h2>

        <p className="mb-6">
          List your car and reach thousands of buyers instantly.
        </p>

        <Link to="/sellcar">
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:scale-105 transition">
            Sell Your Car
          </button>
        </Link>

      </section>

    </div>
  );
};

export default Home;