"use client";

import React, { useState } from "react";

import {
  MessageSquare,
  Mail,
  FileText,
  Calendar,
  User,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";
import { ContextEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useContextData } from "@/hooks/useContext";
import { formatDate, formatRelativeDate, truncateText } from "@/lib/utils";


const sourceIcons = {
  whatsapp: MessageSquare,
  email: Mail,
  notes: FileText,
  calendar: Calendar,
  manual: User,
};

const sourceColors = {
  whatsapp: "text-green-600 bg-green-100 dark:bg-green-900/20",
  email: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
  notes: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
  calendar: "text-orange-600 bg-orange-100 dark:bg-orange-900/20",
  manual: "text-gray-600 bg-gray-100 dark:bg-gray-900/20",
};

interface ContextListProps {
  className?: string;
  maxItems?: number;
  showFilters?: boolean;
}

export function ContextList({
  className,
  maxItems,
  showFilters = true,
}: ContextListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [processedFilter, setProcessedFilter] = useState<string>("all");

  const { entries, loading, fetchEntries, bulkProcess } = useContextData();

  // Filter entries
  const filteredEntries = React.useMemo(() => {
    let result = entries.filter((entry) => {
      const matchesSearch =
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.keywords.some((keyword) =>
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesSource =
        sourceFilter === "all" || entry.source_type === sourceFilter;
      const matchesProcessed =
        processedFilter === "all" ||
        (processedFilter === "processed" && entry.processed) ||
        (processedFilter === "unprocessed" && !entry.processed);

      return matchesSearch && matchesSource && matchesProcessed;
    });

    if (maxItems) {
      result = result.slice(0, maxItems);
    }

    return result;
  }, [entries, searchTerm, sourceFilter, processedFilter, maxItems]);

  const getSentimentIcon = (score?: number) => {
    if (!score) return Minus;
    if (score > 0.1) return TrendingUp;
    if (score < -0.1) return TrendingDown;
    return Minus;
  };

  const getSentimentColor = (score?: number) => {
    if (!score) return "text-gray-500";
    if (score > 0.1) return "text-green-500";
    if (score < -0.1) return "text-red-500";
    return "text-gray-500";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header & Filters */}
      {showFilters && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Context Entries</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={bulkProcess}
                className="flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                Process All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchEntries}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search context entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Source Filter */}
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="notes">Notes</SelectItem>
                <SelectItem value="calendar">Calendar</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>

            {/* Processed Filter */}
            <Select value={processedFilter} onValueChange={setProcessedFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="unprocessed">Unprocessed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

             {/* Entries List */}
       <div className="space-y-3">
         {filteredEntries.map((entry, index) => {
            const SourceIcon =
              sourceIcons[entry.source_type as keyof typeof sourceIcons] || sourceIcons.manual;
            const sourceColorClass =
              sourceColors[entry.source_type as keyof typeof sourceColors] || sourceColors.manual;
            const SentimentIcon = getSentimentIcon(entry.sentiment_score);
            const sentimentColor = getSentimentColor(entry.sentiment_score);

                         return (
               <div key={entry.id}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Source Icon */}
                      <div
                        className={`p-2 rounded-lg shrink-0 ${sourceColorClass}`}
                      >
                        <SourceIcon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {entry.source_type}
                            </Badge>
                            {entry.processed && (
                              <Badge
                                variant="outline"
                                className="text-xs text-purple-600"
                              >
                                <Brain className="h-3 w-3 mr-1" />
                                AI Processed
                              </Badge>
                            )}
                            {entry.sentiment_score !== undefined && (
                              <div
                                className={`flex items-center gap-1 ${sentimentColor}`}
                              >
                                <SentimentIcon className="h-3 w-3" />
                                <span className="text-xs">
                                  {entry.sentiment_score > 0
                                    ? "Positive"
                                    : entry.sentiment_score < 0
                                    ? "Negative"
                                    : "Neutral"}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeDate(entry.timestamp)}
                          </span>
                        </div>

                        {/* Content */}
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                          {truncateText(entry.content, 200)}
                        </p>

                        {/* Keywords */}
                        {entry.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {entry.keywords.slice(0, 6).map((keyword, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {keyword}
                              </Badge>
                            ))}
                            {entry.keywords.length > 6 && (
                              <Badge variant="outline" className="text-xs">
                                +{entry.keywords.length - 6} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Urgency Indicators */}
                        {entry.urgency_indicators.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="text-xs">
                              Urgent: {entry.urgency_indicators.join(", ")}
                            </Badge>
                          </div>
                        )}

                        {/* AI Insights */}
                        {entry.processed_insights?.task_suggestions?.length >
                          0 && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                AI Suggestions
                              </span>
                            </div>
                            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                              {entry.processed_insights.task_suggestions
                                .slice(0, 3)
                                .map((suggestion, idx) => (
                                  <li key={idx}>• {suggestion}</li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

      {/* Empty State */}
      {filteredEntries.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No context entries found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || sourceFilter !== "all" || processedFilter !== "all"
              ? "Try adjusting your filters to see more entries."
              : "Start by adding your first context entry to get AI-powered insights."}
          </p>
        </div>
      )}
    </div>
  );
}
