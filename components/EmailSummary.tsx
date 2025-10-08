"use client";

import { useState, FormEvent } from "react";

export default function EmailSummary() {
  const [email, setEmail] = useState("");
  const [wantEstimate, setWantEstimate] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí se puede agregar la lógica para enviar el email
    console.log("Enviando email a:", email, "Con estimado:", wantEstimate);
    alert("¡Resumen enviado exitosamente!");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 max-w-4xl mx-auto mt-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900">
          Enviar resumen a tu correo
        </h3>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correo electrónico
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-400 text-lg">@</span>
            </div>
          </div>
        </div>

        {/* Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="wantEstimate"
            checked={wantEstimate}
            onChange={(e) => setWantEstimate(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="wantEstimate" className="ml-2 text-sm text-gray-700">
            Quiero recibir mi estimado por correo
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 sm:px-6 rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base"
        >
          Enviar a mi correo
        </button>
      </form>
    </div>
  );
}
