import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
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
} from 'lucide-react';

interface SearchTemplate {
  id: string;
  title: string;
  description: string;
  query: string;
  icon: React.ReactNode;
  tags: string[];
  expectedResults: string;
}

const templates: SearchTemplate[] = [
  {
    id: 'startup-ideas',
    title: 'Startup Ideas',
    description: 'Discover trending startup concepts, business opportunities, and entrepreneurial discussions',
    query: 'startup ideas',
    icon: <TrendingUp className="h-6 w-6" />,
    tags: ['Business', 'Entrepreneurship', 'Innovation'],
    expectedResults: 'r/startups, r/Entrepreneur, r/SideProject',
  },
  {
    id: 'tech-reviews',
    title: 'Tech Product Reviews',
    description: 'Real user opinions on the latest gadgets, software, and technology products',
    query: 'tech product review',
    icon: <Code className="h-6 w-6" />,
    tags: ['Technology', 'Reviews', 'Gadgets'],
    expectedResults: 'r/technology, r/gadgets, r/Android',
  },
  {
    id: 'ai-news',
    title: 'AI & Machine Learning',
    description: 'Latest developments in artificial intelligence, LLMs, and ML research',
    query: 'AI machine learning',
    icon: <Brain className="h-6 w-6" />,
    tags: ['AI', 'Technology', 'Research'],
    expectedResults: 'r/MachineLearning, r/artificial, r/LocalLLaMA',
  },
  {
    id: 'personal-finance',
    title: 'Personal Finance Tips',
    description: 'Investment strategies, budgeting advice, and financial planning discussions',
    query: 'personal finance investing',
    icon: <DollarSign className="h-6 w-6" />,
    tags: ['Finance', 'Investing', 'Money'],
    expectedResults: 'r/personalfinance, r/investing, r/financialindependence',
  },
  {
    id: 'gaming-recommendations',
    title: 'Gaming Recommendations',
    description: 'Game suggestions, reviews, and community discussions about video games',
    query: 'game recommendations',
    icon: <Gamepad2 className="h-6 w-6" />,
    tags: ['Gaming', 'Entertainment', 'Reviews'],
    expectedResults: 'r/gaming, r/Games, r/patientgamers',
  },
  {
    id: 'cooking-recipes',
    title: 'Cooking & Recipes',
    description: 'Culinary tips, recipe ideas, and food preparation techniques',
    query: 'cooking recipes tips',
    icon: <Utensils className="h-6 w-6" />,
    tags: ['Food', 'Cooking', 'Recipes'],
    expectedResults: 'r/Cooking, r/recipes, r/MealPrepSunday',
  },
  {
    id: 'career-advice',
    title: 'Career Advice',
    description: 'Job hunting tips, career development, and workplace discussions',
    query: 'career advice job',
    icon: <Briefcase className="h-6 w-6" />,
    tags: ['Career', 'Jobs', 'Professional'],
    expectedResults: 'r/careerguidance, r/jobs, r/cscareerquestions',
  },
  {
    id: 'health-wellness',
    title: 'Health & Wellness',
    description: 'Fitness advice, mental health discussions, and wellness tips',
    query: 'health fitness wellness',
    icon: <Heart className="h-6 w-6" />,
    tags: ['Health', 'Fitness', 'Wellness'],
    expectedResults: 'r/Fitness, r/loseit, r/meditation',
  },
];

const Templates = () => {
  const navigate = useNavigate();

  const handleTemplateClick = (template: SearchTemplate) => {
    // Navigate to home with the query as a URL parameter
    navigate(`/?q=${encodeURIComponent(template.query)}&autoSearch=true`);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/30 bg-background/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="font-heading text-xl font-semibold">
                Reddit<span className="text-primary">Context</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm">
            <Sparkles className="h-4 w-4" />
            Pre-built Search Templates
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold">
            Quick Start Templates
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose a template to instantly search for curated Reddit content.
            Each template is optimized to find the most relevant discussions.
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="group cursor-pointer transition-all duration-300 hover:shadow-card hover:border-primary/50 bg-card/50 hover:bg-card"
              onClick={() => handleTemplateClick(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {template.icon}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg font-heading mt-3">
                  {template.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs bg-secondary/50"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Searches: {template.expectedResults}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Search CTA */}
        <div className="mt-16 text-center">
          <Card className="inline-block p-8 bg-card/30 border-border/50">
            <div className="space-y-4">
              <h3 className="font-heading text-xl font-semibold">
                Don't see what you're looking for?
              </h3>
              <p className="text-muted-foreground">
                Create your own custom search on the home page.
              </p>
              <Button onClick={() => navigate('/')}>
                <Search className="h-4 w-4 mr-2" />
                Custom Search
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Templates;
