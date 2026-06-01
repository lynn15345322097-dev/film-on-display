import exhibitionsData from "@/data/exhibitions.json";
import type { ExhibitionRecord, ExhibitionRoute } from "@/types";

const exhibitions = exhibitionsData as ExhibitionRecord[];

function toExhibitionRoute(exhibition: ExhibitionRecord): ExhibitionRoute {
  return {
    id: exhibition.id,
    title: exhibition.title_zh,
    subtitle: exhibition.subtitle_zh,
    summary: exhibition.summary_zh,
    museums: exhibition.museum_ids,
    content: exhibition.content_zh,
    chapters: exhibition.chapters.map((chapter) => ({
      title: chapter.title_zh,
      subtitle: chapter.subtitle_zh,
      researchQuestion: chapter.research_question,
      museumIds: chapter.museum_ids,
      keywords: chapter.keywords,
    })),
  };
}

export const exhibitionRoutes: ExhibitionRoute[] = exhibitions.map(toExhibitionRoute);

export function getAllExhibitionRoutes(): ExhibitionRoute[] {
  return exhibitionRoutes;
}

export function getExhibitionRouteById(id: string): ExhibitionRoute | undefined {
  return exhibitionRoutes.find((route) => route.id === id);
}
