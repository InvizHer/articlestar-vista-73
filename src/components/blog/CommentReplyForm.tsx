
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const replySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal('')),
  content: z.string().min(3, "Reply must be at least 3 characters")
});

type ReplyFormValues = z.infer<typeof replySchema>;

interface CommentReplyFormProps {
  articleId: string;
  parentId: string;
  onReplyAdded: () => void;
}

const CommentReplyForm: React.FC<CommentReplyFormProps> = ({ articleId, parentId, onReplyAdded }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReplyFormValues>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      name: "",
      email: "",
      content: ""
    }
  });

  const onSubmit = async (values: ReplyFormValues) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("unified_comments")
        .insert({
          article_id: articleId,
          parent_id: parentId,
          name: values.name,
          email: values.email || null,
          content: values.content,
          is_admin: false
        });

      if (error) {
        throw error;
      }

      toast.success("Reply posted successfully!");
      form.reset();
      onReplyAdded();
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Your email (optional)" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea 
                  placeholder="Write a reply..." 
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          size="sm"
          className="w-full md:w-auto" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Posting..." : "Post Reply"}
        </Button>
      </form>
    </Form>
  );
};

export default CommentReplyForm;
