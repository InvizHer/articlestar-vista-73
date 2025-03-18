
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
  ListChecks, 
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
  SettingsIcon,
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
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

interface CategoryItem {
  id: string;
  name: string;
}

interface Author {
  id: string;
  name: string;
  avatar: string;
}

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
  
  // State for categories, tags, and authors
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  
  // State for new items
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newAuthor, setNewAuthor] = useState({ name: "", avatar: "/placeholder.svg" });
  
  // Dialogs state
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [tagDialog, setTagDialog] = useState(false);
  const [authorDialog, setAuthorDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);

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

  // Load existing categories, tags, and authors when component mounts
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Fetch unique categories
        const { data: categoryData } = await supabase
          .from('articles')
          .select('category')
          .order('category');
          
        if (categoryData) {
          const uniqueCategories = Array.from(new Set(categoryData.map(item => item.category)))
            .filter(Boolean)
            .map((cat, index) => ({ id: `cat-${index}`, name: cat }));
          setCategories(uniqueCategories);
        }
        
        // Fetch unique tags
        const { data: tagData } = await supabase
          .from('articles')
          .select('tags');
          
        if (tagData) {
          const allTags = tagData.flatMap(item => item.tags || []);
          const uniqueTags = Array.from(new Set(allTags)).filter(Boolean);
          setTags(uniqueTags);
        }
        
        // Fetch unique authors
        const { data: authorData } = await supabase
          .from('articles')
          .select('author_name, author_avatar');
          
        if (authorData) {
          const uniqueAuthors = Array.from(
            new Map(authorData.map(item => [
              item.author_name, 
              { 
                id: `author-${item.author_name}`, 
                name: item.author_name, 
                avatar: item.author_avatar || "/placeholder.svg" 
              }
            ])).values()
          );
          setAuthors(uniqueAuthors);
        }
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };
    
    fetchMetadata();
  }, []);

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
  
  // Handle adding new category
  const handleAddCategory = () => {
    if (newCategory && !categories.some(c => c.name === newCategory)) {
      const newCategoryItem = { id: `cat-${Date.now()}`, name: newCategory };
      setCategories(prev => [...prev, newCategoryItem]);
      form.setValue("category", newCategory);
      setNewCategory("");
      setCategoryDialog(false);
      toast.success(`Category "${newCategory}" added`);
    }
  };
  
  // Handle adding new tag
  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags(prev => [...prev, newTag]);
      
      // Add to current tags in form
      const currentTags = form.getValues("tags");
      const tagsArray = currentTags ? 
        currentTags.split(",").map(t => t.trim()).filter(t => t !== "") : 
        [];
      
      if (!tagsArray.includes(newTag)) {
        tagsArray.push(newTag);
        form.setValue("tags", tagsArray.join(", "));
      }
      
      setNewTag("");
      setTagDialog(false);
      toast.success(`Tag "${newTag}" added`);
    }
  };
  
  // Handle adding new author
  const handleAddAuthor = () => {
    if (newAuthor.name && !authors.some(a => a.name === newAuthor.name)) {
      const newAuthorItem = { 
        id: `author-${Date.now()}`, 
        name: newAuthor.name, 
        avatar: newAuthor.avatar || "/placeholder.svg" 
      };
      
      setAuthors(prev => [...prev, newAuthorItem]);
      form.setValue("author_name", newAuthor.name);
      form.setValue("author_avatar", newAuthor.avatar);
      
      setNewAuthor({ name: "", avatar: "/placeholder.svg" });
      setAuthorDialog(false);
      toast.success(`Author "${newAuthor.name}" added`);
    }
  };

  if (initialLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="text-lg">Loading article...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  // Settings dialog content
  const SettingsDialogContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Profile Settings</h3>
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
            <img 
              src="/placeholder.svg" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h4 className="font-medium">Admin User</h4>
            <p className="text-sm text-muted-foreground">admin@example.com</p>
          </div>
          <Button variant="outline" size="sm">
            Edit Profile
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Blog Settings</h3>
        
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium">Dark Mode</h4>
            <p className="text-sm text-muted-foreground">Toggle dark mode for the editor</p>
          </div>
          <Switch defaultChecked={document.documentElement.classList.contains('dark')} />
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium">Auto Save</h4>
            <p className="text-sm text-muted-foreground">Save drafts automatically</p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium">Email Notifications</h4>
            <p className="text-sm text-muted-foreground">Get notified about comments</p>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout fullWidth={isFullScreen}>
      <div className={cn(
        "py-6 transition-all duration-300",
        isFullScreen ? "px-0" : "px-4 md:px-0"
      )}>
        <div className="bg-white border rounded-lg shadow-sm dark:bg-slate-800 dark:border-slate-700 mb-6">
          <div className="px-6 py-4">
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
                  variant="outline"
                  onClick={toggleFullScreen}
                >
                  {isFullScreen ? 
                    <Minimize2 className="mr-2 h-4 w-4" /> : 
                    <Maximize2 className="mr-2 h-4 w-4" />
                  }
                  <span className="hidden sm:inline">
                    {isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
                  </span>
                </Button>
                <Dialog open={settingsDialog} onOpenChange={setSettingsDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Settings</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Settings</DialogTitle>
                      <DialogDescription>
                        Configure your blog and account settings
                      </DialogDescription>
                    </DialogHeader>
                    <SettingsDialogContent />
                  </DialogContent>
                </Dialog>
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

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-white border rounded-lg shadow-sm dark:bg-slate-800 dark:border-slate-700 mb-6">
              <div className="px-6 py-4 flex justify-between items-center">
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
                    <Card className="shadow-sm lg:col-span-2 border dark:bg-slate-800 dark:border-slate-700">
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

                    <Card className="shadow-sm border dark:bg-slate-800 dark:border-slate-700">
                      <CardContent className="pt-6">
                        <div className="mb-4 flex justify-between items-center">
                          <h3 className="text-lg font-medium">Article Settings</h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <SettingsIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => calculateReadTime(editorValue)}>
                                Calculate Read Time
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => window.open(`/article/${form.getValues('slug')}`, '_blank')}
                                disabled={!isEditMode || !form.getValues('published')}
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Live
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                                <div className="flex gap-2">
                                  <FormControl>
                                    <Select
                                      value={field.value}
                                      onValueChange={(value) => {
                                        field.onChange(value);
                                      }}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a category" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {categories.map(category => (
                                          <SelectItem key={category.id} value={category.name}>
                                            {category.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  
                                  <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="icon">
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                      <DialogHeader>
                                        <DialogTitle>Add New Category</DialogTitle>
                                        <DialogDescription>
                                          Create a new category for your articles
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                          <Label htmlFor="new-category">Category Name</Label>
                                          <Input 
                                            id="new-category" 
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            placeholder="E.g., Technology, Health, Finance"
                                          />
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => setCategoryDialog(false)}>
                                          Cancel
                                        </Button>
                                        <Button onClick={handleAddCategory} disabled={!newCategory}>
                                          Add Category
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
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
                                <div className="space-y-2">
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {field.value.split(',').map((tag, index) => {
                                      const trimmedTag = tag.trim();
                                      return trimmedTag && (
                                        <Badge key={index} variant="secondary">
                                          {trimmedTag}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                  <div className="flex gap-2">
                                    <FormControl>
                                      <Input placeholder="React, TypeScript, etc. (comma-separated)" {...field} />
                                    </FormControl>
                                    
                                    <Dialog open={tagDialog} onOpenChange={setTagDialog}>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="icon">
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                          <DialogTitle>Add New Tag</DialogTitle>
                                          <DialogDescription>
                                            Create a new tag for your articles
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                          <div className="grid gap-2">
                                            <Label htmlFor="new-tag">Tag Name</Label>
                                            <Input 
                                              id="new-tag" 
                                              value={newTag}
                                              onChange={(e) => setNewTag(e.target.value)}
                                              placeholder="E.g., React, JavaScript, Design"
                                            />
                                          </div>
                                          
                                          <div className="grid grid-cols-5 gap-2">
                                            {tags.slice(0, 10).map((tag, index) => (
                                              <Badge 
                                                key={index} 
                                                variant="outline"
                                                className="cursor-pointer"
                                                onClick={() => {
                                                  const currentTags = field.value.split(',').map(t => t.trim()).filter(t => t !== "");
                                                  if (!currentTags.includes(tag)) {
                                                    const newTags = [...currentTags, tag].join(', ');
                                                    field.onChange(newTags);
                                                  }
                                                }}
                                              >
                                                {tag}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                        <DialogFooter>
                                          <Button variant="outline" onClick={() => setTagDialog(false)}>
                                            Cancel
                                          </Button>
                                          <Button onClick={handleAddTag} disabled={!newTag}>
                                            Add Tag
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </div>
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
                                  <div className="flex gap-2">
                                    <FormControl>
                                      <Select
                                        value={field.value}
                                        onValueChange={(value) => {
                                          field.onChange(value);
                                          const author = authors.find(a => a.name === value);
                                          if (author) {
                                            form.setValue("author_avatar", author.avatar);
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select an author" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {authors.map(author => (
                                            <SelectItem key={author.id} value={author.name}>
                                              {author.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    
                                    <Dialog open={authorDialog} onOpenChange={setAuthorDialog}>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="icon">
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                          <DialogTitle>Add New Author</DialogTitle>
                                          <DialogDescription>
                                            Create a new author for your articles
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                          <div className="grid gap-2">
                                            <Label htmlFor="author-name">Author Name</Label>
                                            <Input 
                                              id="author-name" 
                                              value={newAuthor.name}
                                              onChange={(e) => setNewAuthor({...newAuthor, name: e.target.value})}
                                              placeholder="Author's name"
                                            />
                                          </div>
                                          <div className="grid gap-2">
                                            <Label htmlFor="author-avatar">Avatar URL</Label>
                                            <Input 
                                              id="author-avatar" 
                                              value={newAuthor.avatar}
                                              onChange={(e) => setNewAuthor({...newAuthor, avatar: e.target.value})}
                                              placeholder="URL to author's avatar"
                                            />
                                          </div>
                                          {newAuthor.avatar && (
                                            <div className="flex justify-center">
                                              <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
                                                <img 
                                                  src={newAuthor.avatar} 
                                                  alt="Author preview"
                                                  className="h-full w-full object-cover"
                                                  onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        <DialogFooter>
                                          <Button variant="outline" onClick={() => setAuthorDialog(false)}>
                                            Cancel
                                          </Button>
                                          <Button onClick={handleAddAuthor} disabled={!newAuthor.name}>
                                            Add Author
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
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
                                  <FormControl>
                                    <Input placeholder="5 min read" {...field} />
                                  </FormControl>
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

                  <Card className="shadow-sm border dark:bg-slate-800 dark:border-slate-700">
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
              <Card className="shadow-sm border overflow-hidden dark:bg-slate-800 dark:border-slate-700">
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
    </AdminLayout>
  );
};

// Define Label component since it's not provided
const Label = ({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
    {children}
  </label>
);

export default ArticleEditor;
