"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Brain, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ContextForm } from "@/components/context/ContextForm";
import { ContextList } from "@/components/context/ContextList";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { useContextData } from "@/hooks/useContext";
import { useAsync } from "@/hooks/useAsync";
import { contextAPI } from "@/lib/api";

export default function ContextPage() {
  const [showForm, setShowForm] = useState(false);
  const { dailySummary } = useContextData();
  const { data: analytics } = useAsync(() => contextAPI.getAnalytics(30), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Context Intelligence</h1>
          <p className="text-muted-foreground mt-2">
            Transform your daily communications into actionable insights
          </p>
        </div>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Context
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogTitle className="sr-only">Add Context Entry</DialogTitle>
            <DialogDescription className="sr-only">
              Add a new context entry from various sources like WhatsApp, email, notes, or calendar
            </DialogDescription>
            <ContextForm onSuccess={() => setShowForm(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Daily Summary */}
      {dailySummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                Today&apos;s AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {dailySummary.entry_count}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Entries Processed
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {dailySummary.insights?.task_suggestions?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Task Suggestions
                  </div>
                </div>

                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${
                      dailySummary.sentiment_score > 0
                        ? "text-green-600"
                        : dailySummary.sentiment_score < 0
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {dailySummary.sentiment_score > 0
                      ? "Positive"
                      : dailySummary.sentiment_score < 0
                      ? "Negative"
                      : "Neutral"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Overall Sentiment
                  </div>
                </div>
              </div>

              {dailySummary.top_keywords?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Key Topics Today:</h4>
                  <div className="flex flex-wrap gap-2">
                                         {dailySummary.top_keywords
                       .slice(0, 8)
                       .map((keyword: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Analytics Overview */}
      {analytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {analytics.total_entries}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Entries (30d)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Math.round(analytics.average_sentiment * 100) / 100}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Sentiment
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                                         {(Object.values(analytics.source_distribution) as number[]).reduce(
                       (a, b) => a + b,
                       0
                     )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Sources Active
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Context List */}
      <ContextList />
    </motion.div>
  );
}
