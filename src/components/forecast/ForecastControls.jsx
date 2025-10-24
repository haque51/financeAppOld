import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal } from "lucide-react";

export default function ForecastControls({ params, setParams, initialMonthlySavings }) {
  return (
    <Card className="shadow-sm border-slate-200 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-slate-600" />
          Adjust Assumptions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-6 pt-2">
        <div className="space-y-3">
          <Label htmlFor="monthly-savings">Monthly Savings (€)</Label>
          <Input
            id="monthly-savings"
            type="number"
            value={params.monthlySavings}
            onChange={(e) =>
              setParams({ ...params, monthlySavings: Number(e.target.value) })
            }
            placeholder={`e.g. ${initialMonthlySavings}`}
          />
          <p className="text-xs text-slate-500">
            Average based on last 6 months: €{initialMonthlySavings.toFixed(2)}
          </p>
        </div>
        <div className="space-y-3">
          <Label htmlFor="annual-growth">Annual Investment Growth (%)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="annual-growth"
              min={0}
              max={15}
              step={0.5}
              value={[params.annualGrowthRate]}
              onValueChange={(value) =>
                setParams({ ...params, annualGrowthRate: value[0] })
              }
              className="flex-1"
            />
            <span className="font-bold text-slate-700 w-16 text-center">
              {params.annualGrowthRate.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Expected annual return on your investments.
          </p>
        </div>
        <div className="space-y-3">
          <Label htmlFor="forecast-years">Forecast Period (Years)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="forecast-years"
              min={1}
              max={40}
              step={1}
              value={[params.forecastYears]}
              onValueChange={(value) =>
                setParams({ ...params, forecastYears: value[0] })
              }
              className="flex-1"
            />
            <span className="font-bold text-slate-700 w-16 text-center">
              {params.forecastYears} yrs
            </span>
          </div>
          <p className="text-xs text-slate-500">
            How far into the future to project.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}