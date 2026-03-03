import React from 'react';

export default function Input({ icon: Icon, className = '', ...props }) {
  return (
    <div className={`relative flex items-center ${className}`}>
      {Icon && <Icon size={18} className="absolute left-4 text-brand-text-secondary" />}
      <input 
        className={`bg-brand-input border border-brand-border rounded-lg py-3 pr-4 text-brand-text-primary text-sm w-full transition-colors duration-200 focus:border-brand-primary focus:outline-none placeholder:text-brand-text-secondary ${Icon ? 'pl-10' : 'pl-4'}`} 
        {...props} 
      />
    </div>
  );
}
