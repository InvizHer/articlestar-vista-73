
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Github as GitHub, Instagram, Linkedin, Youtube, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Footer: React.FC = () => {
  const links = [
    { title: "Home", href: "/" },
    { title: "Articles", href: "/articles" },
    { title: "About", href: "/about" },
    { title: "Contact", href: "/contact" }
  ];
  
  const categories = [
    { title: "Technology", href: "/articles?category=Technology" },
    { title: "Design", href: "/articles?category=Design" },
    { title: "Development", href: "/articles?category=Development" },
    { title: "Business", href: "/articles?category=Business" }
  ];
  
  const socialLinks = [
    { title: "GitHub", icon: <GitHub className="h-5 w-5" />, href: "https://github.com" },
    { title: "Instagram", icon: <Instagram className="h-5 w-5" />, href: "https://instagram.com" },
    { title: "LinkedIn", icon: <Linkedin className="h-5 w-5" />, href: "https://linkedin.com" },
    { title: "YouTube", icon: <Youtube className="h-5 w-5" />, href: "https://youtube.com" }
  ];

  const footerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <footer className="bg-muted/30 relative">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <motion.div 
          variants={footerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8"
        >
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="font-bold text-xl">BlogHub</span>
            </Link>
            <p className="text-muted-foreground mb-6 text-sm">
              A modern platform for sharing knowledge, stories, and insights about technology, design, and more.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((link, i) => (
                <a 
                  key={i}
                  href={link.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors border"
                  aria-label={link.title}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <h3 className="font-semibold mb-4 text-lg flex items-center">
              <span className="w-1 h-5 bg-primary mr-2 rounded-full"></span>
              Quick Links
            </h3>
            <ul className="space-y-2">
              {links.map((link, i) => (
                <li key={i}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary flex items-center transition-colors py-1 group"
                  >
                    <ChevronRight className="h-3 w-3 mr-1 text-primary/50 transition-transform group-hover:translate-x-1" />
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <h3 className="font-semibold mb-4 text-lg flex items-center">
              <span className="w-1 h-5 bg-primary mr-2 rounded-full"></span>
              Categories
            </h3>
            <ul className="space-y-2">
              {categories.map((category, i) => (
                <li key={i}>
                  <Link 
                    to={category.href}
                    className="text-muted-foreground hover:text-primary flex items-center transition-colors py-1 group"
                  >
                    <ChevronRight className="h-3 w-3 mr-1 text-primary/50 transition-transform group-hover:translate-x-1" />
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <h3 className="font-semibold mb-4 text-lg flex items-center">
              <span className="w-1 h-5 bg-primary mr-2 rounded-full"></span>
              Contact Us
            </h3>
            <div className="flex items-center text-muted-foreground gap-2 mb-3">
              <Mail className="h-4 w-4 text-primary" />
              <a href="mailto:info@bloghub.com" className="hover:text-primary transition-colors">
                info@bloghub.com
              </a>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Have questions or feedback? We'd love to hear from you!
            </p>
            <Button asChild variant="outline" className="rounded-lg hover:bg-primary hover:text-white transition-colors">
              <Link to="/contact">Get in Touch</Link>
            </Button>
          </motion.div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-border mt-10 pt-6 text-center text-sm text-muted-foreground"
        >
          <p>&copy; {new Date().getFullYear()} BlogHub. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
