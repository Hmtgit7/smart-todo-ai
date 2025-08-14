"use client";

import React from "react";
import {
  Calendar,
  Clock,
  Tag,
  Sparkles,
  MoreVertical,
  Check,
  Edit3,
  Trash2,
} from "lucide-react";
import { Task } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  formatDate,
  formatRelativeDate,
  getPriorityColor,
  getStatusColor,
  truncateText,
} from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";


interface TaskCardProps {
  task: Task;
  onComplete?: (id: number) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
  onEnhance?: (id: number) => void;
  className?: string;
  showActions?: boolean;
}

export const TaskCard = React.memo(function TaskCard({
  task,
  onComplete,
  onEdit,
  onDelete,
  onEnhance,
  className,
  showActions = true,
}: TaskCardProps) {
  const priorityClass = `task-priority-${task.priority}`;

  return (
    <div className={className}>
      <Card
        className={`${priorityClass} hover:shadow-lg transition-all duration-200 group`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg truncate">{task.title}</h3>
                                 {task.ai_enhanced_description && (
                   <div className="shrink-0">
                     <Sparkles className="h-4 w-4 text-purple-500" />
                   </div>
                 )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={`priority.${task.priority}` as any}>
                  {task.priority}
                </Badge>
                <Badge variant={`status.${task.status}` as any}>
                  {task.status.replace("_", " ")}
                </Badge>
                {task.category_name && (
                  <Badge
                    variant="outline"
                    className="border-current"
                    style={{ color: task.category_color }}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {task.category_name}
                  </Badge>
                )}
              </div>
            </div>

            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {task.status !== "completed" && onComplete && (
                    <DropdownMenuItem onClick={() => onComplete(task.id)}>
                      <Check className="h-4 w-4 mr-2" />
                      Complete
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onEnhance && !task.ai_enhanced_description && (
                    <DropdownMenuItem onClick={() => onEnhance(task.id)}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Enhance with AI
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(task.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {task.description && (
            <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
              {truncateText(task.description, 150)}
            </p>
          )}

          {task.ai_enhanced_description && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 mb-3 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  AI Enhanced Description
                </span>
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                {truncateText(task.ai_enhanced_description, 200)}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {task.deadline && (
                <div
                  className={`flex items-center gap-1 ${
                    task.is_overdue ? "text-red-500" : ""
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  {formatDate(task.deadline)}
                </div>
              )}

              {task.estimated_duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {task.estimated_duration}m
                </div>
              )}
            </div>

            <div className="text-xs">
              Created {formatRelativeDate(task.created_at)}
            </div>
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-3 flex-wrap">
              {task.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{task.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

                     {task.priority_score > 0.7 && (
             <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-700">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  High AI Priority Score:{" "}
                  {Math.round(task.priority_score * 100)}%
                                 </span>
               </div>
             </div>
           )}
                 </CardContent>
       </Card>
     </div>
   );
});
