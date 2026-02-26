import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { apiCall } from "../lib/apiCall";
import { useNavigate } from "react-router";

const HealthTrendChart = ({ patientId }: { patientId: number }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentSelectedTrend, setCurrentSelectedTrend] = useState<
    string | null
  >(null);

  const [test_names, set_test_names] = useState<string[]>([]);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const response = await apiCall(
          `/trends?patient_id=${patientId}&test_name=Morphine`,
        );

        const formattedData = response.trends.map((item: any) => ({
          ...item,
          formattedDate: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        }));

        setData(formattedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (patientId && currentSelectedTrend) fetchTrends();
  }, [patientId, currentSelectedTrend]);

  const fetchTestNames = async () => {
    try {
      if (!patientId) return;
      setLoading(true);
      const response = await apiCall(
        `/trends/get-test-names?patient_id=${patientId}`,
      );
      set_test_names(response.tests);
      setCurrentSelectedTrend(response.tests[0]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!patientId) {
      navigate("/");
    }
    fetchTestNames();
  }, [patientId]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-500">
        Loading trend data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center text-red-400">
        Error: {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-500">
        No data available for {currentSelectedTrend}.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#374151"
          vertical={false}
        />

        <XAxis
          dataKey="formattedDate"
          stroke="#9ca3af"
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#9ca3af"
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            borderColor: "#374151",
            borderRadius: "0.5rem",
            color: "#f3f4f6",
          }}
          itemStyle={{ color: "#4ade80" }}
          labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
          formatter={(value, _, props) => [
            `${value} ${props.payload.unit || ""}`,
            currentSelectedTrend,
          ]}
        />

        <Line
          type="monotone"
          dataKey="value"
          stroke="#4ade80"
          strokeWidth={3}
          dot={{ fill: "#1f2937", stroke: "#4ade80", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: "#4ade80", stroke: "#1f2937" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HealthTrendChart;
