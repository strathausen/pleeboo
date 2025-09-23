"use client";

import type { BoardData } from "@/components/board/pledge-board";
import { PledgeBoard } from "@/components/board/pledge-board";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/ui/header";
import { Logo } from "@/components/ui/logo";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Gift,
  Share2,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Typewriter from "typewriter-effect";

// Simple example board data
const SIMPLE_EXAMPLE: BoardData = {
  id: "demo",
  title: "Summer Block Party",
  description: "",
  sections: [
    {
      id: "food",
      title: "Food & Drinks",
      icon: "Utensils" as const,
      items: [
        {
          id: "pizza",
          title: "Savoury snacks",
          icon: "Pizza" as const,
          needed: 1,
          volunteers: [
            {
              id: "v1",
              name: "Sarah M.",
              details: "I can bring pizza! 🍕",
              slot: 0,
            },
          ],
        },
        {
          id: "drinks",
          title: "Soft drinks & water",
          description: "Non-alcoholic beverages",
          icon: "CupSoda" as const,
          needed: 2,
          volunteers: [
            {
              id: "v2",
              name: "Mike R.",
              details: "home made lemonade 🍋",
              slot: 0,
            },
          ],
        },
        {
          id: "desserts",
          title: "Desserts",
          description: "Sweet treats for everyone",
          icon: "Cake" as const,
          needed: 3,
          volunteers: [
            { id: "v3", name: "Emma L.", details: "", slot: 0 },
            { id: "v4", name: "Alex K.", details: "", slot: 1 },
          ],
        },
      ],
    },
    {
      id: "setup",
      title: "Setup & Cleanup",
      icon: "Package" as const,
      items: [
        {
          id: "tables",
          title: "Set up tables (3pm)",
          icon: "Clock" as const,
          needed: 2,
          volunteers: [
            { id: "v5", name: "John D.", details: "", slot: 0 },
            { id: "v6", name: "Lisa W.", details: "", slot: 1 },
          ],
        },
        {
          id: "cleanup",
          title: "Cleanup crew",
          icon: "Trash" as const,
          needed: 3,
          volunteers: [{ id: "v7", name: "Tom H.", details: "", slot: 0 }],
        },
      ],
    },
    {
      id: "activities",
      title: "Activities",
      icon: "Gamepad" as const,
      items: [
        {
          id: "games",
          title: "Kids games coordinator",
          icon: "Users" as const,
          needed: 1,
          volunteers: [],
        },
        {
          id: "parking",
          title: "Parking helper",
          icon: "Car" as const,
          needed: 1,
          volunteers: [{ id: "v8", name: "Ryan P.", details: "", slot: 0 }],
        },
      ],
    },
  ],
};

