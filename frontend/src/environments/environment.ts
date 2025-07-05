export const environment = {
  production: false,
  apiUrl: 'http://localhost:5001/api',
  appName: 'DebtManager - Paschoalotto',
  version: '1.0.0',
  features: {
    enableNotifications: true,
    enableExports: true,
    enableCharts: true,
    enableDarkMode: true,
    enableRealTimeUpdates: false
  },
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100]
  },
  currency: {
    code: 'BRL',
    symbol: 'R$',
    locale: 'pt-BR'
  },
  dateFormat: {
    short: 'dd/MM/yyyy',
    long: 'dd/MM/yyyy HH:mm',
    display: 'dd/MM/yyyy'
  },
  validation: {
    cpfPattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    cnpjPattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    phonePattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/
  },
  ui: {
    toastDuration: 5000,
    loadingDelay: 300,
    animationDuration: 300
  }
};