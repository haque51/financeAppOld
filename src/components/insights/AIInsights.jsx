import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, Zap, Loader2 } from "lucide-react";
import { InvokeLLM } from "@/api/integrations";
import ReactMarkdown from 'react-markdown';

export default function AIInsights({ transactions, categories, accounts, isLoading: isDataLoading }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  const generateInsights = async (prompt) => {
    setIsGenerating(true);
    setInsights("");

    const transactionsSummary = transactions.slice(0, 50).map(t => {
      const category = categories.find(c => c.id === t.category_id);
      return `${t.date}: ${t.payee} - €${t.amount_eur.toFixed(2)} [${t.type}] (${category?.name || 'N/A'})`;
    }).join('\n');

    const finalPrompt = `
      As a financial analyst, review the following recent transactions and provide actionable insights.
      Focus on spending habits, potential savings, and any unusual activity. Keep the analysis concise and easy to understand.
      
      Recent Transactions:
      ${transactionsSummary}

      User Query: "${prompt}"
    `;

    try {
      const result = await InvokeLLM({ prompt: finalPrompt });
      setInsights(result);
    } catch (error) {
      console.error("Error generating AI insights:", error);
      setInsights("Sorry, I was unable to generate insights at this time. Please try again later.");
    }
    setIsGenerating(false);
  };
  
  const defaultPrompts = [
    "Analyze my spending habits.",
    "Where can I save more money?",
    "Are there any unusual transactions?",
  ];

  return (
    <Card className="shadow-sm border-slate-200 glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          AI-Powered Financial Advisor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-slate-600">
          Ask our AI assistant for personalized insights based on your recent financial activity.
        </p>
        
        <div className="flex flex-wrap gap-2">
            {defaultPrompts.map(prompt => (
                <Button 
                    key={prompt}
                    variant="outline" 
                    size="sm"
                    onClick={() => generateInsights(prompt)}
                    disabled={isGenerating || isDataLoading}
                >
                    {prompt}
                </Button>
            ))}
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Or ask your own question..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />
          <Button
            onClick={() => generateInsights(customPrompt)}
            disabled={!customPrompt || isGenerating || isDataLoading}
          >
            {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Generate Insights
          </Button>
        </div>

        {isGenerating && (
          <div className="flex items-center justify-center p-8 text-slate-600">
            <Loader2 className="w-8 h-8 mr-3 animate-spin" />
            <p className="font-medium">Analyzing your data...</p>
          </div>
        )}

        {insights && (
          <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-200 prose prose-sm max-w-none">
             <ReactMarkdown>{insights}</ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
