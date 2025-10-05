import Instructor from "@instructor-ai/instructor";
import { getOpenAIClient } from "./openai";

const openai = getOpenAIClient();

export const instructorClient = Instructor({
  client: openai,
  mode: "FUNCTIONS",
});
