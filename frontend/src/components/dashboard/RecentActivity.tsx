"use client";

import React from "react";
import {
  CheckCircle,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeDate } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "created" | "completed" | "updated" | "deleted" | "ai_enhanced";
  taskTitle: string;
  timestamp: string;
  details?: string;
}

interface RecentActivityProps {
  activities?: ActivityItem[];
  className?: string;
}

const activityIcons = {
  created: Plus,
  completed: CheckCircle,
  updated: Edit3,
  deleted: Trash2,
  ai_enhanced: Sparkles,
};

const activityColors = {
  created: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
  completed: "text-green-600 bg-green-100 dark:bg-green-900/20",
  updated: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20",
  deleted: "text-red-600 bg-red-100 dark:bg-red-900/20",
  ai_enhanced: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
};

const activityLabels = {
  created: "Created",
  completed: "Completed",
  updated: "Updated",
  deleted: "Deleted",
  ai_enhanced: "AI Enhanced",
};

// Mock data with very old fixed timestamps to avoid hydration issues
const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "completed",
    taskTitle: "Review project proposal",
    timestamp: "2023-01-15T10:30:00Z", // Very old timestamp
    details: "Task completed successfully",
  },
  {
    id: "2",
    type: "ai_enhanced",
    taskTitle: "Plan team meeting",
    timestamp: "2023-01-14T14:30:00Z", // Very old timestamp
    details: "Description enhanced with AI suggestions",
  },
  {
    id: "3",
    type: "created",
    taskTitle: "Update documentation",
    timestamp: "2023-01-13T13:30:00Z", // Very old timestamp
    details: "New task created with high priority",
  },
  {
    id: "4",
    type: "updated",
    taskTitle: "Design system components",
    timestamp: "2023-01-12T11:30:00Z", // Very old timestamp
    details: "Priority changed to urgent",
  },
  {
    id: "5",
    type: "completed",
    taskTitle: "Code review for authentication",
    timestamp: "2023-01-11T09:30:00Z", // Very old timestamp
    details: "Task completed on time",
  },
];

export function RecentActivity({
  activities = mockActivities,
  className,
}: RecentActivityProps) {

  return (
    <div>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];
              const label = activityLabels[activity.type];

                             return (
                 <div
                   key={activity.id}
                   className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                 >
                  <div className={`p-2 rounded-full ${colorClass} shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeDate(activity.timestamp)}
                      </span>
                    </div>

                    <p className="font-medium text-sm truncate mb-1">
                      {activity.taskTitle}
                    </p>

                    {activity.details && (
                      <p className="text-xs text-muted-foreground">
                        {activity.details}
                      </p>
                                         )}
                   </div>
                 </div>
               );
            })}
          </div>

          {activities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
                 </CardContent>
       </Card>
     </div>
   );
}
