import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import type { SkillListItem, SkillDetail } from "codemie-sdk";
import { listSkills, getSkill } from "./services/skills.js";
import {
  getSdkClient,
  outputJson,
  handleSdkError,
} from "./utils/cli-utils.js";
import {
  printTable,
  printDetail,
  printEmpty,
  printListHeader,
  optional,
  type TableColumn,
  type DetailRow,
} from "./utils/render.js";

export function createSkillsSubcommand(): Command {
  const cmd = new Command("skills").description("Manage CodeMie skills");

  cmd
    .command("list")
    .description(
      "List skills accessible to the current user\n" +
        "Examples:\n" +
        "  $ codemie sdk skills list\n" +
        "  $ codemie sdk skills list --page 2 --per-page 25\n" +
        "  $ codemie sdk skills list --scope marketplace --json",
    )
    .option("--json", "Output in JSON format")
    .option("--page <n>", "Page number (starts at 0)", "0")
    .option("--per-page <n>", "Results per page (1-100)", "10")
    .option(
      "--scope <scope>",
      "Scope filter: 'marketplace', 'project', or 'project_with_marketplace'",
    )
    .action(async (opts) => {
      const client = await getSdkClient();
      const spinner = ora("Fetching skills...").start();

      try {
        const params: Record<string, unknown> = {
          page: parseInt(opts.page, 10),
          per_page: parseInt(opts.perPage, 10),
        };

        if (opts.scope) {
          params.scope = opts.scope;
        }

        const items = await listSkills(client, params);

        spinner.stop();

        if (opts.json) {
          outputJson(items);
          return;
        }

        if (items.length === 0) {
          printEmpty("skills");
          return;
        }

        printListHeader("Skills", items.length);

        const columns: TableColumn<SkillListItem>[] = [
          { header: "ID", width: 40, getValue: (s) => chalk.cyan(s.id) },
          { header: "Name", width: 30, getValue: (s) => s.name },
          { header: "Project", width: 20, getValue: (s) => optional(s.project) },
          {
            header: "Visibility",
            width: 12,
            getValue: (s) => s.visibility,
          },
        ];
        printTable(items, columns);
      } catch (error) {
        spinner.stop();
        handleSdkError(error, "list skills");
      }
    });

  cmd
    .command("get <id>")
    .description("Get detailed information about a specific skill")
    .option("--json", "Output in JSON format")
    .action(async (id: string, opts) => {
      const client = await getSdkClient();
      const spinner = ora("Fetching skill...").start();

      try {
        const item = await getSkill(client, id);
        spinner.stop();

        if (opts.json) {
          outputJson(item);
          return;
        }

        const rows: DetailRow[] = [
          { label: "ID", value: chalk.cyan(item.id) },
          { label: "Name", value: item.name },
          { label: "Project", value: optional(item.project) },
          { label: "Visibility", value: item.visibility },
          { label: "Description", value: optional(item.description) },
          {
            label: "Creator",
            value: optional(item.created_by?.name),
          },
          { label: "Created", value: item.created_date },
        ];

        if (item.updated_date) {
          rows.push({ label: "Updated", value: item.updated_date });
        }

        const detailItem = item as SkillDetail;
        if (detailItem.content) {
          rows.push({ label: "Content", value: detailItem.content });
        }

        printDetail(rows);
      } catch (error) {
        spinner.stop();
        handleSdkError(error, "get skill");
      }
    });

  return cmd;
}
