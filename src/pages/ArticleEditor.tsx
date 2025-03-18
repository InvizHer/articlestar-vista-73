
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
  ExternalLink,
  Image,
  Maximize2,
  Minimize2,
  ChevronDown,
  Plus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { slugify } from "@/lib/utils";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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
  const [isFullScreen, setIsFullScreen] = useState(false);
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

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
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
    <DashboardLayout fullWidth={isFullScreen}>
      <div className={cn(
        "py-6 transition-all duration-300",
        isFullScreen ? "px-0" : "px-4 md:px-0"
      )}>
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm mb-6">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => navigate("/admin/articles")}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <h1 className="text-xl font-bold truncate">
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
                  size="sm"
                  disabled={saving}
                  onClick={handlePreview}
                >
                  <EyeIcon className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Preview</span>
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={toggleFullScreen}
                >
                  {isFullScreen ? 
                    <Minimize2 className="mr-2 h-4 w-4" /> : 
                    <Maximize2 className="mr-2 h-4 w-4" />
                  }
                  <span className="hidden sm:inline">
                    {isFullScreen ? "Exit" : "Fullscreen"}
                  </span>
                </Button>
                <Button 
                  size="sm"
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

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm mb-6">
              <div className="px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center gap-4">
                <TabsList>
                  <TabsTrigger value="editor" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Editor
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <EyeIcon className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground hidden md:flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {formatDate(new Date())}
                  </div>
                  
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
                        <Badge 
                          variant={field.value ? "default" : "outline"}
                          className="text-xs font-normal cursor-pointer"
                          onClick={() => field.onChange(!field.value)}
                        >
                          {field.value ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
            
            <TabsContent value="editor" className="mt-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="shadow-sm lg:col-span-2 border dark:bg-gray-800 dark:border-gray-700">
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
                                <div className="flex">
                                  <div className="bg-muted flex items-center px-3 rounded-l-md border-y border-l text-muted-foreground">
                                    <span className="text-sm">/article/</span>
                                  </div>
                                  <Input 
                                    placeholder="article-slug" 
                                    {...field} 
                                    className="rounded-l-none" 
                                  />
                                </div>
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

                    <Card className="shadow-sm border dark:bg-gray-800 dark:border-gray-700">
                      <CardContent className="pt-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-medium">Article Settings</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem className="mb-4">
                                <FormLabel className="flex items-center gap-2">
                                  <Tag className="h-4 w-4" /> Category
                                </FormLabel>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <FormControl>
                                    <Select
                                      value={field.value}
                                      onValueChange={(value) => {
                                        field.onChange(value);
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {categories.map((category) => (
                                          <SelectItem key={category} value={category}>
                                            {category}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      placeholder="New category"
                                      value={newCategory}
                                      onChange={(e) => setNewCategory(e.target.value)}
                                    />
                                    <Button 
                                      type="button" 
                                      size="sm" 
                                      variant="outline"
                                      onClick={handleAddNewCategory}
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
                              <FormItem className="mb-4">
                                <FormLabel className="flex items-center gap-2">
                                  <Tag className="h-4 w-4" /> Tags
                                </FormLabel>
                                <FormControl>
                                  <div className="space-y-2">
                                    <Textarea 
                                      placeholder="React, TypeScript, etc. (comma-separated)" 
                                      {...field}
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
                                        <Button variant="outline" size="sm" className="w-full justify-start">
                                          <Plus className="mr-2 h-4 w-4" />
                                          Add from existing tags
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="p-0" align="start">
                                        <Command>
                                          <CommandInput placeholder="Search tags..." />
                                          <CommandList>
                                            <CommandEmpty>No tags found.</CommandEmpty>
                                            <CommandGroup>
                                              {tagsList.map((tag) => (
                                                <CommandItem
                                                  key={tag}
                                                  onSelect={() => handleSelectTag(tag)}
                                                >
                                                  {tag}
                                                </CommandItem>
                                              ))}
                                            </CommandGroup>
                                          </CommandList>
                                          <div className="border-t p-2 flex gap-2">
                                            <Input
                                              size={1}
                                              placeholder="New tag"
                                              value={newTag}
                                              onChange={(e) => setNewTag(e.target.value)}
                                            />
                                            <Button 
                                              type="button" 
                                              size="sm" 
                                              onClick={handleAddNewTag}
                                            >
                                              Add
                                            </Button>
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

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="author_name"
                              render={({ field }) => (
                                <FormItem className="mb-4">
                                  <FormLabel className="flex items-center gap-2">
                                    <User className="h-4 w-4" /> Author
                                  </FormLabel>
                                  <div className="space-y-2">
                                    <FormControl>
                                      <Select
                                        value={field.value}
                                        onValueChange={(value) => {
                                          field.onChange(value);
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select author" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {authors.map((author) => (
                                            <SelectItem key={author} value={author}>
                                              {author}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        placeholder="New author"
                                        value={newAuthor}
                                        onChange={(e) => setNewAuthor(e.target.value)}
                                      />
                                      <Button 
                                        type="button" 
                                        size="sm" 
                                        variant="outline"
                                        onClick={handleAddNewAuthor}
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
                                <FormItem className="mb-4">
                                  <FormLabel className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Read Time
                                  </FormLabel>
                                  <div className="flex items-center gap-2">
                                    <FormControl>
                                      <Input placeholder="5 min read" {...field} />
                                    </FormControl>
                                    <Button 
                                      type="button" 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => calculateReadTime(editorValue)}
                                    >
                                      Calculate
                                    </Button>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="cover_image"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Image className="h-4 w-4" /> Cover Image
                                </FormLabel>
                                <FormControl>
                                  <div className="space-y-4">
                                    <Input placeholder="URL to cover image" {...field} />
                                    {field.value && (
                                      <div className="aspect-video w-full overflow-hidden bg-muted rounded-md">
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
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="shadow-sm border dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <FileText className="h-4 w-4" /> Content
                            </FormLabel>
                            <Card className="border-0 shadow-none">
                              <CardContent className="p-0">
                                <div className="min-h-[650px]">
                                  <ReactQuill
                                    theme="snow"
                                    modules={modules}
                                    formats={formats}
                                    value={editorValue}
                                    onChange={(value) => {
                                      setEditorValue(value);
                                    }}
                                    className="h-[600px]"
                                    style={{ height: "600px" }}
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
              <Card className="shadow-sm border overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={form.getValues("cover_image") || "/placeholder.svg"}
                    alt={form.getValues("title")}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
                <CardContent className="pt-6">
                  <div className="prose max-w-none dark:prose-invert">
                    <div className="mb-6">
                      <Badge className="mb-4">
                        {form.getValues("category")}
                      </Badge>
                      <h1 className="text-3xl font-bold mb-3 mt-0">{form.getValues("title")}</h1>
                      <p className="text-muted-foreground mb-6">{form.getValues("excerpt")}</p>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground pb-6 mb-6 border-b">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>By {form.getValues("author_name")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{formatDate(new Date())}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{form.getValues("read_time")}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="prose prose-slate dark:prose-invert max-w-none prose-img:rounded-xl prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80"
                      dangerouslySetInnerHTML={{ __html: form.getValues("content") || "<p>No content yet.</p>" }}
                    />
                    
                    <div className="mt-8 border-t pt-6">
                      <h3 className="text-lg font-semibold mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {form.getValues("tags").split(",").map((tag, index) => (
                          tag.trim() && (
                            <Badge key={index} variant="secondary" className="font-normal">
                              {tag.trim()}
                            </Badge>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ArticleEditor;
