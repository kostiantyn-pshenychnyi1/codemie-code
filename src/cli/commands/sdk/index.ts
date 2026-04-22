import { Command } from 'commander';
import { createAssistantsSubcommand } from './assistants.js';
import { createWorkflowsSubcommand } from './workflows.js';
import { createDatasourcesSubcommand } from './datasources.js';
import { createIntegrationsSubcommand } from './integrations.js';
import { createLlmModelsSubcommand } from './llm.js';

export function createSdkCommand(): Command {
  const cmd = new Command('sdk');

  cmd.description(
    'Manage CodeMie platform assets (assistants, workflows, datasources, integrations) via the SDK'
  );

  cmd.addCommand(createAssistantsSubcommand());
  cmd.addCommand(createWorkflowsSubcommand());
  cmd.addCommand(createDatasourcesSubcommand());
  cmd.addCommand(createIntegrationsSubcommand());
  cmd.addCommand(createLlmModelsSubcommand());

  return cmd;
}
