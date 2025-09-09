import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'file required' }, { status: 400 });
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]+/g, '-');
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const target = path.join(uploadsDir, unique);
    await fs.writeFile(target, buffer);
    const url = `/uploads/${unique}`;
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: 'upload failed' }, { status: 500 });
  }
}

