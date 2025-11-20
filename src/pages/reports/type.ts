export interface IReportFilters {
  dateRange: {
    startDate: number | null;
    endDate: number | null;
    value: string;
    showDateRange: boolean;
    options: Array<{ label: string; value: string }>;
  };
  categories: string[];
  groupBy: string;
  type: string;
}
