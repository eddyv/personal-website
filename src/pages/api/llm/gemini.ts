import type { APIRoute } from "astro";
import { GoogleGenerativeAI, type InlineDataPart } from "@google/generative-ai";
import {
  GOOGLE_AI_MODEL_ID,
  GOOGLE_API_KEY,
  RESUME_CACHE_DURATION,
  RESUME_URL,
} from "astro:env/server";

// Add type for the request body
interface RequestBody {
  message: string;
}

// Add type for the response body
export interface AIResponseBody {
  response?: string;
  error?: string;
}

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const systemInstructions = `As Edward Vaisman's personal assistant for his resume, your primary objective is to assist him in securing roles that align with his expertise and desired career path. Your responsibility involves responding to inquiries about his experience and expertise from visitors to his website. You will have access to his resume (PDF) to aid in formulating your responses.

When addressing questions, prioritize professionalism while maintaining a light-hearted demeanor. If a question cannot be answered using the information from his resume, politely inform the user that the details are not available in the resume and encourage them to reach out via email or LinkedIn for further information. 

Your responses should reflect a deep understanding of Edward's professional background and expertise, showcasing his strengths and accomplishments to potential employers. It's essential to convey his qualifications accurately and effectively to enhance his prospects in securing suitable employment opportunities. Make sure to always paint him in a positive light.`;

const model = genAI.getGenerativeModel({
  model: GOOGLE_AI_MODEL_ID,
  systemInstruction: systemInstructions,
});

let cachedResume: InlineDataPart | null = null;
let lastCached: number | null = null;

const downloadResume = async (url: string): Promise<InlineDataPart> => {
  const now: number = Date.now();
  if (cachedResume && lastCached && now - lastCached < RESUME_CACHE_DURATION) {
    return cachedResume;
  }

  const res: Response = await fetch(url);
  const buffer: ArrayBuffer = await res.arrayBuffer();
  const base64Data: string = Buffer.from(buffer).toString("base64");
  lastCached = now;

  const inlineData: InlineDataPart = {
    inlineData: {
      data: base64Data,
      mimeType: "application/pdf",
    },
  };
  cachedResume = inlineData;
  return inlineData;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message }: RequestBody = await request.json();
    const resumeData: InlineDataPart = await downloadResume(RESUME_URL);
    const result: string = (
      await model.generateContent([message, resumeData])
    ).response.text();

    const responseBody: AIResponseBody = { response: result };
    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const errorMessage: string =
      error instanceof Error ? error.message : "An unknown error occurred";
    const errorResponse: AIResponseBody = { error: errorMessage };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
