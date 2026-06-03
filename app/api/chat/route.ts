import { NextResponse } from "next/server";

import {
  countBy,
  getAllExhibitions,
  getAllMuseums,
  getAllPhotos,
  getCategories,
  getMuseumsByIds,
  getSpatialStats,
} from "@/lib/museums";
import { createClient } from "@/lib/supabase/server";

const DEEPSEEK_CHAT_COMPLETIONS_URL = "https://api.deepseek.com/chat/completions";

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

function buildArchiveSystemPrompt() {
  const museums = getAllMuseums();
  const photos = getAllPhotos();
  const exhibitions = getAllExhibitions();
  const categories = getCategories();
  const spatialStats = getSpatialStats();
  const photoObjectStats = countBy(photos, (photo) => photo.metadata.object_type);
  const photoVisibilityStats = countBy(photos, (photo) => photo.visibility);
  const photoRestrictionStats = countBy(
    photos,
    (photo) => photo.rights.institutional_restriction.status,
  );

  const museumIndex = museums
    .map((museum) =>
      [
        museum.id,
        museum.name,
        `${museum.province}/${museum.city}/${museum.region}`,
        `type=${museum.type}`,
        `nature=${museum.nature}`,
        `visited=${museum.visited ? "yes" : "no"}`,
        `tags=${museum.tags.join(", ")}`,
        `description=${museum.description}`,
        `space=${museum.spaceObservation}`,
        `exhibition=${museum.exhibitionAnalysis}`,
      ].join(" | "),
    )
    .join("\n");

  const routeIndex = exhibitions
    .map((route) => {
      const routeMuseums = getMuseumsByIds(route.museum_ids)
        .map((museum) => `${museum.name}(${museum.province})`)
        .join(", ");
      const chapters = route.chapters
        .map(
          (chapter) =>
            `${chapter.title_zh}: ${chapter.research_question}; keywords=${chapter.keywords.join(", ")}`,
        )
        .join(" / ");

      return [
        route.id,
        route.title_zh,
        route.subtitle_zh,
        `summary=${route.summary_zh}`,
        `museums=${routeMuseums}`,
        `chapters=${chapters}`,
      ].join(" | ");
    })
    .join("\n");

  const photoIndex = photos
    .map((photo) =>
      [
        photo.id,
        photo.metadata.title_zh,
        `museum_id=${photo.museum_id}`,
        `exhibition_id=${photo.exhibition_id ?? "none"}`,
        `object=${photo.metadata.object_type}`,
        `visibility=${photo.visibility}`,
        `license=${photo.rights.photographer_copyright.license}`,
        `restriction=${photo.rights.institutional_restriction.status}`,
        `download=${photo.rights.institutional_restriction.download_allowed ? "yes" : "no"}`,
        `person=${photo.rights.personality_rights.contains_identifiable_person ? "yes" : "no"}`,
      ].join(" | "),
    )
    .join("\n");

  return [
    "You are the archival research assistant for 影迹图谱 FilmGeo Atlas.",
    "Answer in the user's language. Be concise, scholarly, and clear.",
    "Use the local archive context below as your primary source. If the archive does not contain enough evidence, say that clearly and suggest what field or source should be checked next.",
    "Do not invent museum records, photo rights, coordinates, citations, or exhibition routes. Do not claim to have edited the database.",
    "",
    "DATASET SUMMARY",
    `museums=${museums.length}; photos=${photos.length}; exhibitions=${exhibitions.length}; provinces=${spatialStats.provinceStats.length}; regions=${spatialStats.regionStats.length}; visited=${spatialStats.visitedCount}.`,
    `regions=${spatialStats.regionStats.map((item) => `${item.region}:${item.count}, visited:${item.visited}`).join("; ")}`,
    `top_provinces=${spatialStats.provinceStats.slice(0, 12).map((item) => `${item.province}:${item.count}, visited:${item.visited}`).join("; ")}`,
    `types=${spatialStats.typeStats.map((item) => `${item.type}:${item.count}`).join("; ")}`,
    `natures=${spatialStats.natureStats.map((item) => `${item.nature}:${item.count}`).join("; ")}`,
    `photo_objects=${photoObjectStats.map((item) => `${item.label}:${item.count}`).join("; ")}`,
    `photo_visibility=${photoVisibilityStats.map((item) => `${item.label}:${item.count}`).join("; ")}`,
    `photo_restrictions=${photoRestrictionStats.map((item) => `${item.label}:${item.count}`).join("; ")}`,
    `category_schema=${categories.space_types.map((item) => item.label_zh).join("; ")}`,
    "",
    "MUSEUM INDEX",
    museumIndex,
    "",
    "EXHIBITION ROUTES",
    routeIndex,
    "",
    "PHOTO RIGHTS AND METADATA INDEX",
    photoIndex,
  ].join("\n");
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-pro";

  if (!apiKey) {
    return NextResponse.json(
      { error: "DeepSeek API key is not configured." },
      { status: 500 },
    );
  }

  let payload: { messages?: IncomingMessage[] };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = Array.isArray(payload.messages)
    ? payload.messages
        .filter(
          (message) =>
            (message.role === "user" || message.role === "assistant") &&
            typeof message.content === "string" &&
            message.content.trim().length > 0,
        )
        .slice(-12)
    : [];

  if (!messages.length) {
    return NextResponse.json({ error: "At least one message is required." }, { status: 400 });
  }

  const response = await fetch(DEEPSEEK_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: buildArchiveSystemPrompt(),
        },
        ...messages,
      ],
      temperature: 0.4,
      max_tokens: 700,
      stream: false,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      {
        error: "DeepSeek request failed.",
        detail: detail.slice(0, 500),
      },
      { status: response.status },
    );
  }

  const completion = await response.json();
  const content = completion?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json(
      { error: "DeepSeek returned an empty response." },
      { status: 502 },
    );
  }

  return NextResponse.json({ message: content.trim(), model });
}
