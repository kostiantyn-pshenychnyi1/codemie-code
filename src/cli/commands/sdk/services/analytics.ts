import type {
  CodeMieClient,
  SummariesResponse,
  TabularResponse,
  UsersListResponse,
} from "codemie-sdk";
import type {
  AnalyticsQueryParams,
  PaginatedAnalyticsQueryParams,
} from "codemie-sdk";

export async function getAnalyticsSummaries(
  client: CodeMieClient,
  params: AnalyticsQueryParams = {},
): Promise<SummariesResponse> {
  return client.analytics.getSummaries(params);
}

export async function getAnalyticsCliSummary(
  client: CodeMieClient,
  params: AnalyticsQueryParams = {},
): Promise<SummariesResponse> {
  return client.analytics.getCliSummary(params);
}

export async function getAnalyticsUsers(
  client: CodeMieClient,
  params: AnalyticsQueryParams = {},
): Promise<UsersListResponse> {
  return client.analytics.getUsers(params);
}

export async function getAnalyticsAssistantsChats(
  client: CodeMieClient,
  params: PaginatedAnalyticsQueryParams = {},
): Promise<TabularResponse> {
  return client.analytics.getAssistantsChats(params);
}

export async function getAnalyticsWorkflows(
  client: CodeMieClient,
  params: PaginatedAnalyticsQueryParams = {},
): Promise<TabularResponse> {
  return client.analytics.getWorkflows(params);
}

export async function getAnalyticsToolsUsage(
  client: CodeMieClient,
  params: PaginatedAnalyticsQueryParams = {},
): Promise<TabularResponse> {
  return client.analytics.getToolsUsage(params);
}

export async function getAnalyticsWebhooksInvocation(
  client: CodeMieClient,
  params: PaginatedAnalyticsQueryParams = {},
): Promise<TabularResponse> {
  return client.analytics.getWebhooksInvocation(params);
}

export async function getAnalyticsMcpServers(
  client: CodeMieClient,
  params: PaginatedAnalyticsQueryParams = {},
): Promise<TabularResponse> {
  return client.analytics.getMcpServers(params);
}

export async function getAnalyticsMcpServersByUsers(
  client: CodeMieClient,
  params: PaginatedAnalyticsQueryParams = {},
): Promise<TabularResponse> {
  return client.analytics.getMcpServersByUsers(params);
}

export async function getAnalyticsProjectsSpending(
  client: CodeMieClient,
  params: PaginatedAnalyticsQueryParams = {},
): Promise<TabularResponse> {
  return client.analytics.getProjectsSpending(params);
}

export async function getAnalyticsLlmsUsage(
  client: CodeMieClient,
  params: PaginatedAnalyticsQueryParams = {},
): Promise<TabularResponse> {
  return client.analytics.getLlmsUsage(params);
}

export async function getAnalyticsUsersSpending(
  client: CodeMieClient,
  params: PaginatedAnalyticsQueryParams = {},
): Promise<TabularResponse> {
  return client.analytics.getUsersSpending(params);
}

export async function getAnalyticsBudgetSoftLimit(
  client: CodeMieClient,
  params: PaginatedAnalyticsQueryParams = {},
): Promise<TabularResponse> {
  return client.analytics.getBudgetSoftLimit(params);
}

export async function getAnalyticsBudgetHardLimit(
  client: CodeMieClient,
  params: PaginatedAnalyticsQueryParams = {},
): Promise<TabularResponse> {
  return client.analytics.getBudgetHardLimit(params);
}

export async function getAnalyticsUsersActivity(
  client: CodeMieClient,
  params: PaginatedAnalyticsQueryParams = {},
): Promise<TabularResponse> {
  return client.analytics.getUsersActivity(params);
}

export async function getAnalyticsProjectsActivity(
  client: CodeMieClient,
  params: PaginatedAnalyticsQueryParams = {},
): Promise<TabularResponse> {
  return client.analytics.getProjectsActivity(params);
}

export async function getAnalyticsAgentsUsage(
  client: CodeMieClient,
  params: PaginatedAnalyticsQueryParams = {},
): Promise<TabularResponse> {
  return client.analytics.getAgentsUsage(params);
}

export async function getAnalyticsCliAgents(
  client: CodeMieClient,
  params: PaginatedAnalyticsQueryParams = {},
): Promise<TabularResponse> {
  return client.analytics.getCliAgents(params);
}

export async function getAnalyticsCliLlms(
  client: CodeMieClient,
  params: PaginatedAnalyticsQueryParams = {},
): Promise<TabularResponse> {
  return client.analytics.getCliLlms(params);
}

export async function getAnalyticsCliUsers(
  client: CodeMieClient,
  params: PaginatedAnalyticsQueryParams = {},
): Promise<TabularResponse> {
  return client.analytics.getCliUsers(params);
}

export async function getAnalyticsCliErrors(
  client: CodeMieClient,
  params: PaginatedAnalyticsQueryParams = {},
): Promise<TabularResponse> {
  return client.analytics.getCliErrors(params);
}

export async function getAnalyticsCliRepositories(
  client: CodeMieClient,
  params: PaginatedAnalyticsQueryParams = {},
): Promise<TabularResponse> {
  return client.analytics.getCliRepositories(params);
}
