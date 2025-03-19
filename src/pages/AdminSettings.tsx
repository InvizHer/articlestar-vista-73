import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { useAdmin } from "@/context/AdminContext";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save, AlertCircle, Check, RefreshCw, Lock, Palette } from "lucide-react";

const themeColors = [
  { value: "default", label: "Default" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "purple", label: "Purple" },
  { value: "orange", label: "Orange" },
  { value: "pink", label: "Pink" },
];

const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const themeSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  themeColor: z.enum(["default", "blue", "green", "purple", "orange", "pink"]),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;
type ThemeFormValues = z.infer<typeof themeSchema>;

type SiteSettings = {
  id: string;
  default_theme: "light" | "dark" | "system";
  default_theme_color: "default" | "blue" | "green" | "purple" | "orange" | "pink";
};

const AdminSettings: React.FC = () => {
  const { admin } = useAdmin();
  const { theme, themeColor, setTheme, setThemeColor } = useTheme();
  const [loading, setLoading] = useState(false);
  const [loadingTheme, setLoadingTheme] = useState(false);
  const [defaultThemeSettings, setDefaultThemeSettings] = useState<SiteSettings | null>(null);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const themeForm = useForm<ThemeFormValues>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      theme: defaultThemeSettings?.default_theme || theme,
      themeColor: defaultThemeSettings?.default_theme_color || themeColor,
    },
  });

  useEffect(() => {
    fetchDefaultThemeSettings();
  }, []);

  useEffect(() => {
    if (defaultThemeSettings) {
      themeForm.reset({
        theme: defaultThemeSettings.default_theme,
        themeColor: defaultThemeSettings.default_theme_color,
      });
    }
  }, [defaultThemeSettings]);

  const fetchDefaultThemeSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error) {
        console.error("Error fetching settings:", error);
        // Use current theme as fallback
        setDefaultThemeSettings({
          id: "1", // Provide a default ID
          default_theme: theme as "light" | "dark" | "system",
          default_theme_color: themeColor as "default" | "blue" | "green" | "purple" | "orange" | "pink",
        });
      } else if (data) {
        setDefaultThemeSettings(data as SiteSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Use current theme as fallback
      setDefaultThemeSettings({
        id: "1", // Provide a default ID
        default_theme: theme as "light" | "dark" | "system",
        default_theme_color: themeColor as "default" | "blue" | "green" | "purple" | "orange" | "pink",
      });
    }
  };

  const onSubmitPassword = async (data: PasswordFormValues) => {
    if (!admin) return;
    
    try {
      setLoading(true);
      
      // Verify current password
      const { data: adminData, error: verifyError } = await supabase
        .from("admins")
        .select()
        .eq("username", admin.username)
        .eq("password", data.currentPassword)
        .single();
      
      if (verifyError || !adminData) {
        toast.error("Current password is incorrect");
        return;
      }
      
      // Update password
      const { error: updateError } = await supabase
        .from("admins")
        .update({ password: data.newPassword })
        .eq("id", adminData.id);
      
      if (updateError) throw updateError;
      
      toast.success("Password updated successfully");
      passwordForm.reset();
      
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitTheme = async (data: ThemeFormValues) => {
    try {
      setLoadingTheme(true);
      
      if (!defaultThemeSettings) {
        // Create settings if they don't exist
        const { data: insertedData, error: insertError } = await supabase
          .from('site_settings')
          .insert([
            { 
              default_theme: data.theme, 
              default_theme_color: data.themeColor 
            }
          ])
          .select()
          .single();
          
        if (insertError) throw insertError;
        
        if (insertedData) {
          setDefaultThemeSettings(insertedData as SiteSettings);
        }
      } else {
        // Update existing settings
        const { error } = await supabase
          .from('site_settings')
          .update({ 
            default_theme: data.theme, 
            default_theme_color: data.themeColor 
          })
          .eq('id', defaultThemeSettings.id);
        
        if (error) throw error;
        
        setDefaultThemeSettings({
          ...defaultThemeSettings,
          default_theme: data.theme,
          default_theme_color: data.themeColor
        });
      }
      
      // Apply theme immediately too
      setTheme(data.theme);
      setThemeColor(data.themeColor);
      
      toast.success("Default theme updated successfully");
    } catch (error) {
      console.error("Error updating theme:", error);
      toast.error("Failed to update theme settings");
    } finally {
      setLoadingTheme(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="container max-w-4xl py-8"
      >
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <Tabs defaultValue="theme">
          <TabsList className="mb-6">
            <TabsTrigger value="theme">
              <Palette className="h-4 w-4 mr-2" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="account">
              <Lock className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="theme" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>
                  Customize the default appearance of your blog. These settings will apply to all visitors.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...themeForm}>
                  <form onSubmit={themeForm.handleSubmit(onSubmitTheme)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={themeForm.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Theme Mode</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select theme mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {themeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The default theme for new visitors.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={themeForm.control}
                        name="themeColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select primary color" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {themeColors.map((color) => (
                                  <SelectItem key={color.value} value={color.value}>
                                    <div className="flex items-center">
                                      <div 
                                        className={`w-4 h-4 rounded-full mr-2 bg-${color.value === 'default' ? 'primary' : color.value}-500`}
                                      />
                                      {color.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The primary color for your blog.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Alert className="bg-muted/50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Note</AlertTitle>
                      <AlertDescription>
                        Users can override these settings in their browser. These are just the defaults for new visitors.
                      </AlertDescription>
                    </Alert>
                    
                    <Button type="submit" disabled={loadingTheme} className="w-full md:w-auto">
                      {loadingTheme ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Theme Settings
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Current Settings</CardTitle>
                <CardDescription>
                  These are your current settings. Your own preferences are saved in your browser.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Current Theme</Label>
                    <div className="flex items-center mt-1">
                      <div className={`w-4 h-4 rounded-full mr-2 ${theme === 'dark' ? 'bg-gray-800' : theme === 'light' ? 'bg-gray-200' : 'bg-gradient-to-r from-gray-200 to-gray-800'}`} />
                      <span className="capitalize">{theme}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Current Color</Label>
                    <div className="flex items-center mt-1">
                      <div className={`w-4 h-4 rounded-full mr-2 bg-${themeColor === 'default' ? 'primary' : themeColor}-500`} />
                      <span className="capitalize">{themeColor}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Update your admin account password. For security, you'll need to confirm your current password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormDescription>
                              At least 6 characters.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button type="submit" disabled={loading} className="w-full md:w-auto">
                      {loading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
};

export default AdminSettings;
