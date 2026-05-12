import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const inn = new URL(req.url).searchParams.get('inn');
  if (!inn) return NextResponse.json({ rxcui: null });

  try {
    // Buscar RxCUI por nombre INN en la API pública NLM
    const res = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(inn)}&search=2`,
      { next: { revalidate: 86400 } }
    );
    const data = await res.json();
    const rxcui = data?.idGroup?.rxnormId?.[0] || null;

    if (!rxcui) return NextResponse.json({ rxcui: null });

    // Obtener info adicional del concepto
    const infoRes = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`,
      { next: { revalidate: 86400 } }
    );
    const infoData = await infoRes.json();
    const props = infoData?.properties;

    return NextResponse.json({
      rxcui,
      name: props?.name || inn,
      synonym: props?.synonym || null,
      tty: props?.tty || null,
      url: `https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${rxcui}`
    }, {
      headers: { 'Cache-Control': 'public, max-age=86400' }
    });
  } catch {
    return NextResponse.json({ rxcui: null });
  }
}
