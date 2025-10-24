import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BrainCircuit } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-sm">
        <p className="font-medium">Year {label}</p>
        <p className="text-sm text-blue-600">
          Net Worth:{" "}
          <span className="font-bold">
            €{payload[0].value.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default function ForecastChart({ data, isLoading }) {
  return (
    <Card className="shadow-sm border-slate-200 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-slate-600" />
          Net Worth Projection
        </CardTitle>
        <CardDescription>
          This chart projects the growth of your net worth over time based on
          your assumptions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px] text-slate-500">
            <div className="text-center">
              <BrainCircuit className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>Calculating your financial future...</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="year"
                label={{
                  value: "Years from Now",
                  position: "insideBottom",
                  offset: -5,
                }}
                fontSize={12}
              />
              <YAxis
                tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Projected Net Worth"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
