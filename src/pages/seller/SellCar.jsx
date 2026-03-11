import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaCar, FaImage } from "react-icons/fa";
import axios from "axios";

const SellCar = () => {
  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: "",
    price: "",
    mileage: "",
    fuelType: "",
    transmission: "",
    description: "",
  });

  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    setPreview(URL.createObjectURL(file));
  };

  const submitForm = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:4444/api/cars", form);
      alert("Car submitted successfully");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-cyan-50 flex items-center justify-center p-6">

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-2xl w-full max-w-4xl p-10"
      >
        {/* HEADER */}
        <div className="text-center mb-8">
          <FaCar className="text-4xl text-indigo-500 mx-auto mb-3" />
          <h2 className="text-3xl font-bold">Sell Your Car</h2>
          <p className="text-gray-500">
            List your vehicle and reach thousands of buyers
          </p>
        </div>

        <form
          onSubmit={submitForm}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Brand */}
          <input
            type="text"
            name="brand"
            placeholder="Car Brand"
            onChange={handleChange}
            className="border rounded-lg p-3 focus:ring-2 focus:ring-indigo-400"
          />

          {/* Model */}
          <input
            type="text"
            name="model"
            placeholder="Model"
            onChange={handleChange}
            className="border rounded-lg p-3 focus:ring-2 focus:ring-indigo-400"
          />

          {/* Year */}
          <input
            type="number"
            name="year"
            placeholder="Manufacturing Year"
            onChange={handleChange}
            className="border rounded-lg p-3 focus:ring-2 focus:ring-indigo-400"
          />

          {/* Price */}
          <input
            type="number"
            name="price"
            placeholder="Price ₹"
            onChange={handleChange}
            className="border rounded-lg p-3 focus:ring-2 focus:ring-indigo-400"
          />

          {/* Mileage */}
          <input
            type="number"
            name="mileage"
            placeholder="Mileage (KM)"
            onChange={handleChange}
            className="border rounded-lg p-3 focus:ring-2 focus:ring-indigo-400"
          />

          {/* Fuel */}
          <select
            name="fuelType"
            onChange={handleChange}
            className="border rounded-lg p-3 focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Fuel Type</option>
            <option>Petrol</option>
            <option>Diesel</option>
            <option>Electric</option>
          </select>

          {/* Transmission */}
          <select
            name="transmission"
            onChange={handleChange}
            className="border rounded-lg p-3 focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Transmission</option>
            <option>Manual</option>
            <option>Automatic</option>
          </select>

          {/* Image Upload */}
          <label className="border rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50">
            <FaImage />
            Upload Car Image
            <input
              type="file"
              className="hidden"
              onChange={handleImage}
            />
          </label>

          {/* Image Preview */}
          {preview && (
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={preview}
              className="rounded-lg h-32 object-cover"
            />
          )}

          {/* Description */}
          <textarea
            name="description"
            placeholder="Car Description"
            onChange={handleChange}
            className="border rounded-lg p-3 md:col-span-2"
          />

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="md:col-span-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-3 rounded-lg font-semibold shadow-lg"
          >
            sell Your Car
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default SellCar;