import { NextRequest, NextResponse } from "next/server";
import {
  ensurePlannerDayAdmin,
  createPlannerEntryAdmin,
  addPlannerMediaAdmin,
} from "@/lib/planner-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const date = body.date as string;
    const title = (body.title as string)?.trim() || null;
    const content = (body.content as string)?.trim() || null;
    const tags = Array.isArray(body.tags) ? body.tags : [];
    const mood = (body.mood as string)?.trim() || null;
    const summaryQuote = (body.summaryQuote as string)?.trim() || null;
    const stickerSelection = Array.isArray(body.stickerSelection) ? body.stickerSelection : null;
    const mediaUrls = Array.isArray(body.mediaUrls) ? body.mediaUrls : [];

    if (!date?.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const dayResult = await ensurePlannerDayAdmin(date);
    if ("error" in dayResult) {
      return NextResponse.json({ error: dayResult.error }, { status: 500 });
    }

    const entryResult = await createPlannerEntryAdmin({
      dayId: dayResult.id,
      title,
      content,
      tags,
      mood,
      summaryQuote,
      stickerSelection,
    });

    if ("error" in entryResult) {
      return NextResponse.json({ error: entryResult.error }, { status: 500 });
    }

    for (const item of mediaUrls) {
      const url = typeof item === "string" ? item : item.url;
      const type = typeof item === "object" && item.type ? item.type : "image";
      const attachmentType = typeof item === "object" && item.attachmentType ? item.attachmentType : null;
      if (url && (type === "image" || type === "video")) {
        await addPlannerMediaAdmin({
          entryId: entryResult.id,
          type,
          url,
          attachmentType: attachmentType === "paperclip" || attachmentType === "paste" || attachmentType === "staple" ? attachmentType : undefined,
        });
      }
    }

    return NextResponse.json({ id: entryResult.id });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
