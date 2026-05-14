import React from 'react';

const CustomInput = ({ label, type = "text", placeholder, value, onChange, name, ...props }) => {
    return (
        <div className="w-full !mb-5 text-left">

            {label && (
                <label className="!block !text-gray-700 !text-[13px] !font-semibold !mb-1.5 !ml-1">
                    {label}
                </label>
            )}


            <input
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="!w-full !px-4 !py-3 !border !border-gray-300 !rounded-xl !shadow-sm !bg-white
                           !text-sm !text-gray-900 !transition-all !duration-200
                           placeholder:!text-gray-300
                           focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !outline-none"

            />
        </div>
    );
};

export default CustomInput;