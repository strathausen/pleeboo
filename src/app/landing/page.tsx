"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  ArrowRight, 
  CheckCircle2, 
  Gift, 
  Link2, 
  Sparkles, 
  Users, 
  Zap,
  Share2,
  ListTodo,
  Bot
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [activeDemo, setActiveDemo] = useState<"create" | "share" | "pledge">("create");

  const features = [
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: "Instant Setup",
      description: "Create a pledge board in seconds. No sign-ups, no hassle.",
    },
    {
      icon: <Share2 className="h-6 w-6 text-blue-500" />,
      title: "Easy Sharing",
      description: "Share a simple link with your community. Works on any device.",
    },
    {
      icon: <Users className="h-6 w-6 text-green-500" />,
      title: "Real-time Collaboration",
      description: "See pledges update instantly as your community contributes.",
    },
    {
      icon: <Bot className="h-6 w-6 text-purple-500" />,
      title: "AI Assistance",
      description: "Get smart suggestions to populate your board based on your event type.",
    },
    {
      icon: <CheckCircle2 className="h-6 w-6 text-pink-500" />,
      title: "Track Progress",
      description: "Mark tasks complete and celebrate milestones together.",
    },
    {
      icon: <Gift className="h-6 w-6 text-orange-500" />,
      title: "100% Free",
      description: "No hidden costs, no premium tiers. Free forever.",
    },
  ];

  const useCases = [
    {
      title: "Community Events",
      example: "Block parties, fundraisers, festivals",
      icon: "🎉",
    },
    {
      title: "School Activities",
      example: "Bake sales, field trips, PTA events",
      icon: "🎓",
    },
    {
      title: "Team Building",
      example: "Office parties, retreats, celebrations",
      icon: "🤝",
    },
    {
      title: "Family Gatherings",
      example: "Reunions, holidays, birthdays",
      icon: "👨‍👩‍👧‍👦",
    },
  ];

  const demoBoards = {
    create: {
      title: "Create Your Board",
      description: "Give your pledge board a name and description",
      content: (
        <div className="space-y-4 p-4">
          <input 
            type="text" 
            placeholder="Summer Block Party 2024" 
            className="w-full rounded-md border bg-background px-3 py-2"
            defaultValue="Summer Block Party 2024"
          />
          <textarea 
            placeholder="Help us make this the best block party ever!"
            className="w-full rounded-md border bg-background px-3 py-2 h-20"
            defaultValue="Help us make this the best block party ever! We need volunteers and supplies."
          />
          <Button className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Suggest Tasks
          </Button>
        </div>
      ),
    },
    share: {
      title: "Share With Your Community",
      description: "Get a unique link to share with contributors",
      content: (
        <div className="space-y-4 p-4">
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm text-muted-foreground mb-2">Your pledge board link:</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value="pleeboo.com/board/summer-party-2024" 
                readOnly
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
              />
              <Button size="sm">
                <Link2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              Share via Email
            </Button>
            <Button variant="outline" className="flex-1">
              Share via Text
            </Button>
          </div>
        </div>
      ),
    },
    pledge: {
      title: "Community Pledges",
      description: "Watch as people sign up to help",
      content: (
        <div className="space-y-3 p-4">
          <div className="rounded-md border p-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Set up tables and chairs</p>
                <p className="text-xs text-muted-foreground">Pledged by: Sarah M.</p>
              </div>
            </div>
          </div>
          <div className="rounded-md border p-3">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-sm border-2 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Bring coolers with ice</p>
                <p className="text-xs text-muted-foreground">2 needed</p>
              </div>
            </div>
          </div>
          <div className="rounded-md border p-3 opacity-60">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-sm border-2 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Organize games for kids</p>
                <p className="text-xs text-muted-foreground">Pledging now...</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Organize Community Efforts with Ease
            </h1>
            <p className="mb-10 text-xl text-muted-foreground">
              Pleeboo is the free, simple way to coordinate volunteers and resources for any event. 
              Create a pledge board, share the link, and watch your community come together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="min-w-[200px]">
                  Create Your First Board
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="min-w-[200px]">
                See Example Board
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">See How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to organized success
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <button
                onClick={() => setActiveDemo("create")}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  activeDemo === "create" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${
                    activeDemo === "create" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <ListTodo className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">1. Create Your Board</h3>
                    <p className="text-sm text-muted-foreground">
                      Set up your pledge board with AI-powered suggestions
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveDemo("share")}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  activeDemo === "share" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${
                    activeDemo === "share" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <Share2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">2. Share the Link</h3>
                    <p className="text-sm text-muted-foreground">
                      Send to your community via any platform
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveDemo("pledge")}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  activeDemo === "pledge" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${
                    activeDemo === "pledge" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">3. Collect Pledges</h3>
                    <p className="text-sm text-muted-foreground">
                      Watch as people sign up to contribute
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>{demoBoards[activeDemo].title}</CardTitle>
                <CardDescription>{demoBoards[activeDemo].description}</CardDescription>
              </CardHeader>
              <CardContent>
                {demoBoards[activeDemo].content}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg">
              Powerful features that make organizing effortless
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Perfect For Any Event</h2>
            <p className="text-muted-foreground text-lg">
              From small gatherings to large community events
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg bg-background border-2 hover:border-primary/50 transition-colors"
              >
                <div className="text-4xl mb-4">{useCase.icon}</div>
                <h3 className="font-semibold mb-2">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground">{useCase.example}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Start Organizing Today
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of communities using Pleeboo to coordinate better.
              No credit card required. Ever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" variant="secondary" className="min-w-[200px]">
                  Create Free Board
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/70">
              ✨ AI-powered • 🔒 No sign-up required • 💯 Free forever
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Logo size="sm" />
              <p className="text-sm text-muted-foreground">
                © 2024 Pleeboo. Made with ❤️ for communities everywhere.
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/landing" className="text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                Create Board
              </Link>
              <a href="https://github.com" className="text-muted-foreground hover:text-foreground">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}