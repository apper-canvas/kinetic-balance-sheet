import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { transactionsService } from "@/services/api/transactionsService";
import { categoriesService } from "@/services/api/categoriesService";
import { getCurrentMonth } from "@/utils/formatters";

const ExpensePieChart = ({ month = getCurrentMonth() }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadChartData();
  }, [month]);

  const loadChartData = async () => {
    setLoading(true);
    setError("");

    try {
      const [transactions, categories] = await Promise.all([
        transactionsService.getByMonth(month),
        categoriesService.getAll()
      ]);

      const expenses = transactions.filter(t => t.type === "expense");
      
      if (expenses.length === 0) {
        setData([]);
        return;
      }

      // Group expenses by category
      const categoryTotals = {};
      expenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
          categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
      });

      // Create chart data with colors
      const chartData = Object.entries(categoryTotals).map(([categoryName, amount]) => {
        const category = categories.find(cat => cat.name === categoryName);
        return {
          category: categoryName,
          amount: amount,
          color: category?.color || "#6b7280"
        };
      });

      setData(chartData.sort((a, b) => b.amount - a.amount));
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

  if (data.length === 0) {
    return <Empty type="transactions" />;
  }

  const chartOptions = {
    chart: {
      type: "pie",
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false
      }
    },
    labels: data.map(item => item.category),
    colors: data.map(item => item.color),
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      fontWeight: 500,
      markers: {
        width: 12,
        height: 12,
        strokeWidth: 0,
        radius: 2
      }
    },
    plotOptions: {
      pie: {
        size: 300,
        donut: {
          size: "0%"
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val, opts) {
        const amount = data[opts.seriesIndex].amount;
        return `$${Math.round(amount)}`;
      },
      style: {
        fontSize: "12px",
        fontWeight: 600
      },
      dropShadow: {
        enabled: false
      }
    },
    tooltip: {
      y: {
        formatter: function(val, { seriesIndex }) {
          const amount = data[seriesIndex].amount;
          const total = data.reduce((sum, item) => sum + item.amount, 0);
          const percentage = ((amount / total) * 100).toFixed(1);
          return `$${amount.toFixed(2)} (${percentage}%)`;
        }
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300
        },
        legend: {
          position: "bottom"
        }
      }
    }]
  };

  const chartSeries = data.map(item => item.amount);

  return (
    <Card>
      <Card.Header>
        <h3 className="text-lg font-semibold text-gray-900">
          Expenses by Category
        </h3>
      </Card.Header>
      <Card.Content>
        <div className="flex justify-center">
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="pie"
            height={400}
          />
        </div>
      </Card.Content>
    </Card>
  );
};

export default ExpensePieChart;