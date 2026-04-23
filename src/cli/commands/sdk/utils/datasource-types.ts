export interface DatasourceTypeConfig {
  command: string;
  serviceKey?: string; // Override for service function name when command contains invalid identifier chars
  type: string; // SDK type value
  description: string;
  example: string;
}

export const DATASOURCE_TYPES: DatasourceTypeConfig[] = [
  {
    command: "confluence",
    type: "knowledge_base_confluence",
    description: "Confluence datasource",
    example:
      '{"name":"Wiki","project_name":"Docs","cql":"space=TEAM","description":"Company wiki","shared_with_project":true}',
  },
  {
    command: "jira",
    type: "knowledge_base_jira",
    description: "Jira datasource",
    example:
      '{"name":"Tickets","project_name":"Support","jql":"project=SUP","description":"Support tickets","shared_with_project":true}',
  },
  {
    command: "file",
    type: "knowledge_base_file",
    description: "File datasource (use --file flags for local files)",
    example:
      '{"name":"Docs","project_name":"Team","description":"Team documents","shared_with_project":true}',
  },
  {
    command: "code",
    type: "code",
    description: "Code repository datasource",
    example:
      '{"name":"Repo","project_name":"Eng","link":"https://github.com/org/repo","branch":"main","index_type":"code","description":"Main codebase"}',
  },
  {
    command: "google",
    type: "llm_routing_google",
    description: "Google Docs datasource",
    example:
      '{"name":"Docs","project_name":"Team","google_doc":"doc-id-or-url","description":"Team docs","shared_with_project":true}',
  },
  {
    command: "json",
    type: "knowledge_base_json",
    description: "JSON knowledge base datasource",
    example:
      '{"name":"json-data","project_name":"Team","description":"JSON knowledge base","shared_with_project":true}',
  },
  {
    command: "provider",
    type: "provider",
    description: "Provider datasource",
    example:
      '{"name":"my-provider","project_name":"Team","description":"Provider datasource","shared_with_project":true}',
  },
  {
    command: "summary",
    type: "summary",
    description: "Summary datasource",
    example:
      '{"name":"my-summary","project_name":"Team","description":"Summary datasource","shared_with_project":true}',
  },
  {
    command: "chunk-summary",
    serviceKey: "chunkSummary",
    type: "chunk-summary",
    description: "Chunk summary datasource",
    example:
      '{"name":"my-chunk-summary","project_name":"Team","description":"Chunk summary datasource","shared_with_project":true}',
  },
  {
    command: "azure-devops-wiki",
    serviceKey: "azureDevOpsWiki",
    type: "knowledge_base_azure_devops_wiki",
    description: "Azure DevOps Wiki datasource",
    example:
      '{"name":"ado-wiki","project_name":"Engineering","organization":"my-org","project":"my-project","wiki_name":"my-wiki","description":"Team wiki","shared_with_project":true}',
  },
  {
    command: "azure-devops-work-item",
    serviceKey: "azureDevOpsWorkItem",
    type: "knowledge_base_azure_devops_work_item",
    description: "Azure DevOps Work Item datasource",
    example:
      '{"name":"ado-work-items","project_name":"Engineering","organization":"my-org","project":"my-project","wiql_query":"SELECT [Id],[Title] FROM WorkItems WHERE [System.TeamProject]=@project","description":"ADO work items","shared_with_project":true}',
  },
  {
    command: "xray",
    type: "knowledge_base_xray",
    description: "Xray test management datasource",
    example:
      '{"name":"xray-tests","project_name":"QA","jql":"project=QA AND issuetype in testExecutions()","description":"Xray test data","shared_with_project":true}',
  },
  {
    command: "sharepoint",
    type: "knowledge_base_sharepoint",
    description: "SharePoint datasource",
    example:
      '{"name":"sharepoint-docs","project_name":"Engineering","site_url":"https://company.sharepoint.com/sites/team","include_pages":true,"include_documents":true,"description":"SharePoint team site","shared_with_project":true}',
  },
  {
    command: "platform",
    type: "platform_marketplace_assistant",
    description: "Platform marketplace assistant datasource",
    example:
      '{"name":"platform-assistant","project_name":"Team","description":"Platform marketplace assistant","shared_with_project":true}',
  },
];
