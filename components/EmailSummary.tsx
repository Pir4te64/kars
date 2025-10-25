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
    <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-3xl shadow-xl p-6 sm:p-10 max-w-4xl mx-auto mt-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-700 rounded-full mb-4">
          <svg
            className="w-7 h-7 text-white"
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
        <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">
          Recibe tu cotización por email
        </h3>
        <p className="text-sm text-slate-600">
          Te enviaremos un resumen completo a tu correo
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Correo electrónico
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-5 py-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none bg-white transition-all"
              required
            />
          </div>
        </div>

        {/* Checkbox */}
        <div className="flex items-start bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <input
            type="checkbox"
            id="wantEstimate"
            checked={wantEstimate}
            onChange={(e) => setWantEstimate(e.target.checked)}
            className="w-5 h-5 text-slate-800 border-slate-300 rounded focus:ring-slate-500 mt-0.5"
          />
          <label htmlFor="wantEstimate" className="ml-3 text-sm text-slate-700 font-medium">
            Sí, quiero recibir mi cotización detallada por correo electrónico
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-slate-800 to-slate-700 text-white font-bold py-4 px-6 rounded-full hover:scale-105 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Enviar a mi correo
        </button>
      </form>
    </div>
  );
}
