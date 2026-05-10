import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = new URL(req.url).searchParams.get('code');
  if (!code) return NextResponse.json({ levels: [] });

  try {
    const res = await fetch(
      `https://atcddd.fhi.no/atc_ddd_index/?code=${code.toUpperCase()}&showdescription=yes`,
      { next: { revalidate: 86400 } }
    );
    const html = await res.text();

    // Parsear la tabla de jerarquía del HTML de WHO
    const levels: { code: string; level: number; description: string }[] = [];
    const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
    
    for (const row of rows) {
      const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
      if (cells.length >= 2) {
        const codeMatch = (cells[0] || '').replace(/<[^>]+>/g, '').trim();
        const desc = (cells[1] || '').replace(/<[^>]+>/g, '').trim();
        if (codeMatch && desc && /^[A-Z][0-9A-Z]{0,6}$/.test(codeMatch)) {
          const lvl = codeMatch.length === 1 ? 1 : codeMatch.length === 3 ? 2 : codeMatch.length === 4 ? 3 : codeMatch.length === 5 ? 4 : 5;
          levels.push({ code: codeMatch, level: lvl, description: desc });
        }
      }
    }

    return NextResponse.json({ levels }, {
      headers: { 'Cache-Control': 'public, max-age=86400' }
    });
  } catch {
    return NextResponse.json({ levels: [] });
  }
}
