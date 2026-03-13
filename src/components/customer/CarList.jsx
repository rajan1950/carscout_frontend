import React from "react";

export const CarList = () => {
  const demoCars = [
    { id: 1, name: "Hyundai Creta", price: "Rs. 14.5L" },
    { id: 2, name: "Mahindra XUV700", price: "Rs. 18.2L" },
    { id: 3, name: "Tata Nexon", price: "Rs. 11.1L" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Available Cars</h2>
      <div className="space-y-3">
        {demoCars.map((car) => (
          <div
            key={car.id}
            className="border rounded-lg px-4 py-3 bg-white shadow-sm"
          >
            <p className="font-medium">{car.name}</p>
            <p className="text-gray-600">{car.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
