"use client";

import type { BoardData } from "@/components/board/pledge-board";
import { PledgeBoard } from "@/components/board/pledge-board";

// Example board data - no server interaction
const EXAMPLE_BOARD: BoardData = {
  id: "example",
  title:
    "Annual Neighborhood Llama Wrestling Championship & Spaghetti Sculpture Contest",
  description:
    "Join us for the most bizarre community event! Bring your wrestling llamas, artistic pasta, and your collection of antique spoons. Safety goggles required, common sense optional.",
  sections: [
    {
      id: "food-drinks",
      title: "Edible Chaos",
      description: "Feed the masses with questionable culinary choices!",
      icon: "Utensils" as const,
      items: [
        {
          id: "main-dish",
          title: "Mystery meat surprises",
          description: "Is it chicken? Is it tofu? Nobody knows!",
          icon: "Utensils" as const,
          needed: 4,
          volunteers: [
            {
              id: "v1",
              name: "Zorblax Q.",
              details: "Bringing jellied moose nose",
              slot: 0,
            },
          ],
        },
        {
          id: "sides",
          title: "Vegetables that scream",
          description: "Preferably root vegetables with faces drawn on them",
          icon: "Sandwich" as const,
          needed: 5,
          volunteers: [
            {
              id: "v2",
              name: "Professor Noodle",
              details: "Haunted potato salad",
              slot: 0,
            },
          ],
        },
        {
          id: "desserts",
          title: "Sugar sculptures of extinct animals",
          description: "Bonus points for anatomical accuracy",
          icon: "Cake" as const,
          needed: 3,
          volunteers: [
            {
              id: "v3",
              name: "The Cookie Wizard",
              details: "Dodo bird macarons",
              slot: 0,
            },
          ],
        },
        {
          id: "drinks",
          title: "Suspicious liquids",
          description: "Various colors, all legally obtained",
          icon: "CupSoda" as const,
          needed: 6,
          volunteers: [],
        },
      ],
    },
    {
      id: "setup-crew",
      title: "Chaos Coordinators",
      description: "Help create organized disorder",
      icon: "Users" as const,
      items: [
        {
          id: "setup",
          title: "Llama wranglers (3:00am sharp)",
          description: "Must have experience with aggressive camelids",
          icon: "Clock" as const,
          needed: 3,
          volunteers: [
            {
              id: "v4",
              name: "Captain Alpaca",
              details: "Brings own lasso",
              slot: 0,
            },
          ],
        },
        {
          id: "cleanup",
          title: "Hazmat team",
          description: "Full protective gear provided (hopefully)",
          icon: "Trash" as const,
          needed: 4,
          volunteers: [],
        },
        {
          id: "tables",
          title: "Levitating furniture",
          description: "Anti-gravity tables preferred, regular ones acceptable",
          icon: "Package" as const,
          needed: 2,
          volunteers: [
            {
              id: "v5",
              name: "Dr. Hovercroft",
              details: "3 floating benches + time machine",
              slot: 0,
            },
          ],
        },
      ],
    },
    {
      id: "activities",
      title: "Competitive Nonsense",
      description: "Events that shouldn't exist but do!",
      icon: "Gamepad" as const,
      items: [
        {
          id: "board-games",
          title: "Extreme Monopoly (with real money)",
          description: "Bring your life savings and a helmet",
          icon: "Gamepad" as const,
          needed: 2,
          volunteers: [
            {
              id: "v6",
              name: "Bankruptcy Bob",
              details: "Lost house in last game",
              slot: 0,
            },
            {
              id: "v7",
              name: "The Dice Goblin",
              details: "Collection of cursed dice",
              slot: 1,
            },
          ],
        },
        {
          id: "kids-activities",
          title: "Junior chainsaw juggling instructor",
          description: "Must have insurance (lots of it)",
          icon: "Users" as const,
          needed: 1,
          volunteers: [],
        },
        {
          id: "mime-translator",
          title: "Professional mime translator",
          description: "For the interpretive dance competition",
          icon: "Users" as const,
          needed: 3,
          volunteers: [],
        },
        {
          id: "yodeling",
          title: "Competitive yodeling judges",
          description: "Must have survived previous yodeling incidents",
          icon: "Music" as const,
          needed: 5,
          volunteers: [
            {
              id: "v8",
              name: "Silent Steve",
              details: "Ironically deaf",
              slot: 0,
            },
          ],
        },
      ],
    },
    {
      id: "safety",
      title: '"Safety" Equipment',
      description: "Air quotes intentional",
      icon: "Shield" as const,
      items: [
        {
          id: "helmets",
          title: "Tin foil hats",
          description: "Protection from mind control AND falling spaghetti",
          icon: "HardHat" as const,
          needed: 6,
          volunteers: [],
        },
        {
          id: "first-aid",
          title: "Medieval medical supplies",
          description: "Leeches, bloodletting kit, and essential oils",
          icon: "Heart" as const,
          needed: 1,
          volunteers: [
            {
              id: "v9",
              name: "Dr. Questionable",
              details: "Not a real doctor",
              slot: 0,
            },
          ],
        },
        {
          id: "fire-extinguisher",
          title: "Dragon wrangler",
          description: "In case the BBQ gets out of hand",
          icon: "Flame" as const,
          needed: 2,
          volunteers: [],
        },
      ],
    },
  ],
};

export default function ExampleBoardPage() {
  return (
    <PledgeBoard
      initialData={EXAMPLE_BOARD}
      editable={false}
      isExample={true}
    />
  );
}
