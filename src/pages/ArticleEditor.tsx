
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DbArticle } from "@/types/database";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ArrowLeft, Save, EyeIcon, ListChecks, FileDown, Loader2, User, Clock, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { slugify } from "@/lib/utils";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMobile } from "@/hooks/use-mobile";
import Layout from "@/components/layout/Layout";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
    ["blockquote", "code-block"],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ script: "sub" }, { script: "super" }],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "indent",
  "align",
  "link",
  "image",
  "blockquote",
  "code-block",
  "color",
  "background",
  "font",
  "script",
];

const articleSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().min(5, "Slug must be at least 5 characters"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.string().min(2, "Category is required"),
  tags: z.string().min(2, "At least one tag is required"),
  read_time: z.string().min(1, "Read time is required"),
  cover_image: z.string().optional(),
  author_name: z.string().min(2, "Author name is required"),
  author_avatar: z.string().optional(),
  published: z.boolean().default(false),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

const ArticleEditor = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const isEditMode = articleId !== "new";
  const navigate = useNavigate();
  const { isAuthenticated } = useAdmin();
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [editorValue, setEditorValue] = useState("");
  const [activeTab, setActiveTab] = useState("editor");
  const isMobile = useIsMobile();

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "",
      tags: "",
      read_time: "5 min read",
      cover_image: "/placeholder.svg",
      author_name: "Admin",
      author_avatar: "/placeholder.svg",
      published: false,
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin");
      return;
    }

    if (isEditMode && articleId) {
      fetchArticle(articleId);
    } else {
      setInitialLoading(false);
    }
  }, [isEditMode, articleId, isAuthenticated, navigate]);

  useEffect(() => {
    form.setValue("content", editorValue, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }, [editorValue, form]);

  const fetchArticle = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        form.reset({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          category: data.category,
          tags: data.tags.join(", "),
          read_time: data.read_time,
          cover_image: data.cover_image || "/placeholder.svg",
          author_name: data.author_name,
          author_avatar: data.author_avatar || "/placeholder.svg",
          published: data.published,
        });

        setEditorValue(data.content);
      }
    } catch (error) {
      console.error("Error fetching article:", error);
      toast.error("Failed to load article");
      navigate("/admin/dashboard");
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (values: ArticleFormValues) => {
    setSaving(true);
    try {
      const tagsArray = values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      
      const articleData = {
        title: values.title,
        slug: values.slug,
        excerpt: values.excerpt,
        content: values.content,
        category: values.category,
        tags: tagsArray,
        read_time: values.read_time,
        cover_image: values.cover_image || "/placeholder.svg",
        author_name: values.author_name,
        author_avatar: values.author_avatar || "/placeholder.svg",
        published: values.published,
        updated_at: new Date().toISOString(),
      };

      if (isEditMode && articleId) {
        const { error } = await supabase
          .from("articles")
          .update(articleData)
          .eq("id", articleId);

        if (error) throw error;
        toast.success("Article updated successfully");
      } else {
        const { error } = await supabase.from("articles").insert([
          {
            ...articleData,
            date: new Date().toISOString(),
          }
        ]);
        if (error) throw error;
        toast.success("Article created successfully");
      }

      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Failed to save article");
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (title: string) => {
    form.setValue("title", title);
    if (!isEditMode || !form.getValues("slug")) {
      form.setValue("slug", slugify(title));
    }
  };

  const handlePreview = () => {
    setActiveTab("preview");
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-lg">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout fullWidth>
      <div className="min-h-screen bg-muted/30">
        <div className="bg-background border-b sticky top-0 z-30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <h1 className="text-xl font-bold">
                  {isEditMode ? "Edit Article" : "Create New Article"}
                </h1>
              </div>
              
              <div className="flex gap-2">
                {form.formState.isDirty && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-muted-foreground flex items-center mr-2"
                  >
                    <span className="hidden sm:inline">Unsaved changes</span>
                  </motion.div>
                )}
                <Button 
                  variant="outline"
                  disabled={saving}
                  onClick={handlePreview}
                >
                  <EyeIcon className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Preview</span>
                </Button>
                <Button 
                  disabled={saving}
                  onClick={form.handleSubmit(onSubmit)}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="editor" className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4" />
                    Editor
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <EyeIcon className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>

                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                        id="published"
                      />
                      <label 
                        htmlFor="published" 
                        className="text-sm font-medium cursor-pointer"
                      >
                        {field.value ? "Published" : "Draft"}
                      </label>
                    </div>
                  )}
                />
              </div>
              
              <TabsContent value="editor" className="mt-0">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <Card className="shadow-md lg:col-span-2">
                        <CardContent className="pt-6">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem className="mb-4">
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Article title" 
                                    {...field} 
                                    onChange={(e) => handleTitleChange(e.target.value)} 
                                    className="text-lg"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                              <FormItem className="mb-4">
                                <FormLabel>Slug</FormLabel>
                                <FormControl>
                                  <Input placeholder="article-slug" {...field} />
                                </FormControl>
                                <FormDescription>
                                  URL-friendly version of the title
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="excerpt"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Excerpt</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Brief summary of the article"
                                    {...field}
                                    rows={3}
                                  />
                                </FormControl>
                                <FormDescription>
                                  A short description displayed on article cards
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>

                      <Card className="shadow-md">
                        <CardContent className="pt-6">
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem className="mb-4">
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                  <Input placeholder="Development, Design, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                              <FormItem className="mb-4">
                                <FormLabel>Tags</FormLabel>
                                <FormControl>
                                  <Input placeholder="React, TypeScript, etc. (comma-separated)" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="author_name"
                              render={({ field }) => (
                                <FormItem className="mb-4">
                                  <FormLabel>Author Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Author name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="read_time"
                              render={({ field }) => (
                                <FormItem className="mb-4">
                                  <FormLabel>Read Time</FormLabel>
                                  <FormControl>
                                    <Input placeholder="5 min read" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <FormField
                              control={form.control}
                              name="cover_image"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cover Image URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="URL to cover image" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="shadow-md">
                      <CardContent className="pt-6">
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content</FormLabel>
                              <Card className="border-0 shadow-none">
                                <CardContent className="p-0">
                                  <div className="min-h-[600px]"> {/* Increased height here */}
                                    <ReactQuill
                                      theme="snow"
                                      modules={modules}
                                      formats={formats}
                                      value={editorValue}
                                      onChange={setEditorValue}
                                      className="h-[550px]" /* Increased height here */
                                      style={{ height: "550px" }} /* Ensuring height is applied */
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <input type="hidden" {...form.register("content")} />
                      </CardContent>
                    </Card>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="preview" className="mt-0">
                <Card className="shadow-md overflow-hidden">
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={form.getValues("cover_image") || "/placeholder.svg"}
                      alt={form.getValues("title")}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="pt-6">
                    <div className="prose max-w-none">
                      <h1>{form.getValues("title")}</h1>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground pb-6 mb-6 border-b">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>By {form.getValues("author_name")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{form.getValues("read_time")}</span>
                        </div>
                      </div>
                      <div
                        className="prose prose-slate max-w-none prose-img:rounded-xl prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80"
                        dangerouslySetInnerHTML={{ __html: form.getValues("content") || "<p>No content yet.</p>" }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default ArticleEditor;
