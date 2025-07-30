import React from 'react';
import { adminClasses } from '../styles/adminTheme';

// AdminJS-inspired Button Component
export const AdminButton = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  icon: Icon, 
  loading = false, 
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-primary-500',
    danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-primary-500',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button 
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {Icon && !loading && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

// AdminJS-inspired Card Component
export const AdminCard = ({ 
  title, 
  description, 
  children, 
  actions,
  className = '',
  ...props 
}) => {
  return (
    <div className={`${adminClasses.card} ${className}`} {...props}>
      {(title || description || actions) && (
        <div className={`${adminClasses.cardHeader} flex items-center justify-between`}>
          <div>
            {title && <h3 className={adminClasses.heading3}>{title}</h3>}
            {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
          </div>
          {actions && <div className="flex items-center space-x-3">{actions}</div>}
        </div>
      )}
      <div className={adminClasses.cardBody}>
        {children}
      </div>
    </div>
  );
};

// AdminJS-inspired Input Component
export const AdminInput = ({ 
  label, 
  error, 
  helpText,
  icon: Icon,
  className = '',
  ...props 
}) => {
  return (
    <div className={adminClasses.formGroup}>
      {label && (
        <label className={adminClasses.label}>
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input 
          className={`${adminClasses.input} ${Icon ? 'pl-10' : ''} ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helpText && !error && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
    </div>
  );
};

// AdminJS-inspired Select Component
export const AdminSelect = ({ 
  label, 
  error, 
  helpText,
  options = [],
  className = '',
  ...props 
}) => {
  return (
    <div className={adminClasses.formGroup}>
      {label && (
        <label className={adminClasses.label}>
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select 
        className={`${adminClasses.select} ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
        {...props}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helpText && !error && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
    </div>
  );
};

// AdminJS-inspired Textarea Component
export const AdminTextarea = ({ 
  label, 
  error, 
  helpText,
  className = '',
  ...props 
}) => {
  return (
    <div className={adminClasses.formGroup}>
      {label && (
        <label className={adminClasses.label}>
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea 
        className={`${adminClasses.textarea} ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helpText && !error && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
    </div>
  );
};

// AdminJS-inspired Badge Component
export const AdminBadge = ({ 
  variant = 'gray', 
  children, 
  className = '',
  ...props 
}) => {
  const variants = {
    success: adminClasses.badgeSuccess,
    warning: adminClasses.badgeWarning,
    error: adminClasses.badgeError,
    info: adminClasses.badgeInfo,
    gray: adminClasses.badgeGray,
  };
  
  return (
    <span className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

// AdminJS-inspired Table Component
export const AdminTable = ({ 
  columns = [], 
  data = [], 
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  ...props 
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={adminClasses.spinner}></div>
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div className={adminClasses.emptyState}>
        <div className={adminClasses.emptyStateTitle}>{emptyMessage}</div>
      </div>
    );
  }
  
  return (
    <div className="overflow-hidden">
      <table className={`${adminClasses.table} ${className}`} {...props}>
        <thead className={adminClasses.tableHeader}>
          <tr>
            {columns.map((column, index) => (
              <th key={index} className={adminClasses.tableHeaderCell}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={adminClasses.tableBody}>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={adminClasses.tableRow}>
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={adminClasses.tableCell}>
                  {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// AdminJS-inspired Loading Component
export const AdminLoading = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className={adminClasses.spinner}></div>
      <p className="mt-4 text-sm text-gray-600">{message}</p>
    </div>
  );
};

// AdminJS-inspired Empty State Component
export const AdminEmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = '' 
}) => {
  return (
    <div className={`${adminClasses.emptyState} ${className}`}>
      {Icon && <Icon className={adminClasses.emptyStateIcon} />}
      {title && <h3 className={adminClasses.emptyStateTitle}>{title}</h3>}
      {description && <p className={adminClasses.emptyStateDescription}>{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

// AdminJS-inspired Alert Component
export const AdminAlert = ({ 
  variant = 'info', 
  title, 
  children, 
  onClose,
  className = '',
  ...props 
}) => {
  const variants = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  
  const iconVariants = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ⓘ',
  };
  
  return (
    <div className={`rounded-md border p-4 ${variants[variant]} ${className}`} {...props}>
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-lg">{iconVariants[variant]}</span>
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          <div className={`text-sm ${title ? 'mt-1' : ''}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            >
              <span className="text-lg">×</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminBadge,
  AdminTable,
  AdminLoading,
  AdminEmptyState,
  AdminAlert,
};