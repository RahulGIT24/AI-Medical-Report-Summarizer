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
import { Activity, Loader2Icon } from "lucide-react";

const HealthTrendChart = ({
  patientId,
  currentSelectedTrend,
  setCurrentSelectedTrend,
  test_names,
  set_test_names,
}: {
  patientId: number;
  currentSelectedTrend: string | null;
  setCurrentSelectedTrend: (args: string | null) => void;
  test_names:string[];
  set_test_names:(args:string[])=>void;
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dropdown, setDropDown] = useState(false);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);

        const response = await apiCall(
          `/trends?patient_id=${patientId}&test_name=${currentSelectedTrend ?? test_names[0]}`,
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

    if (patientId && currentSelectedTrend) {
      fetchTrends();
    }
  }, [patientId, currentSelectedTrend]);

  useEffect(() => {
    setData([])
    setCurrentSelectedTrend(null);
    const fetchTestNames = async () => {
      try {
        setLoading(true);

        const response = await apiCall(
          `/trends/get-test-names?patient_id=${patientId}`,
        );

        set_test_names(response.tests);

        if (response.tests.length > 0) {
          setCurrentSelectedTrend(response.tests[0]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchTestNames();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="h-[40vh] w-full flex items-center justify-center text-gray-500">
        <Loader2Icon size={44} className="animate-spin" />
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
    <div
      className="animate-fade-in"
      onClick={() => {
        setDropDown(false);
      }}
    >
      <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-lg">
        <div className="flex items-center gap-3 mb-6 justify-between">
          {/* Left side: Icon and Title */}
          <div className="flex items-center gap-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Activity className="text-green-400" size={18} />
            </div>
            <h3 className="text-xl font-bold text-white">
              Health Biomarkers over Time
            </h3>
          </div>

          <div className="relative">
            {" "}
            <button
              id="dropdownDefaultButton"
              className="inline-flex items-center justify-between min-w-[180px] text-white bg-zinc-900 border border-gray-700 hover:bg-zinc-800 shadow-sm font-medium rounded-md text-sm px-4 py-2.5 focus:outline-none transition-colors"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDropDown(!dropdown);
              }}
            >
              <span className="truncate pr-2">
                {currentSelectedTrend || "Select Test Name"}
              </span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${dropdown ? "rotate-180" : ""}`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 9-7 7-7-7"
                />
              </svg>
            </button>
            <div
              id="dropdown"
              className={`absolute right-0 mt-2 z-50 ${
                dropdown ? "block" : "hidden"
              } bg-zinc-900 border border-gray-700 rounded-md shadow-xl w-48 max-h-60 overflow-y-auto`}
            >
              <ul
                className="p-1 text-sm text-gray-300"
                aria-labelledby="dropdownDefaultButton"
              >
                {test_names && test_names.length > 0 ? (
                  test_names.map((t, index) => (
                    <li key={index}>
                      <button
                        onClick={() => {
                          setCurrentSelectedTrend(t);
                          setDropDown(false);
                        }}
                        className={`cursor-pointer w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          currentSelectedTrend === t
                            ? "bg-gray-800 text-green-400 font-semibold"
                            : "hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        {t}
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-gray-500 text-center">
                    No tests found
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="h-80 w-full border border-gray-800 rounded-xl bg-gray-950 p-4">
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
                  currentSelectedTrend || "Test Result",
                ]}
              />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#4ade80"
                strokeWidth={3}
                dot={{
                  fill: "#1f2937",
                  stroke: "#4ade80",
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{ r: 6, fill: "#4ade80", stroke: "#1f2937" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HealthTrendChart;
