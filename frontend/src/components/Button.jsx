import React from 'react';

export default function Button({ children, variant = 'primary', icon: Icon, className = '', ...props }) {
  const baseClass = 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200';
  const variantClass = variant === 'primary' 
    ? 'bg-brand-primary text-white hover:bg-brand-primary-hover' 
    : 'bg-transparent border border-brand-border text-brand-text-primary hover:bg-brand-input';
  
  return (
    <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
}
