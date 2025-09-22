"use client";

import { PledgeBoard } from "@/components/board/pledge-board";
import type { BoardData } from "@/components/board/pledge-board";

// Example board data - no server interaction
const EXAMPLE_BOARD: BoardData = {
  id: "example",
  title: "Community Potluck & Game Night",
  description:
    "Let's gather for an evening of good food and fun! Bring a dish to share and your favorite board games. We need volunteers to help with setup, activities, and cleanup.",
  sections: [
    {
      id: "food-drinks",
      title: "Food & Drinks",
      description: "Help us feed the neighborhood!",
      icon: "Utensils" as const,
      items: [
        {
          id: "main-dish",
          title: "Main dishes",
          description: "Casseroles, pasta, or other hearty dishes",
          icon: "Utensils" as const,
          needed: 4,
          volunteers: [
            { id: "v1", name: "Alex R.", details: "Bringing lasagna" },
          ],
          category: "Food",
          isTask: false,
        },
        {
          id: "sides",
          title: "Side dishes & salads",
          description: "Veggies, salads, bread, etc.",
          icon: "Sandwich" as const,
          needed: 5,
          volunteers: [{ id: "v2", name: "Jamie L.", details: "Caesar salad" }],
          category: "Food",
          isTask: false,
        },
        {
          id: "desserts",
          title: "Desserts",
          description: "Sweet treats to share",
          icon: "Cake" as const,
          needed: 3,
          volunteers: [
            { id: "v3", name: "Sam K.", details: "Homemade cookies" },
          ],
          category: "Food",
          isTask: false,
        },
        {
          id: "drinks",
          title: "Beverages",
          description: "Water, sodas, juice",
          icon: "CupSoda" as const,
          needed: 2,
          volunteers: [],
          category: "Drinks",
          isTask: false,
        },
      ],
    },
    {
      id: "setup-crew",
      title: "Setup & Cleanup",
      description: "We need help getting ready and cleaning up after",
      icon: "Users" as const,
      items: [
        {
          id: "setup",
          title: "Setup crew (5:30pm)",
          description: "Help arrange tables, chairs, and decorations",
          icon: "Clock" as const,
          needed: 3,
          volunteers: [{ id: "v4", name: "Pat M.", details: "" }],
          category: "Setup",
          isTask: true,
        },
        {
          id: "cleanup",
          title: "Cleanup crew",
          description: "Help pack up at the end (around 9pm)",
          icon: "Trash" as const,
          needed: 3,
          volunteers: [],
          category: "Cleanup",
          isTask: true,
        },
        {
          id: "tables",
          title: "Tables & chairs",
          description: "We need 4 folding tables and extra chairs",
          icon: "Package" as const,
          needed: 2,
          volunteers: [
            { id: "v5", name: "Morgan D.", details: "2 tables + 8 chairs" },
          ],
          category: "Equipment",
          isTask: false,
        },
      ],
    },
    {
      id: "activities",
      title: "Games & Activities",
      description: "Bring your favorite games to share!",
      icon: "Gamepad" as const,
      items: [
        {
          id: "board-games",
          title: "Board games",
          description: "Bring family-friendly board games",
          icon: "Gamepad" as const,
          needed: 5,
          volunteers: [
            { id: "v6", name: "Chris T.", details: "Catan & Ticket to Ride" },
            { id: "v7", name: "Jordan L.", details: "Uno & Exploding Kittens" },
          ],
          category: "Games",
          isTask: false,
        },
        {
          id: "kids-activities",
          title: "Kids activity coordinator",
          description: "Organize games and activities for children",
          icon: "Users" as const,
          needed: 1,
          volunteers: [],
          category: "Activities",
          isTask: true,
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
