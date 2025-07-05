export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
  meta?: ApiMeta;
}

export interface ApiError {
  field?: string;
  code: string;
  message: string;
  details?: any;
}

export interface ApiMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
}

export interface LoadingState {
  loading: boolean;
  error?: string;
  lastUpdated?: Date;
}

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'currency' | 'badge' | 'actions';
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
}

export interface ActionButton {
  label: string;
  icon?: string;
  action: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  tooltip?: string;
}

export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface DashboardCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
  color?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  route?: string;
  active?: boolean;
}

export interface MenuItem {
  label: string;
  icon?: string;
  route?: string;
  children?: MenuItem[];
  badge?: {
    text: string;
    variant: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  };
  disabled?: boolean;
  divider?: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: SelectOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
  grid?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

export interface ModalConfig {
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  backdrop?: boolean;
  keyboard?: boolean;
  centered?: boolean;
}

export interface ExportConfig {
  format: 'pdf' | 'excel' | 'csv';
  filename?: string;
  title?: string;
  orientation?: 'portrait' | 'landscape';
  columns?: string[];
  filters?: Record<string, any>;
}