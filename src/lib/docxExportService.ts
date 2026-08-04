import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, Table, TableRow, TableCell, BorderStyle, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import { ProjectMetadata, Scene, Character, SceneProposal } from '../types';

export interface ExportData {
  project: ProjectMetadata;
  scenes?: Scene[];
  proposals?: SceneProposal[];
  characters?: Character[];
}

export const generateProjectDOCX = async (data: ExportData) => {
  const { project, scenes = [], characters = [], proposals = [] } = data;

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // 1. Project Overview
        new Paragraph({
          text: project.title || 'Untitled Project',
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: project.tagline || '', italics: true }),
          ],
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({ text: "Project ID: ", bold: true }),
            new TextRun(project.id || 'N/A'),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Created Date: ", bold: true }),
            new TextRun(project.createdAt || 'N/A'),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Last Updated Date: ", bold: true }),
            new TextRun(project.updatedAt || 'N/A'),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Last Sync Date: ", bold: true }),
            new TextRun(project.lastSync || 'N/A'),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Number of Scenes: ", bold: true }),
            new TextRun(scenes.length.toString()),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Number of Characters: ", bold: true }),
            new TextRun(characters.length.toString()),
          ]
        }),
        ...(project.episodeId ? [
          new Paragraph({
            children: [
              new TextRun({ text: "Episode ID: ", bold: true }),
              new TextRun(project.episodeId),
            ]
          })
        ] : []),
        new Paragraph({ children: [new Paragraph({ children: [new PageBreak()] })] }),

        // 2. Complete Scene Summary Section
        new Paragraph({
          text: "Scene Table of Contents",
          heading: HeadingLevel.HEADING_1,
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Order", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Scene Title", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Scene ID", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Summary", bold: true })] })] }),
              ]
            }),
            ...scenes.map((s, index) => new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: (s.order ?? index + 1).toString() })] }),
                new TableCell({ children: [new Paragraph({ text: s.title })] }),
                new TableCell({ children: [new Paragraph({ text: s.id })] }),
                new TableCell({ children: [new Paragraph({ text: s.purpose || "" })] }),
              ]
            }))
          ]
        }),
        new Paragraph({ children: [new Paragraph({ children: [new PageBreak()] })] }),

        // 3. Full Scene Contents Section
        new Paragraph({
          text: "Full Scene Contents",
          heading: HeadingLevel.HEADING_1,
        }),
        ...scenes.flatMap((s, index) => [
          new Paragraph({
            text: `Scene ${s.order ?? index + 1}: ${s.title}`,
            heading: HeadingLevel.HEADING_2,
          }),
                    new Paragraph({
            children: [
              new TextRun({ text: `ID: ${s.id} | Order: ${s.order ?? index + 1} | Location: ${s.location || 'Unknown'}`, color: "888888", size: 20 }),
            ]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Summary:", bold: true }),
            ]
          }),
          new Paragraph({
            text: s.purpose || 'No summary provided.'
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Content:", bold: true }),
            ]
          }),
          new Paragraph({
            text: s.fullContent || s.prose || 'No content provided.'
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Character References: ", bold: true }),
              new TextRun(s.charactersReferenced ? s.charactersReferenced.join(', ') : (s.participantIds ? s.participantIds.join(', ') : 'None')),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Scene Notes: ", bold: true }),
              new TextRun(s.notes || 'None'),
            ]
          }),
          new Paragraph({ text: "" }),
        ]),
        new Paragraph({ children: [new Paragraph({ children: [new PageBreak()] })] }),

        // 4. Character Directory
        new Paragraph({
          text: "Character Directory",
          heading: HeadingLevel.HEADING_1,
        }),
        ...characters.flatMap(c => [
          new Paragraph({
            text: `${c.name} (${c.role})`,
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `ID: ${c.id}`, color: "888888", size: 20 }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Demographics: ", bold: true }),
              new TextRun(`Age: ${c.demographics?.age || 'N/A'}, Gender: ${c.demographics?.gender || 'N/A'}, Ethnicity: ${c.demographics?.ethnicity || 'N/A'}`),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Summary: ", bold: true }),
              new TextRun(c.summary || c.goals || 'None'),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Notes: ", bold: true }),
              new TextRun(c.notes || 'None'),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "First Appearance (Scene ID): ", bold: true }),
              new TextRun(c.firstAppearanceSceneId || 'Unknown'),
            ]
          }),
          new Paragraph({ text: "" }),
        ]),
        new Paragraph({ children: [new Paragraph({ children: [new PageBreak()] })] }),

        // 5. Metadata Section
        new Paragraph({
          text: "Metadata Section",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Project ID: ", bold: true }),
            new TextRun(project.id || 'N/A'),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Episode ID: ", bold: true }),
            new TextRun(project.episodeId || 'N/A'),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Current Scene ID: ", bold: true }),
            new TextRun(project.currentSceneId || 'N/A'),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Current Character ID: ", bold: true }),
            new TextRun(project.currentCharacterId || 'N/A'),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Auto-Save Enabled: ", bold: true }),
            new TextRun(project.autoSaveEnabled ? 'Yes' : 'No'),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Auto-Sync Enabled: ", bold: true }),
            new TextRun(project.autoSyncEnabled ? 'Yes' : 'No'),
          ]
        }),
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${project.title ? project.title.replace(/\s+/g, '_') : 'Project'}_Export.docx`);
};
