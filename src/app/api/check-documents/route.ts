import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { mandateType, filenames, requiredItems, optionalItems } = await request.json();

    if (!filenames?.length) {
      return NextResponse.json({ matched: [], missing: requiredItems, uncertain: [] });
    }

    const client = new Anthropic();
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system:
        "Du bist Assistent des Treuhandbüros Jucker Treuhand in Pfäffikon ZH. Prüfe ob die hochgeladenen Dokumente die Checkliste für das gewählte Mandat erfüllen. Antworte ausschliesslich als JSON, kein Markdown, keine Erklärungen.",
      messages: [
        {
          role: "user",
          content: `Mandat: ${mandateType}.
Hochgeladene Dateien: ${filenames.join(", ")}.
Checkliste (Required): ${requiredItems.join(", ")}.
Checkliste (Optional): ${optionalItems.join(", ")}.
Ordne jede hochgeladene Datei einem Checklist-Item zu (fuzzy matching, ignoriere Jahreszahlen und Sonderzeichen im Dateinamen).
Gib zurück: { "matched": [{"item": "...", "filename": "..."}], "missing": ["..."], "uncertain": [{"item": "...", "filename": "...", "reason": "..."}] }`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON from response, handling potential markdown wrapping
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      json = match ? JSON.parse(match[0]) : { matched: [], missing: requiredItems, uncertain: [] };
    }

    return NextResponse.json(json);
  } catch (error) {
    console.error("Check documents error:", error);
    return NextResponse.json(
      { matched: [], missing: [], uncertain: [] },
      { status: 500 }
    );
  }
}
