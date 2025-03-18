
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { 
  ArrowLeft, 
  Save, 
  EyeIcon, 
  User, 
  Clock, 
  Calendar as CalendarIcon, 
  Loader2,
  FileText,
  Tag,
  Image,
  ChevronDown,
  Plus,
  Check,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { slugify } from "@/lib/utils";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [categories, setCategories] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newAuthor, setNewAuthor] = useState("");

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
    
    fetchMetadata();
  }, [isEditMode, articleId, isAuthenticated, navigate]);

  useEffect(() => {
    form.setValue("content", editorValue, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }, [editorValue, form]);

  const fetchMetadata = async () => {
    try {
      // Fetch unique categories
      const { data: categoryData } = await supabase
        .from("articles")
        .select("category")
        .not("category", "is", null);
      
      if (categoryData) {
        const uniqueCategories = [...new Set(categoryData.map(item => item.category))];
        setCategories(uniqueCategories);
      }
      
      // Fetch unique authors
      const { data: authorData } = await supabase
        .from("articles")
        .select("author_name")
        .not("author_name", "is", null);
      
      if (authorData) {
        const uniqueAuthors = [...new Set(authorData.map(item => item.author_name))];
        setAuthors(uniqueAuthors);
      }
      
      // Fetch unique tags
      const { data: tagsData } = await supabase
        .from("articles")
        .select("tags");
      
      if (tagsData) {
        const allTags = tagsData.flatMap(item => item.tags || []);
        const uniqueTags = [...new Set(allTags)];
        setTagsList(uniqueTags);
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

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

      navigate("/admin/articles");
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

  const calculateReadTime = (content: string) => {
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
    form.setValue("read_time", `${readingTime} min read`);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      form.setValue("category", newCategory.trim());
      setNewCategory("");
    }
  };

  const handleAddNewTag = () => {
    if (newTag.trim() && !tagsList.includes(newTag.trim())) {
      setTagsList([...tagsList, newTag.trim()]);
      const currentTags = form.getValues("tags");
      const updatedTags = currentTags ? `${currentTags}, ${newTag.trim()}` : newTag.trim();
      form.setValue("tags", updatedTags);
      setNewTag("");
    }
  };

  const handleAddNewAuthor = () => {
    if (newAuthor.trim() && !authors.includes(newAuthor.trim())) {
      setAuthors([...authors, newAuthor.trim()]);
      form.setValue("author_name", newAuthor.trim());
      setNewAuthor("");
    }
  };

  const handleSelectTag = (tag: string) => {
    const currentTags = form.getValues("tags");
    const tagsArray = currentTags.split(",").map(t => t.trim()).filter(t => t);
    
    if (!tagsArray.includes(tag)) {
      const updatedTags = [...tagsArray, tag].join(", ");
      form.setValue("tags", updatedTags);
    }
  };

  if (initialLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="text-lg">Loading article...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-2 sm:px-4 py-4">
        {/* Header Section */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => navigate("/admin/articles")}
                    className="h-9 w-9 rounded-full"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <h1 className="text-xl font-bold">
                    {isEditMode ? "Edit Article" : "Create New Article"}
                  </h1>
                </div>
                
                <div className="flex items-center gap-3">
                  {form.formState.isDirty && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm text-muted-foreground hidden sm:flex items-center"
                    >
                      <span>Unsaved changes</span>
                    </motion.div>
                  )}
                  
                  <div className="flex items-center">
                    <FormField
                      control={form.control}
                      name="published"
                      render={({ field }) => (
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={field.value ? "default" : "outline"}
                            className="cursor-pointer"
                          >
                            {field.value ? "Published" : "Draft"}
                          </Badge>
                          <Switch 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            id="published"
                          />
                        </div>
                      )}
                    />
                  </div>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handlePreview}
                    className="hidden sm:flex"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  
                  <Button 
                    variant="default"
                    disabled={saving}
                    onClick={form.handleSubmit(onSubmit)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full space-y-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
              <div className="p-2 sm:p-2">
                <TabsList className="w-full justify-start grid grid-cols-2 sm:w-auto">
                  <TabsTrigger value="editor" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Editor
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <EyeIcon className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            
            <TabsContent value="editor" className="mt-0 space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Main Content Section */}
                    <div className="lg:col-span-8 space-y-4">
                      <Card className="overflow-hidden border-gray-100 dark:border-gray-700">
                        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-6">
                          <CardTitle className="text-lg">Article Content</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-6">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter a compelling title" 
                                    {...field} 
                                    onChange={(e) => handleTitleChange(e.target.value)} 
                                    className="text-lg font-medium"
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
                              <FormItem>
                                <FormLabel>URL Slug</FormLabel>
                                <FormControl>
                                  <div className="flex rounded-md overflow-hidden">
                                    <div className="bg-gray-100 dark:bg-gray-800 flex items-center px-3 py-2 text-sm border border-r-0 border-input rounded-l-md">
                                      <span>/article/</span>
                                    </div>
                                    <Input 
                                      placeholder="your-article-slug" 
                                      {...field} 
                                      className="rounded-l-none flex-1" 
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  This will be the URL path of your article
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
                                    placeholder="Brief summary to display on article cards"
                                    {...field}
                                    rows={3}
                                    className="resize-none"
                                  />
                                </FormControl>
                                <FormDescription>
                                  A short description shown in article listings
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>

                      <Card className="overflow-hidden border-gray-100 dark:border-gray-700">
                        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-6 flex flex-row justify-between items-center">
                          <CardTitle className="text-lg">Content Editor</CardTitle>
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => calculateReadTime(editorValue)}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Calculate Read Time
                          </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                          <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem className="m-0">
                                <div className="min-h-[300px] md:min-h-[450px] overflow-hidden">
                                  <ReactQuill
                                    theme="snow"
                                    modules={modules}
                                    formats={formats}
                                    value={editorValue}
                                    onChange={(value) => {
                                      setEditorValue(value);
                                    }}
                                    className="h-[300px] md:h-[450px] w-full"
                                    // Important mobile fixes
                                    style={{ 
                                      height: "300px", 
                                      maxWidth: "100%"
                                    }}
                                  />
                                </div>
                                <FormMessage className="m-4" />
                              </FormItem>
                            )}
                          />
                          <input type="hidden" {...form.register("content")} />
                        </CardContent>
                      </Card>
                    </div>

                    {/* Sidebar Settings */}
                    <div className="lg:col-span-4 space-y-4">
                      <Card className="border-gray-100 dark:border-gray-700">
                        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-6">
                          <CardTitle className="text-lg">Article Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-6">
                          <FormField
                            control={form.control}
                            name="cover_image"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Image className="h-4 w-4" /> Cover Image
                                </FormLabel>
                                <FormControl>
                                  <div className="space-y-3">
                                    <Input placeholder="URL to image" {...field} />
                                    
                                    {field.value && (
                                      <div className="aspect-video w-full overflow-hidden rounded-md border bg-muted">
                                        <img
                                          src={field.value}
                                          alt="Cover preview"
                                          className="h-full w-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Tag className="h-4 w-4" /> Category
                                  </FormLabel>
                                  <div className="grid grid-cols-1 gap-2">
                                    <FormControl>
                                      <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <ScrollArea className="h-[200px]">
                                            {categories.map((category) => (
                                              <SelectItem key={category} value={category}>
                                                {category}
                                              </SelectItem>
                                            ))}
                                          </ScrollArea>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="Add new category"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        className="flex-1"
                                      />
                                      <Button 
                                        type="button" 
                                        variant="outline"
                                        size="icon"
                                        onClick={handleAddNewCategory}
                                        className="shrink-0 h-10 w-10"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="tags"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Tag className="h-4 w-4" /> Tags
                                  </FormLabel>
                                  <FormControl>
                                    <div className="space-y-3">
                                      <Textarea 
                                        placeholder="Comma-separated tags"
                                        {...field}
                                        className="resize-none"
                                        rows={2}
                                      />
                                      
                                      <div className="flex flex-wrap gap-1 mb-2">
                                        {field.value.split(',').map((tag, i) => (
                                          tag.trim() && (
                                            <Badge key={i} variant="secondary" className="font-normal">
                                              {tag.trim()}
                                            </Badge>
                                          )
                                        ))}
                                      </div>
                                      
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button variant="outline" size="sm" className="w-full text-left justify-start">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Select from existing tags
                                            <ChevronDown className="h-4 w-4 ml-auto" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="start" className="w-[250px] p-0">
                                          <Command>
                                            <CommandInput placeholder="Search tags..." />
                                            <CommandList className="max-h-[200px]">
                                              <CommandEmpty>No tags found.</CommandEmpty>
                                              <CommandGroup>
                                                {tagsList.map((tag) => (
                                                  <CommandItem
                                                    key={tag}
                                                    onSelect={() => handleSelectTag(tag)}
                                                    className="flex items-center gap-2"
                                                  >
                                                    {tag}
                                                  </CommandItem>
                                                ))}
                                              </CommandGroup>
                                            </CommandList>
                                            <div className="border-t p-2">
                                              <div className="flex gap-2">
                                                <Input
                                                  placeholder="New tag"
                                                  value={newTag}
                                                  onChange={(e) => setNewTag(e.target.value)}
                                                  className="flex-1 h-9"
                                                />
                                                <Button 
                                                  type="button" 
                                                  size="sm" 
                                                  onClick={handleAddNewTag}
                                                  className="shrink-0 h-9"
                                                >
                                                  Add
                                                </Button>
                                              </div>
                                            </div>
                                          </Command>
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="author_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <User className="h-4 w-4" /> Author
                                  </FormLabel>
                                  <div className="grid grid-cols-1 gap-2">
                                    <FormControl>
                                      <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select author" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <ScrollArea className="h-[200px]">
                                            {authors.map((author) => (
                                              <SelectItem key={author} value={author}>
                                                {author}
                                              </SelectItem>
                                            ))}
                                          </ScrollArea>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="Add new author"
                                        value={newAuthor}
                                        onChange={(e) => setNewAuthor(e.target.value)}
                                        className="flex-1"
                                      />
                                      <Button 
                                        type="button" 
                                        variant="outline"
                                        size="icon"
                                        onClick={handleAddNewAuthor}
                                        className="shrink-0 h-10 w-10"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="read_time"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Read Time
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="5 min read" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving Article
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Article
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0">
              <Card className="border overflow-hidden p-0 border-gray-100 dark:border-gray-700">
                <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={form.getValues("cover_image") || "/placeholder.svg"}
                    alt={form.getValues("title")}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
                <div className="p-6 sm:p-8">
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className="font-normal">
                          {form.getValues("category") || "Uncategorized"}
                        </Badge>
                        {form.getValues("published") ? (
                          <Badge variant="default" className="bg-green-500 font-normal">
                            <Check className="h-3 w-3 mr-1" /> Published
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="font-normal">
                            <X className="h-3 w-3 mr-1" /> Draft
                          </Badge>
                        )}
                      </div>
                      
                      <h1 className="text-3xl sm:text-4xl font-bold mb-3 mt-0 leading-tight">
                        {form.getValues("title") || "Untitled Article"}
                      </h1>
                      
                      <p className="text-muted-foreground text-lg mb-6">
                        {form.getValues("excerpt") || "No excerpt provided."}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b pb-6 mb-6">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>By {form.getValues("author_name") || "Anonymous"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{formatDate(new Date())}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{form.getValues("read_time") || "5 min read"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className="prose prose-lg dark:prose-invert max-w-none prose-img:rounded-xl prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80"
                      dangerouslySetInnerHTML={{ __html: form.getValues("content") || "<p>No content yet.</p>" }}
                    />
                    
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="text-lg font-semibold mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {form.getValues("tags").split(",").map((tag, index) => (
                          tag.trim() && (
                            <Badge key={index} variant="secondary">
                              {tag.trim()}
                            </Badge>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default ArticleEditor;
