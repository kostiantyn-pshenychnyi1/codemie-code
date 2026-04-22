import type {
  CodeMieClient,
  ConfluenceDataSourceCreateParams,
  ConfluenceDataSourceUpdateParams,
  DataSource,
  DataSourceListParams,
  FileDataSourceCreateParams,
  FileDataSourceUpdateDto,
  GoogleDataSourceCreateParams,
  JiraDataSourceCreateParams,
  JiraDataSourceUpdateParams,
  OtherDataSourceCreateParams,
  OtherDataSourceUpdateParams,
} from "codemie-sdk";
import { readFilesFromPaths } from "../utils/file-utils.js";

export async function listDatasources(
  client: CodeMieClient,
  params?: DataSourceListParams,
): Promise<DataSource[]> {
  return client.datasources.list(params);
}

export async function getDatasource(
  client: CodeMieClient,
  datasourceId: string,
): Promise<DataSource> {
  return client.datasources.get(datasourceId);
}

// CONFLUENCE
export async function createConfluenceDatasource(
  client: CodeMieClient,
  data: ConfluenceDataSourceCreateParams,
): Promise<unknown> {
  const params: ConfluenceDataSourceCreateParams = {
    type: "knowledge_base_confluence",
    cql: data.cql,
    description: data.description,
    name: data.name,
    project_name: data.project_name,
    setting_id: data.setting_id,
    shared_with_project: data.shared_with_project,
  };

  return client.datasources.create(params);
}

export async function updateConfluenceDatasource(
  client: CodeMieClient,
  id: string,
  data: Partial<ConfluenceDataSourceUpdateParams>,
): Promise<unknown> {
  const existing = await client.datasources.get(id);

  const params: ConfluenceDataSourceUpdateParams = {
    type: "knowledge_base_confluence",
    cql: data.cql,
    description: data.description,
    name: existing.name,
    project_name: data.project_name ?? existing.project_name,
    setting_id: data.setting_id,
    shared_with_project: data.shared_with_project,
  };

  return client.datasources.update(params);
}

// JIRA
export async function createJiraDatasource(
  client: CodeMieClient,
  data: JiraDataSourceCreateParams,
): Promise<unknown> {
  const params: JiraDataSourceCreateParams = {
    ...data,
    type: "knowledge_base_jira",
    name: data.name,
    description: data.description,
    jql: data.jql,
    project_name: data.project_name,
    setting_id: data.setting_id,
    shared_with_project: data.shared_with_project,
  };

  return client.datasources.create(params);
}

export async function updateJiraDatasource(
  client: CodeMieClient,
  id: string,
  data: Partial<JiraDataSourceUpdateParams>,
): Promise<unknown> {
  const existing = await client.datasources.get(id);

  const params: JiraDataSourceUpdateParams = {
    type: "knowledge_base_jira",
    name: existing.name,
    project_name: data.project_name ?? existing.project_name,
    description: data.description ?? existing.description,
    jql: data.jql ?? existing.jira?.jql,
    setting_id: data.setting_id ?? existing.setting_id,
    shared_with_project:
      data.shared_with_project ?? existing.shared_with_project,
  };

  return client.datasources.update(params);
}

// FILE
export async function createFileDatasource(
  client: CodeMieClient,
  data: FileDataSourceCreateParams,
  filePaths: string[],
): Promise<unknown> {
  if (!filePaths || !Array.isArray(filePaths)) {
    throw new Error("files array is required for file datasources");
  }

  const files = await readFilesFromPaths(filePaths);

  return client.datasources.create({
    ...data,
    type: "knowledge_base_file",
    files,
  });
}

export async function updateFileDatasource(
  client: CodeMieClient,
  id: string,
  data: Partial<FileDataSourceUpdateDto>,
): Promise<unknown> {
  const existing = await client.datasources.get(id);

  const updateParams: FileDataSourceUpdateDto = {
    type: "knowledge_base_file",
    name: existing.name,
    project_name: existing.project_name,
    ...data,
  };

  return client.datasources.update(updateParams);
}

