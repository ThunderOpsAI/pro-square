export type TransactionType = 'INCOME' | 'EXPENSE';

export type ExpenseCategory =
  | 'MATERIALS'
  | 'TOOLS'
  | 'FUEL_VEHICLE'
  | 'INSURANCE'
  | 'SUBCONTRACTOR'
  | 'MARKETING'
  | 'SOFTWARE'
  | 'GENERAL';

export type IncomeCategory =
  | 'REVENUE_QUOTE'
  | 'DEPOSIT'
  | 'LABOUR_INVOICE'
  | 'GENERAL';

export interface LinkedQuoteInfo {
  id: string;
  quoteNumber: string;
  customerName: string;
  projectType: string;
  totalIncGst?: number;
  materialCost?: number;
}

export interface BudgetTransaction {
  id: string;
  quoteId: string | null;
  type: TransactionType;
  category: string;
  amount: number;
  gstAmount: number;
  isTaxDeductible: boolean;
  description: string;
  date: string;
  reference: string | null;
  paymentMethod: string | null;
  isPersonal: boolean;
  createdAt: string;
  updatedAt: string;
  quote?: LinkedQuoteInfo | null;
}

export interface GstVaultSummary {
  gstCollected: number;
  gstPaid: number;
  netGstOwed: number;
  description: string;
}

export interface TaxReserveSummary {
  recommendedRate: number;
  amount: number;
  description: string;
}

export interface MonthlyTrendData {
  month: number;
  monthName: string;
  income: number;
  expenses: number;
  netProfit: number;
  gstCollected: number;
  gstPaid: number;
  transactionCount: number;
}

export interface ExpenseBreakdownItem {
  total: number;
  percentage: number;
  count: number;
}

export interface BudgetSummary {
  year: number;
  period: {
    startDate: string;
    endDate: string;
  };
  totalIncome: number;
  totalExpenses: number;
  netOperatingProfit: number;
  gstVault: GstVaultSummary;
  taxReserve: TaxReserveSummary;
  trueTakeHomeCash: number;
  expenseBreakdown: Record<string, ExpenseBreakdownItem>;
  monthlyTrends: MonthlyTrendData[];
  transactionCounts: {
    total: number;
    income: number;
    expenses: number;
    personal: number;
  };
  personalExpensesTotal: number;
}

export interface TransactionFormData {
  id?: string;
  type: TransactionType;
  category: string;
  amount: number | string;
  gstAmount?: number | string;
  autoGst: boolean;
  isTaxDeductible: boolean;
  description: string;
  date: string;
  reference: string;
  paymentMethod: string;
  isPersonal: boolean;
  quoteId?: string;
}
