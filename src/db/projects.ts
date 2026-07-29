import { db } from './index.ts';
import { projects } from './schema.ts';
import { getOrCreateUser } from './users.ts';
import { eq, and } from 'drizzle-orm';

export async function getUserProjects(userUid: string) {
  try {
    const records = await db.select()
      .from(projects)
      .where(eq(projects.userUid, userUid));
    return records;
  } catch (error) {
    console.error("Database query failed for getUserProjects:", error);
    throw new Error("Failed to fetch user projects from database.", { cause: error });
  }
}

export async function getProjectByUidAndId(userUid: string, projIdStr: string) {
  try {
    const records = await db.select()
      .from(projects)
      .where(
        and(
          eq(projects.userUid, userUid),
          eq(projects.projectId, projIdStr)
        )
      );
    return records[0] || null;
  } catch (error) {
    console.error("Database query failed for getProjectByUidAndId:", error);
    throw new Error("Failed to fetch project record.", { cause: error });
  }
}

export async function saveProjectStateToDb(userUid: string, userEmail: string, projectObj: any) {
  try {
    const dbUser = await getOrCreateUser(userUid, userEmail);
    const projIdStr = projectObj.id || 'default_project';
    const jsonPayload = JSON.stringify(projectObj);

    const result = await db.insert(projects)
      .values({
        projectId: projIdStr,
        userId: dbUser.id,
        userUid: userUid,
        title: projectObj.title || 'Untitled Narrative Project',
        tagline: projectObj.tagline || '',
        genre: projectObj.genre || 'Science Fiction',
        worldSetting: projectObj.worldSetting || '',
        continuityScore: projectObj.continuityScore || 100,
        projectData: jsonPayload,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: projects.projectId,
        set: {
          title: projectObj.title || 'Untitled Narrative Project',
          tagline: projectObj.tagline || '',
          genre: projectObj.genre || 'Science Fiction',
          worldSetting: projectObj.worldSetting || '',
          continuityScore: projectObj.continuityScore || 100,
          projectData: jsonPayload,
          updatedAt: new Date()
        }
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Database query failed for saveProjectStateToDb:", error);
    throw new Error("Failed to save project state to Cloud SQL database.", { cause: error });
  }
}
