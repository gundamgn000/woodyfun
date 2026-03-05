import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  where,
  documentId,
  Timestamp,
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
// 📌 工具函式 (放在元件外避免重複定義)
// ================================
const formatKey = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getLast7Keys = () => {
  const keys = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(formatKey(d));
  }
  return keys;
};

const getMonthKeys = () => {
  const keys = [];
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    keys.push(formatKey(d));
  }
  return keys;
};

// ================================
// 📌 Minimal Line Chart (圖表組件)
// ================================
function MinimalLineChart({ data = [], labels = [], height = 260 }) {
  if (!Array.isArray(data) || !Array.isArray(labels) || labels.length === 0) {
    return <div style={{ height }} className="flex items-center justify-center text-gray-400 text-sm">尚無資料</div>;
  }
  const chartData = {
    labels,
    datasets: [{ label: "", data, borderColor: "#0F172A", borderWidth: 3, pointRadius: 0, tension: 0.25 }],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { ticks: { display: false }, grid: { drawBorder: false } } },
  };
  return <div style={{ height }}><Line data={chartData} options={chartOptions} /></div>;
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
  const [todayVisitors, setTodayVisitors] = useState(0);
  const [weekVisitors, setWeekVisitors] = useState(0);
  const [monthVisitors, setMonthVisitors] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const now = new Date();

        // 1. 今日訪客
        const today = formatKey(now);
        const vRef = doc(db, "analytics_daily", today);
        const vSnap = await getDoc(vRef);
        if (mounted) setTodayVisitors(vSnap.exists() ? (vSnap.data().visitors ?? 0) : 0);

        // 2. 訂單 + 總營收
        const orderSnap = await getDocs(
          query(collection(db, "orders"), orderBy("createdAt", "desc"))
        );
        const orders = orderSnap.docs.map((d) => d.data());
        if (mounted) {
          setOrdersCount(orders.length);
          setTotalRevenue(orders.reduce((acc, o) => acc + (o.total ?? 0), 0));
        }

        // 3. 商品數
        const productsSnap = await getDocs(collection(db, "products"));
        if (mounted) setProductsCount(productsSnap.size);

        // 4. 最近 7 天營收（圖表）
        const labels = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
        }
        const dailyRev = Array(7).fill(0);
        orders.forEach((o) => {
          if (o.createdAt?.toDate) {
            const diff = Math.floor((now - o.createdAt.toDate()) / 86400000);
            if (diff >= 0 && diff < 7) dailyRev[6 - diff] += (o.total || 0);
          }
        });
        if (mounted) {
          setWeeklyLabels(labels);
          setWeeklyRevenue(dailyRev);
        }

        // 5. 本週訪客（近 7 天）
        const weekKeys = getLast7Keys();
        const weekSnap = await getDocs(
          query(collection(db, "analytics_daily"), where(documentId(), "in", weekKeys))
        );
        if (mounted) {
          setWeekVisitors(weekSnap.docs.reduce((acc, d) => acc + (d.data().visitors ?? 0), 0));
        }

        // 6. 本月訪客（分批）
        const monthKeys = getMonthKeys();
        let monthSum = 0;
        for (let i = 0; i < monthKeys.length; i += 30) {
          const chunk = monthKeys.slice(i, i + 30);
          const snap = await getDocs(
            query(collection(db, "analytics_daily"), where(documentId(), "in", chunk))
          );
          monthSum += snap.docs.reduce((acc, d) => acc + (d.data().visitors ?? 0), 0);
        }
        if (mounted) setMonthVisitors(monthSum);

        // 7. 目前在線（60 秒內）
        const cutoff = Timestamp.fromMillis(Date.now() - 60000);
        const onlineSnap = await getDocs(
          query(collection(db, "online_users"), where("lastActive", ">=", cutoff))
        );
        if (mounted) setOnlineUsers(onlineSnap.size);
      } catch (e) {
        console.error("Dashboard error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // ✅ 先跑一次，頁面立刻有資料
    loadData();

    // ✅ 每 15 秒更新一次
    const timer = setInterval(loadData, 15000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  if (loading) return <div className="w-full flex justify-center py-20 text-gray-500">讀取中…</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 px-6 pb-20">
      <h1 className="text-3xl font-semibold tracking-wide text-gray-800 pt-2">數據概覽</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500 text-xs">總營收</p>
          <p className="text-2xl font-bold mt-2">NT$ {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500 text-xs">目前在線</p>
          <p className="text-2xl font-bold mt-2 text-green-600">{onlineUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500 text-xs text-blue-500">今日訪客</p>
          <p className="text-2xl font-bold mt-2 text-blue-600">{todayVisitors}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500 text-xs">本週訪客加總</p>
          <p className="text-2xl font-bold mt-2 text-purple-600">{weekVisitors}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500 text-xs mb-4">最近 7 天營收趨勢</p>
          <MinimalLineChart data={weeklyRevenue} labels={weeklyLabels} height={200} />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow flex flex-col justify-center">
            <div className="flex justify-between border-b pb-2 mb-2">
                <span className="text-gray-500">商品總數</span>
                <span className="font-bold">{productsCount}</span>
            </div>
            <div className="flex justify-between border-b pb-2 mb-2">
                <span className="text-gray-500">訂單總數</span>
                <span className="font-bold">{ordersCount}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-500">本月累計訪客</span>
                <span className="font-bold text-green-600">{monthVisitors}</span>
            </div>
        </div>
      </div>
    </div>
  );
}