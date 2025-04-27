import React from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Map, 
  Rocket, 
  ArrowRight, 
  LineChart, 
  Briefcase, 
  Scale, 
  Megaphone, 
  Palette 
} from "lucide-react";

interface NewFeaturesProps {
  hasStartups: boolean;
  startupId?: string;
}

const NewFeatures: React.FC<NewFeaturesProps> = ({ hasStartups, startupId }) => {
  const [, navigate] = useLocation();

  const features = [
    {
      title: "Community Forum",
      description: "Connect with other entrepreneurs, share ideas, and get feedback from the community.",
      icon: <MessageSquare className="h-5 w-5" />,
      path: "/forum",
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      disabled: false
    },
    {
      title: "Startup Roadmap",
      description: "Plan your startup journey with milestones and track your progress over time.",
      icon: <Map className="h-5 w-5" />,
      path: hasStartups && startupId ? `/startups/${startupId}/roadmap` : "",
      color: "text-green-500",
      bgColor: "bg-green-100",
      disabled: !hasStartups
    },
    {
      title: "Funding Strategy",
      description: "Develop a comprehensive funding strategy for your startup.",
      icon: <Briefcase className="h-5 w-5" />,
      path: hasStartups && startupId ? `/startups/${startupId}/funding` : "",
      color: "text-amber-500",
      bgColor: "bg-amber-100",
      disabled: !hasStartups
    },
    {
      title: "Scalability Plan",
      description: "Plan for growth and scaling your business effectively.",
      icon: <LineChart className="h-5 w-5" />,
      path: hasStartups && startupId ? `/startups/${startupId}/scaling` : "",
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      disabled: !hasStartups
    },
    {
      title: "Launch Toolkit",
      description: "Essential tools and checklists for your product launch.",
      icon: <Rocket className="h-5 w-5" />,
      path: hasStartups && startupId ? `/startups/${startupId}/launch` : "",
      color: "text-red-500",
      bgColor: "bg-red-100",
      disabled: !hasStartups
    },
    {
      title: "Legal Pack",
      description: "Legal templates and compliance guidance for your startup.",
      icon: <Scale className="h-5 w-5" />,
      path: hasStartups && startupId ? `/startups/${startupId}/legal` : "",
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
      disabled: !hasStartups
    },
    {
      title: "Marketing Plan",
      description: "Create a comprehensive marketing strategy for your business.",
      icon: <Megaphone className="h-5 w-5" />,
      path: hasStartups && startupId ? `/startups/${startupId}/marketing` : "",
      color: "text-indigo-500",
      bgColor: "bg-indigo-100",
      disabled: !hasStartups
    },
    {
      title: "Branding Kit",
      description: "Develop your brand identity and assets with AI assistance.",
      icon: <Palette className="h-5 w-5" />,
      path: hasStartups && startupId ? `/startups/${startupId}/branding` : "",
      color: "text-pink-500",
      bgColor: "bg-pink-100",
      disabled: !hasStartups
    }
  ];

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Startup Tools</h2>
        <Button variant="outline" size="sm" onClick={() => navigate("/forum")}>
          Visit Community Forum
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature) => (
          <Card 
            key={feature.title} 
            className={`hover:shadow-md transition-shadow duration-300 ${!feature.disabled ? 'cursor-pointer' : ''}`}
            onClick={() => !feature.disabled ? navigate(feature.path) : null}
          >
            <CardHeader className="pb-2">
              <div className={`w-10 h-10 rounded-full ${feature.bgColor} flex items-center justify-center mb-2`}>
                <span className={feature.color}>{feature.icon}</span>
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                {feature.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start"
                disabled={feature.disabled}
                onClick={() => !feature.disabled ? navigate(feature.path) : null}
              >
                {feature.disabled ? "Create a startup first" : "Explore"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NewFeatures;