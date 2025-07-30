// AdminJS-inspired Design System
export const adminTheme = {
  colors: {
    // Primary colors (AdminJS style)
    primary: '#3040D6',
    primaryLight: '#4C63D2',
    primaryDark: '#1E2A78',
    
    // Secondary colors
    secondary: '#F8FAFC',
    secondaryDark: '#E2E8F0',
    
    // Status colors
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Neutral colors
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    
    // Background colors
    bg: '#F8FAFC',
    cardBg: '#FFFFFF',
    sidebarBg: '#1F2937',
    sidebarHover: '#374151',
    
    // Text colors
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',
    textInverse: '#FFFFFF',
    
    // Border colors
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    borderDark: '#D1D5DB',
  },
  
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Monaco', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.625',
    },
  },
  
  components: {
    button: {
      primary: {
        bg: '#3040D6',
        hover: '#1E2A78',
        text: '#FFFFFF',
        border: 'transparent',
      },
      secondary: {
        bg: '#FFFFFF',
        hover: '#F3F4F6',
        text: '#374151',
        border: '#D1D5DB',
      },
      danger: {
        bg: '#EF4444',
        hover: '#DC2626',
        text: '#FFFFFF',
        border: 'transparent',
      },
    },
    input: {
      bg: '#FFFFFF',
      border: '#D1D5DB',
      focus: '#3040D6',
      text: '#111827',
      placeholder: '#9CA3AF',
    },
    card: {
      bg: '#FFFFFF',
      border: '#E5E7EB',
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
    sidebar: {
      bg: '#1F2937',
      item: '#9CA3AF',
      itemHover: '#FFFFFF',
      itemActive: '#3040D6',
    },
  },
  
  layout: {
    sidebarWidth: '16rem',
    headerHeight: '4rem',
    contentPadding: '1.5rem',
  },
};

// AdminJS-inspired utility classes
export const adminClasses = {
  // Layout
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  page: 'min-h-screen bg-gray-50',
  card: 'bg-white rounded-lg border border-gray-200 shadow-sm',
  cardHeader: 'px-6 py-4 border-b border-gray-200',
  cardBody: 'px-6 py-4',
  cardFooter: 'px-6 py-4 border-t border-gray-200 bg-gray-50',
  
  // Typography
  heading1: 'text-2xl font-bold text-gray-900',
  heading2: 'text-xl font-semibold text-gray-900',
  heading3: 'text-lg font-medium text-gray-900',
  heading4: 'text-base font-medium text-gray-900',
  bodyText: 'text-sm text-gray-700',
  captionText: 'text-xs text-gray-500',
  
  // Buttons
  btnPrimary: 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors',
  btnSecondary: 'inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors',
  btnDanger: 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors',
  
  // Forms
  formGroup: 'mb-4',
  label: 'block text-sm font-medium text-gray-700 mb-2',
  input: 'block w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors',
  select: 'block w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors',
  textarea: 'block w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors',
  
  // Tables
  table: 'min-w-full divide-y divide-gray-200',
  tableHeader: 'bg-gray-50',
  tableHeaderCell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  tableBody: 'bg-white divide-y divide-gray-200',
  tableRow: 'hover:bg-gray-50 transition-colors',
  tableCell: 'px-6 py-4 whitespace-nowrap text-sm',
  
  // Status badges
  badgeSuccess: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
  badgeWarning: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
  badgeError: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
  badgeInfo: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
  badgeGray: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
  
  // Sidebar
  sidebar: 'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transition-transform transform -translate-x-full lg:translate-x-0',
  sidebarContent: 'flex flex-col h-full',
  sidebarHeader: 'flex items-center h-16 px-6 bg-gray-800',
  sidebarNav: 'flex-1 px-4 py-6 space-y-1',
  sidebarItem: 'group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors',
  sidebarItemActive: 'group flex items-center px-2 py-2 text-sm font-medium rounded-md bg-primary-600 text-white',
  
  // Header
  header: 'bg-white shadow-sm border-b border-gray-200',
  headerContent: 'flex items-center justify-between h-16 px-6',
  
  // Content
  main: 'flex-1 lg:ml-64',
  content: 'p-6',
  
  // Loading
  spinner: 'animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600',
  
  // Empty states
  emptyState: 'text-center py-12',
  emptyStateIcon: 'mx-auto h-12 w-12 text-gray-400',
  emptyStateTitle: 'mt-2 text-sm font-medium text-gray-900',
  emptyStateDescription: 'mt-1 text-sm text-gray-500',
};

export default adminTheme;