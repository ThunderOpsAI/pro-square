import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { round, DEFAULT_INCOME_TAX_RATE } from '@/lib/financial-calculator';

const STANDARD_EXPENSE_CATEGORIES = [
  'MATERIALS',
  'TOOLS',
  'FUEL_VEHICLE',
  'INSURANCE',
  'SUBCONTRACTOR',
  'MARKETING',
  'SOFTWARE',
  'GENERAL',
] as const;

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const currentYear = new Date().getFullYear();
    const yearParam = searchParams.get('year');
    const selectedYear = yearParam ? parseInt(yearParam, 10) : currentYear;
    const year = isNaN(selectedYear) ? currentYear : selectedYear;

    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const taxRateParam = searchParams.get('taxRate');
    const taxRate = taxRateParam ? Math.max(0, parseFloat(taxRateParam)) : DEFAULT_INCOME_TAX_RATE;

    // Date bounds for the year
    const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    // Date range for general totals
    let filterStart = startOfYear;
    let filterEnd = endOfYear;

    if (startDateParam) {
      const parsed = new Date(startDateParam);
      if (!isNaN(parsed.getTime())) filterStart = parsed;
    }
    if (endDateParam) {
      const parsed = new Date(endDateParam);
      if (!isNaN(parsed.getTime())) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(endDateParam)) {
          parsed.setHours(23, 59, 59, 999);
        }
        filterEnd = parsed;
      }
    }

    // Fetch all transactions in the filtered range (and all for the year for monthly trend)
    const [periodTransactions, yearTransactions, personalPeriodTransactions] = await Promise.all([
      // Business transactions in filter range
      prisma.budgetTransaction.findMany({
        where: {
          isPersonal: false,
          date: {
            gte: filterStart,
            lte: filterEnd,
          },
        },
      }),
      // Business transactions in current/selected full year for monthly trends
      prisma.budgetTransaction.findMany({
        where: {
          isPersonal: false,
          date: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
      }),
      // Personal transactions in period (for audit/separation visibility)
      prisma.budgetTransaction.findMany({
        where: {
          isPersonal: true,
          date: {
            gte: filterStart,
            lte: filterEnd,
          },
        },
      }),
    ]);

    // 1. Calculate Period Totals (Business)
    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeGstCollected = 0;
    let expenseGstPaid = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    // Initialise standard expense categories breakdown
    const expenseBreakdown: Record<string, { total: number; percentage: number; count: number }> = {};
    for (const cat of STANDARD_EXPENSE_CATEGORIES) {
      expenseBreakdown[cat] = { total: 0, percentage: 0, count: 0 };
    }

    for (const tx of periodTransactions) {
      const amt = round(tx.amount);
      const gst = round(tx.gstAmount);

      if (tx.type === 'INCOME') {
        totalIncome = round(totalIncome + amt);
        incomeGstCollected = round(incomeGstCollected + gst);
        incomeCount++;
      } else if (tx.type === 'EXPENSE') {
        totalExpenses = round(totalExpenses + amt);
        expenseGstPaid = round(expenseGstPaid + gst);
        expenseCount++;

        const categoryKey = tx.category.toUpperCase().trim() || 'GENERAL';
        if (!expenseBreakdown[categoryKey]) {
          expenseBreakdown[categoryKey] = { total: 0, percentage: 0, count: 0 };
        }
        expenseBreakdown[categoryKey].total = round(expenseBreakdown[categoryKey].total + amt);
        expenseBreakdown[categoryKey].count += 1;
      }
    }

    // Calculate percentage breakdown for expenses
    for (const catKey of Object.keys(expenseBreakdown)) {
      if (totalExpenses > 0) {
        expenseBreakdown[catKey].percentage = round(
          (expenseBreakdown[catKey].total / totalExpenses) * 100
        );
      } else {
        expenseBreakdown[catKey].percentage = 0;
      }
    }

    // 2. Net Operating Profit
    const netOperatingProfit = round(totalIncome - totalExpenses);

    // 3. GST Vault / BAS Reserve (Net GST owed to ATO = GST collected on income minus GST paid on expenses)
    const netGstOwed = round(incomeGstCollected - expenseGstPaid);

    // 4. Income Tax Reserve Recommendation (e.g. 25% on net operating profit if positive)
    const incomeTaxReserve = netOperatingProfit > 0
      ? round(netOperatingProfit * (taxRate / 100))
      : 0;

    // 5. True Take-Home Cash Available
    // Formula: Net Operating Profit - Income Tax Reserve - Net GST Owed
    const trueTakeHomeCash = round(netOperatingProfit - incomeTaxReserve - netGstOwed);

    // 6. Personal expenses summary
    let personalExpensesTotal = 0;
    for (const tx of personalPeriodTransactions) {
      if (tx.type === 'EXPENSE') {
        personalExpensesTotal = round(personalExpensesTotal + tx.amount);
      }
    }

    // 7. Monthly trends for the current/selected year (Months 1-12)
    const monthlyTrends = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      return {
        month: monthNum,
        monthName: MONTH_NAMES[i],
        income: 0,
        expenses: 0,
        netProfit: 0,
        gstCollected: 0,
        gstPaid: 0,
        transactionCount: 0,
      };
    });

    for (const tx of yearTransactions) {
      const txMonth = new Date(tx.date).getMonth(); // 0 to 11
      if (txMonth >= 0 && txMonth <= 11) {
        const amt = round(tx.amount);
        const gst = round(tx.gstAmount);
        monthlyTrends[txMonth].transactionCount += 1;

        if (tx.type === 'INCOME') {
          monthlyTrends[txMonth].income = round(monthlyTrends[txMonth].income + amt);
          monthlyTrends[txMonth].gstCollected = round(monthlyTrends[txMonth].gstCollected + gst);
        } else if (tx.type === 'EXPENSE') {
          monthlyTrends[txMonth].expenses = round(monthlyTrends[txMonth].expenses + amt);
          monthlyTrends[txMonth].gstPaid = round(monthlyTrends[txMonth].gstPaid + gst);
        }
      }
    }

    // Finalize monthly net profit
    for (const m of monthlyTrends) {
      m.netProfit = round(m.income - m.expenses);
    }

    return NextResponse.json({
      success: true,
      summary: {
        year,
        period: {
          startDate: filterStart.toISOString(),
          endDate: filterEnd.toISOString(),
        },
        totalIncome,
        totalExpenses,
        netOperatingProfit,
        gstVault: {
          gstCollected: incomeGstCollected,
          gstPaid: expenseGstPaid,
          netGstOwed,
          description:
            netGstOwed >= 0
              ? `Estimated ATO BAS GST Liability: $${netGstOwed.toFixed(2)}`
              : `Estimated ATO BAS GST Refund: $${Math.abs(netGstOwed).toFixed(2)}`,
        },
        taxReserve: {
          recommendedRate: taxRate,
          amount: incomeTaxReserve,
          description: `${taxRate}% set aside for estimated income tax on profit`,
        },
        trueTakeHomeCash,
        expenseBreakdown,
        monthlyTrends,
        transactionCounts: {
          total: periodTransactions.length,
          income: incomeCount,
          expenses: expenseCount,
          personal: personalPeriodTransactions.length,
        },
        personalExpensesTotal,
      },
    });
  } catch (error) {
    console.error('[Admin Budget Summary GET Error]', error);
    return NextResponse.json(
      { error: 'Failed to calculate budget summary' },
      { status: 500 }
    );
  }
}
