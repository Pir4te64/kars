import React from "react";

const InputField = ({ label, name, value, onChange, type = "text", placeholder = "", disabled = false, ...rest }) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor={name}>
        {label}
      </label>
    )}
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      disabled={disabled}
      {...rest}
    />
  </div>
);

export default InputField;