export default function LandingPage() {
  const features = [
    {
      id: 1,
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: "Instant Setup",
      description: "Create a pledge board in seconds. No sign-ups, no hassle.",
    },
    {
      id: 2,
      icon: <Share2 className="h-6 w-6 text-blue-500" />,
      title: "Easy Sharing",
      description:
        "Share a simple link with your community. Works on any device.",
    },
    {
      id: 3,
      icon: <Users className="h-6 w-6 text-green-500" />,
      title: "Real-time Collaboration",
      description:
        "See pledges update instantly as your community contributes.",
    },
    {
      id: 4,
      icon: <Bot className="h-6 w-6 text-purple-500" />,
      title: "Smart Suggestions",
      description:
        "Get helpful recommendations to populate your board based on your event type.",
    },
    {
      id: 5,
      icon: <CheckCircle2 className="h-6 w-6 text-pink-500" />,
      title: "Track Progress",
      description: "Mark tasks complete and celebrate milestones together.",
    },
    {
      id: 6,
      icon: <Gift className="h-6 w-6 text-orange-500" />,
      title: "100% Free",
      description: "No hidden costs, no premium tiers. Free forever.",
    },
  ];

  const useCases = [
    {
      id: 1,
      title: "Community Events",
      example: "Block parties, fundraisers, festivals",
      icon: "🎉",
    },
    {
      id: 2,
      title: "School Activities",
      example: "Bake sales, field trips, PTA events",
      icon: "🎓",
    },
    {
      id: 3,
      title: "Team Building",
      example: "Office parties, retreats, celebrations",
      icon: "🤝",
    },
    {
      id: 4,
      title: "Family Gatherings",
      example: "Reunions, holidays, birthdays",
      icon: "👨‍👩‍👧‍👦",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text pb-2 font-bold text-5xl text-transparent tracking-tight sm:text-6xl">
              <style jsx>{`
                .typewriter-gradient .Typewriter__wrapper,
                .typewriter-gradient .Typewriter__cursor {
                  background: inherit;
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                }
              `}</style>
              <div>Organize Your</div>
              <div className="typewriter-gradient my-2">
                <Typewriter
                  options={{
                    strings: [
                      "Community Picnic",
                      "Office Potluck",
                      "School Fundraiser",
                      "Birthday Party",
                      "Team Building",
                      "Holiday Gathering",
                      "Block Party",
                      "Company Retreat",
                      "Family Reunion",
                      "Charity Event",
                      "Bake Sale",
                      "Game Night",
                      "Cookout",
                      "Book Club",
                      "Craft Fair",
                      "Movie Night",
                      "Picnic",
                      "Barbecue",
                    ],
                    autoStart: true,
                    loop: true,
                    delay: 80,
                    deleteSpeed: 50,
                  }}
                />
              </div>
            </h1>
            <p className="mb-10 text-muted-foreground text-xl">
              Coordinate volunteers and resources for any event.
              <br />
              Create a pledge board, share the link, and watch your community
              come together.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/board">
                <Button size="lg" className="min-w-[200px]">
                  Create Your First Board
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/example">
                <Button size="lg" variant="outline" className="min-w-[200px]">
                  See Example Board
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <SectionHeading>See How It Works</SectionHeading>
          </div>

          <div className="overflow-hidden rounded-2xl">
            <PledgeBoard
              initialData={SIMPLE_EXAMPLE}
              editable={false}
              isExample={true}
              hideHeader={true}
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <SectionHeading>Everything You Need</SectionHeading>
            <p className="text-lg text-muted-foreground">
              Powerful features that make organizing effortless
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={`feature-${feature.id}`}
                className="border-2 transition-colors hover:border-primary/50"
              >
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
      <section className="bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <SectionHeading>Perfect For Any Event</SectionHeading>
            <p className="text-lg text-muted-foreground">
              From small gatherings to large community events
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((useCase) => (
              <div
                key={`useCase-${useCase.id}`}
                className="rounded-lg border-2 bg-background p-6 text-center transition-colors hover:border-primary/50"
              >
                <div className="mb-4 text-4xl">{useCase.icon}</div>
                <h3 className="mb-2 font-semibold">{useCase.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {useCase.example}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-12 text-white">
            <SectionHeading variant="white" className="text-white">
              Start Organizing Today
            </SectionHeading>
            <p className="mb-8 text-white/90 text-xl">
              Join thousands of communities using Pleeboo to coordinate better.
              No credit card required. Ever.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/board">
                <Button size="lg" variant="secondary" className="min-w-[200px]">
                  Create Free Board
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/70">
              ✨ Smart suggestions • 🔒 No sign-up required • 💯 Free forever
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-4">
              <Logo size="sm" />
              <p className="text-muted-foreground text-sm">
                © 2024 Pleeboo. Made with ❤️ for communities everywhere.
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link
                href="/landing"
                className="text-muted-foreground hover:text-foreground"
              >
                About
              </Link>
              <Link
                href="/board"
                className="text-muted-foreground hover:text-foreground"
              >
                Create Board
              </Link>
              <a
                href="https://github.com"
                className="text-muted-foreground hover:text-foreground"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
