import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  TrendingUp,
  Code,
  DollarSign,
  Gamepad2,
  Heart,
  Utensils,
  Briefcase,
  Brain,
  ArrowLeft,
  Search,
  LayoutTemplate,
  Github,
  Zap,
  Target,
  Lightbulb,
  Palette,
  Camera,
} from 'lucide-react';

interface SearchTemplate {
  id: string;
  title: string;
  description: string;
  query: string;
  icon: React.ReactNode;
  tags: string[];
  category: string;
  expectedResults: string;
}

const categories = [
  { id: 'all', label: 'All', icon: LayoutTemplate },
  { id: 'tech', label: 'Technology', icon: Code },
  { id: 'business', label: 'Business', icon: TrendingUp },
  { id: 'lifestyle', label: 'Lifestyle', icon: Heart },
  { id: 'creative', label: 'Creative', icon: Palette },
];

const templates: SearchTemplate[] = [
  // Technology
  {
    id: 'ai-news',
    title: 'AI & Machine Learning',
    description: 'Latest developments in artificial intelligence, LLMs, and ML research',
    query: 'AI machine learning',
    icon: <Brain className="h-6 w-6" />,
    tags: ['AI', 'Research', 'Future'],
    category: 'tech',
    expectedResults: 'r/MachineLearning, r/artificial, r/LocalLLaMA',
  },
  {
    id: 'programming-help',
    title: 'Programming & Dev',
    description: 'Coding help, software engineering discussions, and language-specific tips',
    query: 'programming coding help',
    icon: <Code className="h-6 w-6" />,
    tags: ['Coding', 'Development', 'Tech'],
    category: 'tech',
    expectedResults: 'r/programming, r/webdev, r/Python',
  },
  {
    id: 'tech-reviews',
    title: 'Tech Product Reviews',
    description: 'Real user opinions on the latest gadgets, software, and technology products',
    query: 'tech product review',
    icon: <Zap className="h-6 w-6" />,
    tags: ['Technology', 'Reviews', 'Gadgets'],
    category: 'tech',
    expectedResults: 'r/technology, r/gadgets, r/Android',
  },
  // Business
  {
    id: 'startup-ideas',
    title: 'Startup Ideas',
    description: 'Discover trending startup concepts, business opportunities, and entrepreneurial discussions',
    query: 'startup ideas',
    icon: <TrendingUp className="h-6 w-6" />,
    tags: ['Business', 'Entrepreneurship', 'Innovation'],
    category: 'business',
    expectedResults: 'r/startups, r/Entrepreneur, r/SideProject',
  },
  {
    id: 'personal-finance',
    title: 'Personal Finance',
    description: 'Investment strategies, budgeting advice, and financial planning discussions',
    query: 'personal finance investing',
    icon: <DollarSign className="h-6 w-6" />,
    tags: ['Finance', 'Investing', 'Money'],
    category: 'business',
    expectedResults: 'r/personalfinance, r/investing, r/financialindependence',
  },
  {
    id: 'career-advice',
    title: 'Career Advice',
    description: 'Job hunting tips, career development, and workplace discussions',
    query: 'career advice job',
    icon: <Briefcase className="h-6 w-6" />,
    tags: ['Career', 'Jobs', 'Professional'],
    category: 'business',
    expectedResults: 'r/careerguidance, r/jobs, r/cscareerquestions',
  },
  // Lifestyle
  {
    id: 'health-wellness',
    title: 'Health & Wellness',
    description: 'Fitness advice, mental health discussions, and wellness tips',
    query: 'health fitness wellness',
    icon: <Heart className="h-6 w-6" />,
    tags: ['Health', 'Fitness', 'Wellness'],
    category: 'lifestyle',
    expectedResults: 'r/Fitness, r/loseit, r/meditation',
  },
  {
    id: 'cooking-recipes',
    title: 'Cooking & Recipes',
    description: 'Culinary tips, recipe ideas, and food preparation techniques',
    query: 'cooking recipes tips',
    icon: <Utensils className="h-6 w-6" />,
    tags: ['Food', 'Cooking', 'Recipes'],
    category: 'lifestyle',
    expectedResults: 'r/Cooking, r/recipes, r/MealPrepSunday',
  },
  {
    id: 'gaming-recommendations',
    title: 'Gaming Recommendations',
    description: 'Game suggestions, reviews, and community discussions about video games',
    query: 'game recommendations',
    icon: <Gamepad2 className="h-6 w-6" />,
    tags: ['Gaming', 'Entertainment', 'Reviews'],
    category: 'lifestyle',
    expectedResults: 'r/gaming, r/Games, r/patientgamers',
  },
  // Creative
  {
    id: 'design-inspiration',
    title: 'Design Inspiration',
    description: 'UI/UX design trends, graphic design showcases, and creative ideas',
    query: 'design ui ux inspiration',
    icon: <Palette className="h-6 w-6" />,
    tags: ['Design', 'UI/UX', 'Creative'],
    category: 'creative',
    expectedResults: 'r/design, r/web_design, r/UI_Design',
  },
  {
    id: 'movie-recommendations',
    title: 'Movie Suggestions',
    description: 'Find your next favorite film with community-vetted recommendations',
    query: 'movie recommendations',
    icon: <Camera className="h-6 w-6" />,
    tags: ['Movies', 'Cinema', 'Entertainment'],
    category: 'creative',
    expectedResults: 'r/movies, r/MovieSuggestions',
  },
  {
    id: 'science-future',
    title: 'Science & Future',
    description: 'Cutting-edge scientific research and futuristic technological trends',
    query: 'science future technology',
    icon: <Sparkles className="h-6 w-6" />,
    tags: ['Science', 'Future', 'Innovation'],
    category: 'creative',
    expectedResults: 'r/science, r/askscience, r/Futurology',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

const Templates = () => {
  const navigate = useNavigate();

  const handleTemplateClick = (template: SearchTemplate) => {
    navigate(`/?q=${encodeURIComponent(template.query)}&autoSearch=true`);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Skip Links for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-medium"
      >
        Skip to main content
      </a>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-30"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/instax-dutta/project-ignition"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all duration-200"
              >
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => navigate('/')}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-lg blur-md group-hover:bg-primary/50 transition-colors" />
                  <div className="relative bg-gradient-to-br from-primary to-violet-500 p-2 rounded-lg">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <span className="font-heading text-lg font-bold tracking-tight">
                    Ignition
                  </span>
                  <span className="text-xs text-muted-foreground block -mt-0.5">Templates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main id="main-content" className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Pre-built Search Templates
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold">
            Quick Start <span className="text-gradient-primary">Templates</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose a template to instantly search for curated Reddit content. 
            Each template is optimized to find the most relevant discussions for your research.
          </p>
        </motion.div>

        {/* Category tabs would go here if we implemented filtering */}
        
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {templates.map((template) => (
            <motion.div key={template.id} variants={item}>
              <Card
                className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 bg-card/60 hover:bg-card h-full border-border/40"
                onClick={() => handleTemplateClick(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2.5 rounded-lg bg-gradient-to-br from-primary/20 to-violet-500/20 text-primary group-hover:from-primary/30 group-hover:to-violet-500/30 transition-colors"
                    >
                      {template.icon}
                    </motion.div>
                    <Badge variant="secondary" className="text-[10px] bg-secondary/70">
                      {template.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-heading mt-3">
                    {template.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs bg-secondary/30 border-border/50"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {template.expectedResults}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Card className="inline-block p-8 bg-card/50 border-border/50">
            <div className="space-y-4">
              <div className="flex justify-center mb-2">
                <div className="p-3 rounded-full bg-primary/10">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-heading text-xl font-semibold">
                Don't see what you're looking for?
              </h3>
              <p className="text-muted-foreground">
                Create your own custom search on the home page.
              </p>
              <Button onClick={() => navigate('/')} className="mt-2">
                <Search className="h-4 w-4 mr-2" />
                Custom Search
              </Button>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Templates;
