import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { transactionsService } from "@/services/api/transactionsService";
import { formatCurrency } from "@/utils/formatters";

const IncomeExpenseChart = ({ months = 6 }) => {
  const [data, setData] = useState({ income: [], expenses: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadChartData();
  }, [months]);

  const loadChartData = async () => {
    setLoading(true);
    setError("");

    try {
      const transactions = await transactionsService.getAll();
      
      if (transactions.length === 0) {
        setData({ income: [], expenses: [], categories: [] });
        return;
      }

      // Get last N months
      const currentDate = new Date();
      const monthsData = [];
      
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const monthLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        
        monthsData.push({
          key: monthKey,
          label: monthLabel,
          income: 0,
          expenses: 0
        });
      }

      // Aggregate transactions by month
transactions.forEach(transaction => {
        const transactionMonth = transaction.date.substring(0, 7); // YYYY-MM
        const monthData = monthsData.find(m => m.key === transactionMonth);
        
        if (monthData) {
if (transaction.type_c === "income") {
            monthData.income += transaction.amount_c;
          } else {
            monthData.expenses += transaction.amount_c;
          }
        }
      });

      setData({
        income: monthsData.map(m => m.income),
        expenses: monthsData.map(m => m.expenses),
        categories: monthsData.map(m => m.label)
      });
    } catch (err) {
      console.error("Error loading chart data:", err);
      setError("Failed to load chart data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading type="chart" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadChartData} />;
  }

  if (data.categories.length === 0) {
    return <Empty type="transactions" />;
  }

  const chartOptions = {
    chart: {
      type: "line",
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      }
    },
    colors: ["#10b981", "#ef4444"],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "smooth",
      width: 3
    },
    xaxis: {
      categories: data.categories,
      labels: {
        style: {
          fontSize: "12px",
          fontWeight: 500
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function(val) {
          return formatCurrency(val);
        },
        style: {
          fontSize: "12px",
          fontWeight: 500
        }
      }
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "14px",
      fontWeight: 500,
      markers: {
        width: 8,
        height: 8,
        strokeWidth: 0,
        radius: 4
      }
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return formatCurrency(val);
        }
      },
      shared: true,
      intersect: false
    },
    markers: {
      size: 6,
      strokeWidth: 2,
      strokeColors: "#ffffff",
      hover: {
        size: 8
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          height: 300
        },
        legend: {
          position: "bottom"
        }
      }
    }]
  };

  const chartSeries = [
    {
      name: "Income",
      data: data.income
    },
    {
      name: "Expenses",
      data: data.expenses
    }
  ];

  return (
    <Card>
      <Card.Header>
        <h3 className="text-lg font-semibold text-gray-900">
          Income vs Expenses Trend
        </h3>
      </Card.Header>
      <Card.Content>
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="line"
          height={400}
        />
      </Card.Content>
    </Card>
  );
};

export default IncomeExpenseChart;