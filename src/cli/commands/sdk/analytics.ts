import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import type {
  SummariesResponse,
  TabularResponse,
  UsersListResponse,
} from "codemie-sdk";
import type {
  AnalyticsQueryParams,
  PaginatedAnalyticsQueryParams,
} from "codemie-sdk";
import {
  getAnalyticsSummaries,
  getAnalyticsCliSummary,
  getAnalyticsUsers,
  getAnalyticsAssistantsChats,
  getAnalyticsWorkflows,
  getAnalyticsToolsUsage,
  getAnalyticsWebhooksInvocation,
  getAnalyticsMcpServers,
  getAnalyticsMcpServersByUsers,
  getAnalyticsProjectsSpending,
  getAnalyticsLlmsUsage,
  getAnalyticsUsersSpending,
  getAnalyticsBudgetSoftLimit,
  getAnalyticsBudgetHardLimit,
  getAnalyticsUsersActivity,
  getAnalyticsProjectsActivity,
  getAnalyticsAgentsUsage,
  getAnalyticsCliAgents,
  getAnalyticsCliLlms,
  getAnalyticsCliUsers,
  getAnalyticsCliErrors,
  getAnalyticsCliRepositories,
} from "./services/analytics.js";
import { getSdkClient, outputJson, handleSdkError } from "./utils/cli-utils.js";
import {
  printTable,
  printListHeader,
  printEmpty,
  optional,
  type TableColumn,
} from "./utils/render.js";

/**
 * Build base analytics query params from command options
 */
function buildBaseParams(opts: {
  timePeriod?: string;
  startDate?: string;
  endDate?: string;
  users?: string;
  projects?: string;
}): AnalyticsQueryParams {
  return {
    ...(opts.timePeriod !== undefined && { time_period: opts.timePeriod }),
    ...(opts.startDate !== undefined && { start_date: opts.startDate }),
    ...(opts.endDate !== undefined && { end_date: opts.endDate }),
    ...(opts.users !== undefined && { users: opts.users }),
    ...(opts.projects !== undefined && { projects: opts.projects }),
  };
}

/**
 * Build paginated analytics query params from command options
 */
function buildPaginatedParams(opts: {
  timePeriod?: string;
  startDate?: string;
  endDate?: string;
  users?: string;
  projects?: string;
  page?: number;
  perPage?: number;
}): PaginatedAnalyticsQueryParams {
  return {
    ...buildBaseParams(opts),
    ...(opts.page !== undefined && { page: opts.page }),
    ...(opts.perPage !== undefined && { per_page: opts.perPage }),
  };
}

/**
 * Add common date filter options to a command
 */
function addBaseFilterOptions(cmd: Command): Command {
  return cmd
    .option(
      "--time-period <period>",
      "Time period filter (e.g. last_7_days, last_30_days)",
    )
    .option("--start-date <date>", "Start date (ISO 8601, e.g. 2024-01-01)")
    .option("--end-date <date>", "End date (ISO 8601, e.g. 2024-12-31)")
    .option("--users <users>", "Filter by user(s)")
    .option("--projects <projects>", "Filter by projects (comma-separated)");
}

/**
 * Add pagination options in addition to base filters
 */
function addPaginatedFilterOptions(cmd: Command): Command {
  return addBaseFilterOptions(cmd)
    .option("--page <n>", "Page number (0-indexed)", (v) => parseInt(v, 10))
    .option("--per-page <n>", "Items per page", (v) => parseInt(v, 10));
}

/**
 * Print a SummariesResponse as a table or JSON
 */
function printSummaries(response: SummariesResponse, json: boolean): void {
  if (json) {
    outputJson(response);
    return;
  }

  const metrics = response.data?.metrics ?? [];
  if (metrics.length === 0) {
    printEmpty("metrics");
    return;
  }

  const columns: TableColumn<(typeof metrics)[0]>[] = [
    { header: "ID", width: 30, getValue: (m) => chalk.cyan(m.id) },
    { header: "Label", width: 30, getValue: (m) => optional(m.label) },
    { header: "Type", width: 14, getValue: (m) => optional(m.type) },
    {
      header: "Value",
      width: 24,
      getValue: (m) => String(m.value ?? chalk.dim("—")),
    },
  ];

  printListHeader("Metrics", metrics.length);
  printTable(metrics, columns);
}

/**
 * Print a TabularResponse as a table or JSON
 */
