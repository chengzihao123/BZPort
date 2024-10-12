import React from 'react';

function Dropdown({ label, value, options, onChange }) {
    return (
        <div className="dropdown">
            <label>{label}: </label>
            <select value={value} onChange={(e) => onChange(e.target.value)}>
                <option value="">Select {label}</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default Dropdown;
