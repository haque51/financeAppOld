import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export default function ForecastSummary({ projectionData, forecastYears }) {
  if (!projectionData || projectionData.length === 0) {
    return null;
  }

  const finalProjection = projectionData[projectionData.length - 1];

  return (
    <Card className="bg-blue-600 text-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Target className="w-6 h-6" />
          <span>Your Financial Future</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-lg text-blue-200">
          In {forecastYears} {forecastYears > 1 ? "years" : "year"}, your projected net worth is
        </p>
        <p className="text-5xl font-extrabold mt-2 tracking-tight">
          €{finalProjection.netWorth.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </p>
      </CardContent>
    </Card>
  );
}