function printTabular(response: TabularResponse, json: boolean): void {
  if (json) {
    outputJson(response);
    return;
  }

  const rows = response.data?.rows ?? [];
  const columns = response.data?.columns ?? [];

  if (rows.length === 0) {
    printEmpty("records");
    return;
  }

  const tableColumns: TableColumn<Record<string, unknown>>[] = columns.map(
    (col) => ({
      header: col.label,
      width: Math.max(col.label.length + 4, 18),
      getValue: (row) => {
        const val = row[col.id];
        return val != null ? String(val) : chalk.dim("—");
      },
    }),
  );

  printListHeader("Records", rows.length);
  printTable(rows, tableColumns);

  const pagination = response.pagination;
  if (pagination) {
    console.log(
      chalk.dim(
        `\n  Page ${pagination.page + 1} · ${rows.length} of ${pagination.total_count} total` +
          (pagination.has_more ? " · more available" : ""),
      ),
    );
  }
}

/**
 * Print a UsersListResponse as a table or JSON
 */
function printUsersList(response: UsersListResponse, json: boolean): void {
  if (json) {
    outputJson(response);
    return;
  }

  const users = response.data?.users ?? [];
  if (users.length === 0) {
    printEmpty("users");
    return;
  }

  const columns: TableColumn<(typeof users)[0]>[] = [
    { header: "ID", width: 40, getValue: (u) => chalk.cyan(u.id) },
    { header: "Name", width: 40, getValue: (u) => optional(u.name) },
  ];

  printListHeader("Users", users.length);
  printTable(users, columns);
  console.log(chalk.dim(`\n  Total: ${response.data.total_count}`));
}

