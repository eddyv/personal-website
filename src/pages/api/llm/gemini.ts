import type { APIRoute } from "astro";
import { GoogleGenerativeAI, type InlineDataPart } from "@google/generative-ai";
import {
  GOOGLE_AI_MODEL_ID,
  GOOGLE_API_KEY,
  RESUME_CACHE_DURATION,
  RESUME_URL,
} from "astro:env/server";

interface RequestBody {
  message: string;
}

export interface AIResponseBody {
  response?: string;
  error?: string;
}

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
/**
 * System instructions for Edward Vaisman's AI personal assistant.
 * These instructions configure the AI to:
 * - Act as Edward's resume assistant
 * - Help secure roles matching his expertise
 * - Respond to visitor inquiries about his experience
 * - Reference his resume PDF for accurate information
 * - Maintain professional yet friendly communication
 * - Redirect users when information isn't available
 * - Highlight strengths and accomplishments
 * - Present qualifications effectively
 * - Ensure positive representation
 *
 * @constant {string}
 * @description Defines behavior parameters for Edward's AI resume assistant
 */
const systemInstructions = `As Edward Vaisman's personal assistant for his resume, your primary objective is to assist him in securing roles that align with his expertise and desired career path. Your responsibility involves responding to inquiries about his experience and expertise from visitors to his website. You will have access to his resume (PDF) to aid in formulating your responses.

When addressing questions, prioritize professionalism while maintaining a light-hearted demeanor. If a question cannot be answered using the information from his resume, politely inform the user that the details are not available in the resume and encourage them to reach out via email or LinkedIn for further information. 

Your responses should reflect a deep understanding of Edward's professional background and expertise, showcasing his strengths and accomplishments to potential employers. It's essential to convey his qualifications accurately and effectively to enhance his prospects in securing suitable employment opportunities. Make sure to always paint him in a positive light.`;

const model = genAI.getGenerativeModel({
  model: GOOGLE_AI_MODEL_ID,
  systemInstruction: systemInstructions,
});

let cachedResume: InlineDataPart | null = null;
let lastCached: number | null = null;

/**
 * Downloads and caches a resume from a given URL.
 * If a cached version exists and is within the cache duration, returns the cached version.
 * Otherwise, downloads the resume, converts it to base64, and caches it.
 *
 * @param url - The URL of the resume to download
 * @returns A Promise that resolves to an InlineDataPart containing the base64-encoded PDF
 * @throws {Error} If the fetch request fails
 */
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

/**
 * Handles POST requests for the Gemini LLM API endpoint.
 * This function processes incoming messages, downloads resume data, and generates AI responses.
 *
 * @param {Object} params - The route parameters
 * @param {Request} params.request - The incoming HTTP request object
 *
 * @returns {Promise<Response>} A Promise that resolves to:
 * - A 200 Response with AIResponseBody containing the generated content if successful
 * - A 500 Response with error details if an error occurs
 *
 * @throws Will convert any caught errors into a 500 Response
 *
 * @example
 * // Successful response format
 * {
 *   "response": "generated text content"
 * }
 *
 * // Error response format
 * {
 *   "error": "error message"
 * }
 */
export const POST: APIRoute = async ({
  request,
}: {
  request: Request;
}): Promise<Response> => {
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
