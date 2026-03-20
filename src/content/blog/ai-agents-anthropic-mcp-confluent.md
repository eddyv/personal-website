---
title: "Powering AI Agents with Real-Time Data Using Anthropic's MCP and Confluent"
date: 2025-03-25
preview: "Learn how we built an MCP server to give AI agents direct access to real-time data streaming with Confluent."
tags: ["ai", "mcp", "confluent", "kafka", "agents"]
draft: false
---

# Powering AI Agents with Real-Time Data Using Anthropic's MCP and Confluent

[Model Context Protocol](https://modelcontextprotocol.io/introduction) (MCP), introduced by Anthropic, is a new standard that simplifies artificial intelligence (AI) integrations by providing a secure, consistent way to connect AI agents with external tools and data sources.

When we saw MCP's potential, we immediately started exploring how we could bring real-time data streaming into the mix. With our long history of supporting open source and open standards, building an [MCP server](https://github.com/confluentinc/mcp-confluent) was a natural fit.

With this server, we achieved two big things:

1. **We gave AI agents direct access to fresh, real-time data**, ensuring that they always operate on the latest information.

2. **We made managing Confluent easier with natural language** so that users can configure topics, execute Flink SQL, and interact with their data infrastructure without wrestling with complex commands.

![Prompt to Executing a Tool With Confluent's MCP Server](/blog/ai-agents-anthropic-mcp/mcp-claude-ui.png)

This blog post dives into what we built, how it works, and why real-time data is essential for the future of AI agents.

Let's get into it.


## What Is Model Context Protocol?

Today, integrating AI systems with different platforms often requires custom-built solutions that are complex, time-consuming, and difficult to maintain. Developers frequently need to write bespoke code to pull data into AI agents, manually integrating APIs, databases, and external tools. Existing frameworks such as LangChain and LlamaIndex provide mechanisms for these integrations, but they often require one-off connectors for each system, creating fragile, hard-to-scale solutions.

MCP solves this by providing a universal standard that simplifies these connections. Instead of reinventing integrations for every tool or database, developers can use MCP as a **standardized bridge** between AI models and external data sources.

At its core, MCP standardizes how agents retrieve and interact with external data. It provides a structured way to facilitate these interactions for AI systems:

- Pull customer records from a database
- Retrieve documents from cloud storage
- Execute workflows based on real-time inputs

By establishing a common protocol, MCP eliminates much of the complexity and redundancy in building AI-powered workflows. This allows developers to focus on agent logic rather than the underlying integration challenges.

## How Does MCP Work?

MCP operates on a client-server architecture, where AI-powered applications (clients such as Claude Desktop) interact with MCP servers to access external data, tools, and structured prompts. This structured approach ensures that agents can retrieve real-time information, execute predefined actions, and maintain secure, consistent interactions with external systems.

![MCP client-server interactions](/blog/ai-agents-anthropic-mcp/mcp-client-interactions.png)

At a high level, MCP works by defining three key components within its servers:

- **Tools** -- Functions that AI agents can call to perform specific actions, such as making API requests or executing commands (e.g., querying a weather API).

- **Resources** -- Data sources that AI agents can access, similar to REST API endpoints. These provide structured data without performing additional computation.

- **Prompts** -- Predefined templates that guide AI models in optimally using tools and resources.

MCP servers act as data gateways, exposing these tools, resources, and prompts to AI applications through a standardized interface. Clients, typically AI-powered systems like assistants or automation tools, communicate with these servers using JSON-RPC 2.0, a lightweight messaging protocol that ensures secure, two-way communication.

In practice, an AI-powered client will:

1. **Connect to an MCP server** -- The client initiates a connection to discover available tools, resources, and prompts.

2. **Query or invoke tools/resources** -- Based on user input, the client requests data or executes predefined functions via the MCP server.

3. **Process and return responses** -- The AI agent processes the retrieved data, applies contextual reasoning, and delivers an appropriate response or action.

This structured approach reduces integration complexity, improves security and governance, and ensures that agents operate with accurate, up-to-date information.

## Bringing Real-Time Data to MCP With Confluent

At Confluent, we've spent years helping companies integrate real-time data into their systems, and MCP presents an opportunity to extend that to AI agents in a standardized way.

AI systems need access to both real-time and historical data to be effective. Confluent already provides [120+ pre-built connectors](https://www.confluent.io/product/confluent-connectors/), making it easy to stream data from databases, event systems, and software-as-service (SaaS) applications. By adding MCP support, we give agents direct access to these data sources without requiring one-off integrations.

This reduces the complexity of managing separate data pipelines and ensures that AI-driven workflows operate on the freshest available information.

## Confluent MCP Server Implementation

We built an [MCP server](https://github.com/confluentinc/mcp-confluent) that connects directly to Confluent, allowing agents to interact with real-time data using natural language.

![Prompt to Executing a Tool With Confluent’s MCP Server](/blog/ai-agents-anthropic-mcp/prompt-to-executing-tool.png)

Instead of manually configuring topics, writing Flink SQL, or managing connectors, users can issue commands in plain language, and the server will translate them into executable actions.

### What It Can Do

- Manage Kafka topics (create, delete, update)
- Produce and consume messages
- Execute Flink SQL queries
- Manage and configure connectors
- Tag and organize topics

The server makes it easier to connect your agents to data flowing through and helps automate configuration and management.

Check it out here: [https://github.com/confluentinc/mcp-confluent](https://github.com/confluentinc/mcp-confluent)

Each tool in the Confluent MCP server is defined with a name, description, and input parameters, allowing agents to interact with Confluent resources in a structured way.

The current implementation includes 20 built-in tools, and adding new functionality is straightforward: Just define a new tool with its schema and execution logic. This makes it easy to expand the system as new use cases arise.

## An Example Interaction With MCP and Confluent

With MCP, agents can interact with Confluent using natural language, removing the need for manual configurations.

To showcase this, we integrated the Confluent MCP server with [Goose](https://github.com/block/goose), an open source AI framework from Block. Goose is designed as an on-machine AI agent that helps developers automate complex tasks. Like the Claude Desktop client, it natively supports MCP, making it easy to connect with external systems.

Here's a walk-through of how the Goose Client interacts with Confluent through our MCP server.

### 1. Listing All Apache Kafka Topics

**User:** *List all the Kafka topics.*

![List topics](/blog/ai-agents-anthropic-mcp/list-topics.png)

### 2. Saving a Conversation to Apache Kafka

**User:** *Can you save our conversation history?*

![Save Conversations](/blog/ai-agents-anthropic-mcp/save-convo.png)

Conversation history has been saved to the "claude-conversations" topic.

![Confluent Cloud Conversations](/blog/ai-agents-anthropic-mcp/cc-conversations.png)

### 3. Retrieving Sample Data From Available Topics

**User:** *Help me sample some data from "cool" and "hello" topics.*

![Retrieve Data](/blog/ai-agents-anthropic-mcp/retrieve-data.png)

### 4. Tagging Topics Containing PII

**User:** *Let's create a tag called PII (personally identifiable information). Analyze the topics we've just created and tag them accordingly if they contain PII.*

![Tag Topics](/blog/ai-agents-anthropic-mcp/tag-topics.gif)


### 5. Changing Retention Time for PII Topics

**User:** *Let's change the retention time for topics marked with PII to "1 day."*

These examples show how MCP simplifies interactions with Confluent by allowing natural language-driven data operations. Instead of writing CLI commands or API calls, users can manage Kafka topics, inspect data, and enforce policies with English.

![Change Retention](/blog/ai-agents-anthropic-mcp/change-retention.gif)


## Adding a New Tool

Each tool in the Confluent MCP server is defined with a name, description, and input parameters, allowing agents to interact with Confluent resources in a structured way. If you wish to add new functionality that is unsupported, you can do this in three simple steps:

**1.** Incorporate a new value into the `ToolName` enum.

```typescript
// tool-name.ts
export enum ToolName {
  CREATE_TOPICS = "create-topics",
  // existing tool names
}
```

**2.** Incorporate the new tool into the handlers map within the `ToolFactory` class by associating it with the class handler that will be created. For this instance, we will be developing a class named `CreateTopicsHandler`.

```typescript
// tool-factory.ts
export class ToolFactory {
  private static handlers: Map<ToolName, ToolHandler> = new Map([
    [ToolName.CREATE_TOPICS, new CreateTopicsHandler()],
    // existing tool handlers
  ]);
}
```

**3.** Develop a class that extends the `BaseToolHandler` abstract class. This requires the implementation of two methods:

- `getToolConfig`: This defines the tool and its appearance to MCP clients.
- `handle`: This method is called when the tool is invoked.

```typescript
// create-topics-handler.ts
export class CreateTopicsHandler extends BaseToolHandler {
  async handle(
    clientManager: ClientManager,
    toolArguments: Record<string, unknown>,
  ): Promise<CallToolResult> {
    const { topicNames } = createTopicArgs.parse(toolArguments);
    const success = await (
      await clientManager.getAdminClient()
    ).createTopics({
      topics: topicNames.map((name) => ({ topic: name })),
    });
    if (!success) {
      return this.createResponse(
        `Failed to create Kafka topics: ${topicNames.join(",")}`,
        true,
      );
    }
    return this.createResponse(
      `Created Kafka topics: ${topicNames.join(",")}`
    );
  }

  getToolConfig(): ToolConfig {
    return {
      name: ToolName.CREATE_TOPICS,
      description: "Create new topic(s) in the Kafka cluster.",
      inputSchema: createTopicArgs.shape,
    };
  }
}
```

By following these steps, you can easily add new tools to the MCP server, allowing AI agents to interact more effectively with Confluent resources. This flexibility ensures that the server can adapt to evolving requirements and support a growing range of use cases, making it a valuable asset for organizations looking to integrate AI with real-time data.

## Powering Agents With Real-time Data

AI agents are only as good as the data they have access to.

If they're making decisions based on stale, outdated information, their insights quickly lose relevance. To be effective, agents need real-time access to data across disparate systems, ensuring that they're always working with the most up-to-date context.

That's where MCP and our Confluent MCP server come in.

By providing a standardized way for agents to connect to real-time data streams, structured datasets, and external tools, we eliminate the need for custom, one-off integrations. Agents can retrieve live data, execute actions, and make decisions based on the latest available information, without developers having to write bespoke code for every data source.

### Bridging Real-Time and Stored Data

With [Tableflow](https://www.confluent.io/product/tableflow/), we can take this even further by **unifying real-time and stored data**.

Agents can:

- Perform federated search across vector stores, databases, and data lakes
- Access both historical datasets and live streaming data from a single interface
- Query Apache Iceberg and Delta Tables alongside event streams, ensuring seamless access to structured and semi-structured data

This means AI agents are no longer limited to a snapshot of the past. Instead they can react to live events, correlate them with stored knowledge, and deliver timely, informed insights.

### No Custom Integration Required

Because Confluent already provides 120+ pre-built connectors, AI agents can interconnect with enterprise systems, SaaS platforms, databases, and event streams without additional development effort. The MCP server abstracts away the complexity, making all this data immediately accessible through a common interface.

With this approach, developers don't need to build and maintain fragile, custom pipelines. Instead they can focus on designing intelligent agents.

## Wrapping Up

If you're building AI-driven applications and want to see how MCP can simplify your workflows, try out our MCP server and let us know what you think.

Check it out on [GitHub](https://github.com/confluentinc/mcp-confluent), experiment with it, and share your feedback. We'd love to hear from you!

---

*Originally published on the [Confluent Blog](https://www.confluent.io/blog/ai-agents-using-anthropic-mcp/). Co-authored with [Sean Falconer](https://www.confluent.io/blog/author/sean-falconer/).*
