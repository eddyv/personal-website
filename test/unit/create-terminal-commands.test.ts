// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTerminalCommands } from "../../src/utils/create-terminal-commands";

describe("createTerminalCommands", () => {
  const setHistory = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("registers the four commands", () => {
    const commands = createTerminalCommands({ setHistory });
    expect(Object.keys(commands).sort()).toEqual([
      "/ai",
      "/clear",
      "/help",
      "/whoami",
    ]);
  });

  it("lists every command in the help output", () => {
    const commands = createTerminalCommands({ setHistory });
    const help = commands["/help"].handle() as string;

    for (const name of ["/help", "/clear", "/ai", "/whoami"]) {
      expect(help).toContain(name);
    }
  });

  it("shows detailed help for a specific command", () => {
    const commands = createTerminalCommands({ setHistory });
    const help = commands["/help"].handle(["whoami"]) as string;
    expect(help).toContain("/whoami - Display information about Edward");
  });

  it("reports unknown commands in help", () => {
    const commands = createTerminalCommands({ setHistory });
    const help = commands["/help"].handle(["bogus"]) as string;
    expect(help).toContain("Command not found: bogus");
  });

  it("clears history via /clear", () => {
    const commands = createTerminalCommands({ setHistory });
    const output = commands["/clear"].handle();
    expect(setHistory).toHaveBeenCalledWith([]);
    expect(output).toBe("");
  });

  it("describes Edward via /whoami", () => {
    const commands = createTerminalCommands({ setHistory });
    const output = commands["/whoami"].handle() as string;
    expect(output).toContain("Edward Vaisman");
    expect(output).toContain("vaismanedward@gmail.com");
  });

  it("requires a question for /ai", async () => {
    const commands = createTerminalCommands({ setHistory });
    const output = await commands["/ai"].handle([]);
    expect(output).toContain("Please provide a question");
  });

  it("returns the LLM response for /ai", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(Response.json({ response: "I am an answer" }))
      )
    );

    const commands = createTerminalCommands({ setHistory });
    const output = await commands["/ai"].handle(["hello", "there"]);
    expect(output).toBe("I am an answer");

    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/llm/gemini");
    expect(JSON.parse(init.body as string)).toEqual({
      message: "hello there",
    });
  });

  it("surfaces API errors for /ai", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(Response.json({ error: "nope" })))
    );

    const commands = createTerminalCommands({ setHistory });
    const output = await commands["/ai"].handle(["hello"]);
    expect(output).toBe("Error: nope");
  });

  it("falls back gracefully when fetch rejects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("network down")))
    );

    const commands = createTerminalCommands({ setHistory });
    const output = await commands["/ai"].handle(["hello"]);
    expect(output).toBe("Sorry, there was an error processing your request.");
  });
});
