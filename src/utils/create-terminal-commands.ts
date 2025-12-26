import type { AIResponseBody } from "@pages/api/llm/gemini";
import { generateClientId } from "@utils/generate-client-id";

export type CommandOutput = string | React.ReactNode;

export interface Command {
  description: string;
  argsHint?: string[];
  helpText?: string;
  handle: (args?: string[]) => CommandOutput;
}

export interface CommandFactoryOptions {
  setHistory: (history: CommandOutput[]) => void;
}

const personalInfo = `Hi! I'm Edward Vaisman 👋
Role: Software Developer
Location: 🍁 Toronto, ON

Want to get in touch?
Email: vaismanedward@gmail.com
Github: https://github.com/eddyv`;

/**
 * Generates a help message for the terminal interface.
 * If a specific command is provided, it returns detailed help for that command.
 * Otherwise, it returns a general help message listing all available commands.
 *
 * @param commands - An object mapping command strings to Command objects
 * @param command - Optional command string to get specific help for (with or without leading slash)
 * @returns A formatted help message string
 *
 */
const generateHelpMessage = (
  commands: Record<string, Command>,
  command?: string
): string => {
  if (command) {
    const cmdKey = command.startsWith("/") ? command : `/${command}`;
    if (commands[cmdKey]) {
      const cmd = commands[cmdKey];
      return `${cmdKey} - ${cmd.description}\n\n${cmd.helpText || "No detailed help available."}`;
    }
    return `Command not found: ${command}. Type '/help' for available commands.`;
  }

  return `Edward's Terminal Interface (v1.0.0)

Usage: <command> [...args]

Commands:
${Object.entries(commands)
  .map(([cmd, { description }]) => `  ${cmd.padEnd(12)} ${description}`)
  .join("\n")}

Type "/help <command>" for more information about a specific command.`;
};

/**
 * Creates and returns a record of terminal commands with their respective handlers and metadata.
 *
 * @param options - The command factory options
 * @param options.setHistory - A function to update the terminal history
 *
 * @returns A record object where keys are command strings (e.g., "/help") and values are Command objects
 * containing the following properties:
 * - description: A brief description of what the command does
 * - argsHint?: Optional array of argument suggestions
 * - helpText: Detailed usage instructions for the command
 * - handle: Function that executes the command logic
 *
 * Available commands:
 * - /help: Shows available commands and their descriptions
 * - /clear: Clears the terminal screen
 * - /ai: Interacts with an LLM to answer questions about the author
 * - /whoami: Displays information about Edward Vaisman
 */
export const createTerminalCommands = ({
  setHistory,
}: CommandFactoryOptions): Record<string, Command> => {
  const commands: Record<string, Command> = {
    "/help": {
      description: "Show all available commands and their descriptions",
      argsHint: ["help", "whoami", "ai", "clear"],
      helpText: `Display information about available commands.
Usage: /help [command]
Example: /help whoami
Note: The leading slash is optional when specifying a command.`,
      handle: (args?: string[]) => generateHelpMessage(commands, args?.[0]),
    },
    "/clear": {
      description: "Clear the terminal screen",
      helpText: `Clear all terminal history and output.
Usage: /clear`,
      handle: () => {
        setHistory([]);
        return "";
      },
    },
    "/ai": {
      argsHint: [
        "Type your question....",
        "Where are you based?",
        "What's your role?",
        "What are your skills?",
        "What's your area of expertise?",
      ],
      description:
        "Ask an llm questions about me! It's been fed my resume and can answer questions about it.",
      helpText: `Usage: /ai [question]
Example: /ai What are your technical skills?`,
      handle: async (args?: string[]) => {
        try {
          // Check if a question was provided
          if (!args || args.length === 0) {
            return "Please provide a question. Usage: /ai [question]";
          }

          const question = args.join(" ");
          const clientId = generateClientId();
          const response = await fetch("/api/llm/gemini", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Client-Id": clientId,
            },
            body: JSON.stringify({ message: question }),
          });

          const data: AIResponseBody = await response.json();

          if (data.error) {
            return `Error: ${data.error}`;
          }

          // Extract the text content from the result
          const text = data.response;
          if (!text) {
            return "Sorry, I couldn't generate a response.";
          }

          return text;
        } catch (error) {
          console.error(
            "An error occurred while processing the request:",
            error
          );
          return "Sorry, there was an error processing your request.";
        }
      },
    },
    "/whoami": {
      description: "Display information about Edward Vaisman",
      helpText: "Usage: /whoami",
      handle: () => personalInfo,
    },
  };

  return commands;
};