// CODE
export async function createCodeDatasource(
  client: CodeMieClient,
  data: any,
): Promise<unknown> {
  return client.datasources.create({
    ...data,
    type: "code",
  });
}

export async function updateCodeDatasource(
  client: CodeMieClient,
  id: string,
  data: any,
): Promise<unknown> {
  const existing = await client.datasources.get(id);
  return client.datasources.update({
    id,
    type: "code",
    name: existing.name,
    project_name: existing.project_name,
    ...data,
  });
}

// GOOGLE
export async function createGoogleDatasource(
  client: CodeMieClient,
  data: GoogleDataSourceCreateParams,
): Promise<unknown> {
  return client.datasources.create({
    ...data,
    type: "llm_routing_google",
  });
}

export async function updateGoogleDatasource(
  client: CodeMieClient,
  id: string,
  data: any,
): Promise<unknown> {
  const existing = await client.datasources.get(id);
  return client.datasources.update({
    id,
    type: "llm_routing_google",
    name: existing.name,
    project_name: existing.project_name,
    ...data,
  });
}

// JSON
export async function createJsonDatasource(
  client: CodeMieClient,
  data: Omit<OtherDataSourceCreateParams, "type">,
): Promise<unknown> {
  return client.datasources.create({
    ...data,
    type: "knowledge_base_json",
  });
}

export async function updateJsonDatasource(
  client: CodeMieClient,
  id: string,
  data: Partial<Omit<OtherDataSourceUpdateParams, "type">>,
): Promise<unknown> {
  const existing = await client.datasources.get(id);
  const params: OtherDataSourceUpdateParams = {
    type: "knowledge_base_json",
    name: existing.name,
    project_name: existing.project_name,
    ...data,
  };
  return client.datasources.update(params);
}

// PROVIDER
export async function createProviderDatasource(
  client: CodeMieClient,
  data: Omit<OtherDataSourceCreateParams, "type">,
): Promise<unknown> {
  return client.datasources.create({
    ...data,
    type: "provider",
  });
}

export async function updateProviderDatasource(
  client: CodeMieClient,
  id: string,
  data: Partial<Omit<OtherDataSourceUpdateParams, "type">>,
): Promise<unknown> {
  const existing = await client.datasources.get(id);
  const params: OtherDataSourceUpdateParams = {
    type: "provider",
    name: existing.name,
    project_name: existing.project_name,
    ...data,
  };
  return client.datasources.update(params);
}

// SUMMARY
export async function createSummaryDatasource(
  client: CodeMieClient,
  data: Omit<OtherDataSourceCreateParams, "type">,
): Promise<unknown> {
  return client.datasources.create({
    ...data,
    type: "summary",
  });
}

export async function updateSummaryDatasource(
  client: CodeMieClient,
  id: string,
  data: Partial<Omit<OtherDataSourceUpdateParams, "type">>,
): Promise<unknown> {
  const existing = await client.datasources.get(id);
  const params: OtherDataSourceUpdateParams = {
    type: "summary",
    name: existing.name,
    project_name: existing.project_name,
    ...data,
  };
  return client.datasources.update(params);
}

// CHUNK SUMMARY
export async function createChunkSummaryDatasource(
  client: CodeMieClient,
  data: Omit<OtherDataSourceCreateParams, "type">,
): Promise<unknown> {
  return client.datasources.create({
    ...data,
    type: "chunk-summary",
  });
}

export async function updateChunkSummaryDatasource(
  client: CodeMieClient,
  id: string,
  data: Partial<Omit<OtherDataSourceUpdateParams, "type">>,
): Promise<unknown> {
  const existing = await client.datasources.get(id);
  const params: OtherDataSourceUpdateParams = {
    type: "chunk-summary",
    name: existing.name,
    project_name: existing.project_name,
    ...data,
  };
  return client.datasources.update(params);
}

export async function deleteDatasource(
  client: CodeMieClient,
  datasourceId: string,
): Promise<void> {
  await client.datasources.delete(datasourceId);
}