export function createAnalyticsSubcommand(): Command {
  const cmd = new Command("analytics").description(
    "Access CodeMie platform analytics and usage data",
  );

  addBaseFilterOptions(
    cmd
      .command("summaries")
      .description(
        "Get platform usage summaries\n" +
          "Examples:\n" +
          "  $ codemie sdk analytics summaries\n" +
          "  $ codemie sdk analytics summaries --time-period last_30_days --json",
      )
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching summaries...").start();
    try {
      const result = await getAnalyticsSummaries(client, buildBaseParams(opts));
      spinner.stop();
      printSummaries(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get summaries");
    }
  });

  addBaseFilterOptions(
    cmd
      .command("cli-summary")
      .description("Get CLI usage summary")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching CLI summary...").start();
    try {
      const result = await getAnalyticsCliSummary(
        client,
        buildBaseParams(opts),
      );
      spinner.stop();
      printSummaries(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get CLI summary");
    }
  });

  addBaseFilterOptions(
    cmd
      .command("users")
      .description("List users")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching users...").start();
    try {
      const result = await getAnalyticsUsers(client, buildBaseParams(opts));
      spinner.stop();
      printUsersList(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get analytics users");
    }
  });

  addPaginatedFilterOptions(
    cmd
      .command("assistants-chats")
      .description("Get assistant chat analytics")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching assistant chats analytics...").start();
    try {
      const result = await getAnalyticsAssistantsChats(
        client,
        buildPaginatedParams(opts),
      );
      spinner.stop();
      printTabular(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get assistants chats analytics");
    }
  });

  addPaginatedFilterOptions(
    cmd
      .command("workflows")
      .description("Get workflow analytics")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching workflows analytics...").start();
    try {
      const result = await getAnalyticsWorkflows(
        client,
        buildPaginatedParams(opts),
      );
      spinner.stop();
      printTabular(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get workflows analytics");
    }
  });

  addPaginatedFilterOptions(
    cmd
      .command("tools-usage")
      .description("Get tools usage analytics")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching tools usage analytics...").start();
    try {
      const result = await getAnalyticsToolsUsage(
        client,
        buildPaginatedParams(opts),
      );
      spinner.stop();
      printTabular(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get tools usage analytics");
    }
  });

  addPaginatedFilterOptions(
    cmd
      .command("webhooks-invocation")
      .description("Get webhooks invocation analytics")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching webhooks invocation analytics...").start();
    try {
      const result = await getAnalyticsWebhooksInvocation(
        client,
        buildPaginatedParams(opts),
      );
      spinner.stop();
      printTabular(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get webhooks invocation analytics");
    }
  });

  addPaginatedFilterOptions(
    cmd
      .command("mcp-servers")
      .description("Get MCP servers analytics")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching MCP servers analytics...").start();
    try {
      const result = await getAnalyticsMcpServers(
        client,
        buildPaginatedParams(opts),
      );
      spinner.stop();
      printTabular(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get MCP servers analytics");
    }
  });

  addPaginatedFilterOptions(
    cmd
      .command("mcp-servers-by-users")
      .description("Get MCP servers by users analytics")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching MCP servers by users analytics...").start();
    try {
      const result = await getAnalyticsMcpServersByUsers(
        client,
        buildPaginatedParams(opts),
      );
      spinner.stop();
      printTabular(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get MCP servers by users analytics");
    }
  });

  addPaginatedFilterOptions(
    cmd
      .command("projects-spending")
      .description("Get projects spending analytics")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching projects spending analytics...").start();
    try {
      const result = await getAnalyticsProjectsSpending(
        client,
        buildPaginatedParams(opts),
      );
      spinner.stop();
      printTabular(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get projects spending analytics");
    }
  });

  addPaginatedFilterOptions(
    cmd
      .command("llms-usage")
      .description("Get LLMs usage analytics")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching LLMs usage analytics...").start();
    try {
      const result = await getAnalyticsLlmsUsage(
        client,
        buildPaginatedParams(opts),
      );
      spinner.stop();
      printTabular(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get LLMs usage analytics");
    }
  });

  addPaginatedFilterOptions(
    cmd
      .command("users-spending")
      .description("Get users spending analytics")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching users spending analytics...").start();
    try {
      const result = await getAnalyticsUsersSpending(
        client,
        buildPaginatedParams(opts),
      );
      spinner.stop();
      printTabular(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get users spending analytics");
    }
  });

  addPaginatedFilterOptions(
    cmd
      .command("budget-soft-limit")
      .description("Get budget soft limit analytics")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching budget soft limit analytics...").start();
    try {
      const result = await getAnalyticsBudgetSoftLimit(
        client,
        buildPaginatedParams(opts),
      );
      spinner.stop();
      printTabular(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get budget soft limit analytics");
    }
  });

  addPaginatedFilterOptions(
    cmd
      .command("budget-hard-limit")
      .description("Get budget hard limit analytics")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching budget hard limit analytics...").start();
    try {
      const result = await getAnalyticsBudgetHardLimit(
        client,
        buildPaginatedParams(opts),
      );
      spinner.stop();
      printTabular(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get budget hard limit analytics");
    }
  });

  addPaginatedFilterOptions(
    cmd
      .command("users-activity")
      .description("Get users activity analytics")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching users activity analytics...").start();
    try {
      const result = await getAnalyticsUsersActivity(
        client,
        buildPaginatedParams(opts),
      );
      spinner.stop();
      printTabular(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get users activity analytics");
    }
  });

  addPaginatedFilterOptions(
    cmd
      .command("projects-activity")
      .description("Get projects activity analytics")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching projects activity analytics...").start();
    try {
      const result = await getAnalyticsProjectsActivity(
        client,
        buildPaginatedParams(opts),
      );
      spinner.stop();
      printTabular(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get projects activity analytics");
    }
  });

  addPaginatedFilterOptions(
    cmd
      .command("agents-usage")
      .description("Get agents usage analytics")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching agents usage analytics...").start();
    try {
      const result = await getAnalyticsAgentsUsage(
        client,
        buildPaginatedParams(opts),
      );
      spinner.stop();
      printTabular(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get agents usage analytics");
    }
  });

  addPaginatedFilterOptions(
    cmd
      .command("cli-agents")
      .description("Get CLI agents analytics")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching CLI agents analytics...").start();
    try {
      const result = await getAnalyticsCliAgents(
        client,
        buildPaginatedParams(opts),
      );
      spinner.stop();
      printTabular(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get CLI agents analytics");
    }
  });

  addPaginatedFilterOptions(
    cmd
      .command("cli-llms")
      .description("Get CLI LLMs analytics")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching CLI LLMs analytics...").start();
    try {
      const result = await getAnalyticsCliLlms(
        client,
        buildPaginatedParams(opts),
      );
      spinner.stop();
      printTabular(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get CLI LLMs analytics");
    }
  });

  addPaginatedFilterOptions(
    cmd
      .command("cli-users")
      .description("Get CLI users analytics")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching CLI users analytics...").start();
    try {
      const result = await getAnalyticsCliUsers(
        client,
        buildPaginatedParams(opts),
      );
      spinner.stop();
      printTabular(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get CLI users analytics");
    }
  });

  addPaginatedFilterOptions(
    cmd
      .command("cli-errors")
      .description("Get CLI errors analytics")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching CLI errors analytics...").start();
    try {
      const result = await getAnalyticsCliErrors(
        client,
        buildPaginatedParams(opts),
      );
      spinner.stop();
      printTabular(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get CLI errors analytics");
    }
  });

  addPaginatedFilterOptions(
    cmd
      .command("cli-repositories")
      .description("Get CLI repositories analytics")
      .option("--json", "Output in JSON format"),
  ).action(async (opts) => {
    const client = await getSdkClient();
    const spinner = ora("Fetching CLI repositories analytics...").start();
    try {
      const result = await getAnalyticsCliRepositories(
        client,
        buildPaginatedParams(opts),
      );
      spinner.stop();
      printTabular(result, opts.json);
    } catch (error) {
      spinner.stop();
      handleSdkError(error, "get CLI repositories analytics");
    }
  });

  return cmd;
}
