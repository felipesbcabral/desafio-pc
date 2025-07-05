export const environment = {
  production: true,
  apiUrl: 'https://api.debtmanager.paschoalotto.com.br/api/v1',
  appName: 'DebtManager - Paschoalotto',
  version: '1.0.0',
  features: {
    enableNotifications: true,
    enableExports: true,
    enableCharts: true,
    enableDarkMode: true,
    enableRealTimeUpdates: true
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
    toastDuration: 3000,
    loadingDelay: 200,
    animationDuration: 200
  }
};