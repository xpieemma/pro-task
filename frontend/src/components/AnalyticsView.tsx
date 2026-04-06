import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../services/api";
import LoadingSpinner from "./LoadingSpinner";

const COLORS = ["#E5E7EB", "#BFDBFE", "#BBF7D0"]; // Colors for To Do, In Progress, Done

const AnalyticsView = ({ projectId }: { projectId: string }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`/projects/${projectId}/tasks/analytics`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [projectId]);

  if (loading) return <LoadingSpinner />;
  if (!data)
    return <p className="text-center text-gray-500">Failed to load data.</p>;

  const pieData = data.statusData.map((entry: any, index: number) => ({
    ...entry,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 text-center">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">
            Total Tasks
          </p>
          <p className="text-3xl font-bold text-gray-800">{data.totalTasks}</p>
        </div>
        <div className="border border-gray-100 rounded-lg p-4 bg-green-50 text-center">
          <p className="text-green-600 text-sm font-semibold uppercase tracking-wider mb-1">
            Completion Rate
          </p>
          <p className="text-3xl font-bold text-green-700">
            {data.totalTasks
              ? Math.round((data.statusData[2].value / data.totalTasks) * 100)
              : 0}
            %
          </p>
        </div>
        <div className="border border-gray-100 rounded-lg p-4 bg-red-50 text-center">
          <p className="text-red-500 text-sm font-semibold uppercase tracking-wider mb-1">
            Overdue Tasks
          </p>
          <p className="text-3xl font-bold text-red-600">{data.overdueCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart: Status Distribution */}
        <div className="border border-gray-100 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-4 text-center">
            Task Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-gray-200"></span> To Do
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-200"></span> In
              Progress
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-200"></span> Done
            </span>
          </div>
        </div>

        {/* Bar Chart: 7-Day Velocity */}
        <div className="border border-gray-100 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-4 text-center">
            Completion Velocity (Last 7 Days)
          </h3>
          <div className="h-64">
            {data.velocityData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No tasks completed recently.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.velocityData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                  />
                  <Tooltip cursor={{ fill: "#f9fafb" }} />
                  <Bar
                    dataKey="completed"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
