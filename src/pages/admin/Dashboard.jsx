import AdminLayout from "../../components/admin/AdminLayout";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

// ========== ChartJS ==========
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

// ================================
// 📌 Minimal Line Chart
// ================================
function MinimalLineChart({ data, labels, height = 260 }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: "",
        data,
        borderColor: "#0F172A",
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.25,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        ticks: {
          font: { size: 11 },
          color: "#6B7280",
        },
        grid: { display: false },
      },
      y: {
        ticks: { display: false },
        grid: { drawBorder: false },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

// ================================
// 📌 Dashboard 主元件
// ================================
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [weeklyLabels, setWeeklyLabels] = useState([]);
  const [ordersCount, setOrdersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // -------- 近 7天標籤 --------
  const getLast7Days = () => {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }
    return arr;
  };

  // -------- 讀取資料 --------
  useEffect(() => {
    const loadData = async () => {
      try {
        const orderSnap = await getDocs(
          query(collection(db, "orders"), orderBy("createdAt", "desc"))
        );
        const orders = orderSnap.docs.map((d) => d.data());

        setOrdersCount(orders.length);

        const productsSnap = await getDocs(collection(db, "products"));
        setProductsCount(productsSnap.size);

        const revenueSum = orders.reduce(
          (acc, o) => acc + (o.total ?? 0),
          0
        );
        setTotalRevenue(revenueSum);

        // 近 7 天營收
        const labels = getLast7Days();
        const daily = Array(7).fill(0);
        const today = new Date();

        orders.forEach((o) => {
          if (!o.createdAt || !o.total) return;
          const diff = Math.floor(
            (today - o.createdAt.toDate()) / (1000 * 60 * 60 * 24)
          );
          if (diff >= 0 && diff < 7) daily[6 - diff] += o.total;
        });

        setWeeklyLabels(labels);
        setWeeklyRevenue(daily);
      } catch (e) {
        console.error("Dashboard error:", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // -------- 載入畫面 --------
  if (loading) {
    return (
      <AdminLayout>
        <div className="w-full flex justify-center py-20 text-gray-500">
          讀取中…
        </div>
      </AdminLayout>
    );
  }

  // -------- 主畫面 --------
  return (
    
      <div className="max-w-6xl mx-auto space-y-10 px-6 pb-20">
        <h1 className="text-3xl font-semibold tracking-wide text-gray-800 pt-2">
          Dashboard
        </h1>

        {/* KPI 區塊 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500 text-xs">總營收</p>
            <p className="text-3xl font-bold mt-2">NT$ {totalRevenue}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500 text-xs">商品數</p>
            <p className="text-3xl font-bold mt-2">{productsCount}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500 text-xs">訂單數</p>
            <p className="text-3xl font-bold mt-2">{ordersCount}</p>
          </div>
        </div>

        {/* 折線圖 */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500 text-xs mb-3">最近 7 天營收</p>
          <MinimalLineChart
            data={weeklyRevenue}
            labels={weeklyLabels}
            height={260}
          />
        </div>
      </div>
   
  );
}
