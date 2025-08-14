"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Mail,
  FileText,
  Calendar,
  User,
  Send,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { useContextData } from "@/hooks/useContext";
import { toast } from "sonner";

const sourceTypes = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "green" },
  { value: "email", label: "Email", icon: Mail, color: "blue" },
  { value: "notes", label: "Notes", icon: FileText, color: "purple" },
  { value: "calendar", label: "Calendar", icon: Calendar, color: "orange" },
  { value: "manual", label: "Manual Entry", icon: User, color: "gray" },
];

interface ContextFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function ContextForm({ onSuccess, className }: ContextFormProps) {
  const [content, setContent] = useState("");
  const [sourceType, setSourceType] = useState<string>("manual");
  const [processWithAI, setProcessWithAI] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createEntry } = useContextData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await createEntry(content.trim(), sourceType);

      if (result) {
        setContent("");
        setSourceType("manual");
        toast.success("Context entry added successfully");
        onSuccess?.();
      }
    } catch (error) {
      toast.error("Failed to add context entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSource = sourceTypes.find(
    (source) => source.value === sourceType
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              {selectedSource && (
                <selectedSource.icon className="h-5 w-5 text-blue-600" />
              )}
            </div>
            Add Context Entry
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Source Type Selection */}
            <div className="space-y-3">
              <Label>Source Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {sourceTypes.map((source) => (
                  <Button
                    key={source.value}
                    type="button"
                    variant={
                      sourceType === source.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSourceType(source.value)}
                    className="flex flex-col items-center gap-2 h-auto py-3"
                  >
                    <source.icon className="h-4 w-4" />
                    <span className="text-xs">{source.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Content Input */}
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={getPlaceholderText(sourceType)}
                rows={6}
                className="resize-none"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{content.length} characters</span>
                <span>
                  {content.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>

            {/* AI Processing Toggle */}
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <div>
                  <Label htmlFor="processWithAI" className="font-medium">
                    Process with AI
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Extract insights, keywords, and task suggestions
                    automatically
                  </p>
                </div>
              </div>
              <Switch
                id="processWithAI"
                checked={processWithAI}
                onCheckedChange={setProcessWithAI}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="w-full"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {processWithAI ? "Processing with AI..." : "Adding Entry..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Add Context Entry
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function getPlaceholderText(sourceType: string): string {
  const placeholders = {
    whatsapp:
      'Paste your WhatsApp messages here...\nExample: "Hey, can we move the meeting to 3 PM tomorrow? The client wants to discuss the new features."',
    email:
      'Paste your email content here...\nExample: "Subject: Project Update\nThe quarterly review is scheduled for next week. Please prepare your reports."',
    notes:
      'Enter your personal notes here...\nExample: "Remember to call the dentist, buy groceries, and finish the presentation for Monday\'s meeting."',
    calendar:
      'Paste calendar events or scheduling information...\nExample: "Team standup at 10 AM, Client call at 2 PM, Project deadline on Friday."',
    manual:
      'Enter any context information manually...\nExample: "Busy day ahead with back-to-back meetings. Need to prioritize the urgent tasks and delegate others."',
  };

  return (
    placeholders[sourceType as keyof typeof placeholders] || placeholders.manual
  );
}
