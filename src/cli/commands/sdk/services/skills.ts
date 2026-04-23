import type { CodeMieClient, SkillListItem, SkillDetail } from "codemie-sdk";

type SkillListParams = Parameters<CodeMieClient["skills"]["list"]>[0];

export async function listSkills(
  client: CodeMieClient,
  params?: SkillListParams,
): Promise<SkillListItem[]> {
  return client.skills.list(params);
}

export async function getSkill(
  client: CodeMieClient,
  skillId: string,
): Promise<SkillDetail> {
  return client.skills.get(skillId);
}
