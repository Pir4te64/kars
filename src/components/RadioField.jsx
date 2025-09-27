import React from "react";

const RadioField = ({ label, name, value, onChange, options = [], disabled = false, ...rest }) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
    )}
    <div className="flex space-x-6">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={onChange}
            className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            disabled={disabled}
            {...rest}
          />
          <span className="ml-2 text-gray-700">{opt.label}</span>
        </label>
      ))}
    </div>
  </div>
);

export default RadioField;
