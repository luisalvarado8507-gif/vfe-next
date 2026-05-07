// Árbol ATC — 5 niveles (WHO ATC 2025, selección Ecuador)
export interface AtcNode {
  code: string;
  label: string;
  level: 1 | 2 | 3 | 4 | 5;
  children?: AtcNode[];
}

export const ATC_TREE: AtcNode[] = [
  { code: 'A', label: 'Aparato digestivo y metabolismo', level: 1, children: [
    { code: 'A02', label: 'Antiácidos, antiflatulentos', level: 2, children: [
      { code: 'A02B', label: 'Antiulcerosos', level: 3, children: [
        { code: 'A02BC', label: 'Inhibidores de la bomba de protones', level: 4, children: [
          { code: 'A02BC01', label: 'omeprazol', level: 5 },
          { code: 'A02BC02', label: 'pantoprazol', level: 5 },
          { code: 'A02BC03', label: 'lansoprazol', level: 5 },
          { code: 'A02BC05', label: 'esomeprazol', level: 5 },
        ]},
        { code: 'A02BA', label: 'Antagonistas H2', level: 4, children: [
          { code: 'A02BA02', label: 'ranitidina', level: 5 },
        ]},
      ]},
    ]},
    { code: 'A10', label: 'Antidiabéticos', level: 2, children: [
      { code: 'A10A', label: 'Insulinas y análogos', level: 3, children: [
        { code: 'A10AB', label: 'Insulinas acción rápida', level: 4, children: [
          { code: 'A10AB01', label: 'insulina (humana)', level: 5 },
        ]},
      ]},
      { code: 'A10B', label: 'Antidiabéticos orales', level: 3, children: [
        { code: 'A10BA', label: 'Biguanidas', level: 4, children: [
          { code: 'A10BA02', label: 'metformina', level: 5 },
        ]},
        { code: 'A10BB', label: 'Sulfonilureas', level: 4, children: [
          { code: 'A10BB01', label: 'glibenclamida', level: 5 },
          { code: 'A10BB12', label: 'glimepirida', level: 5 },
        ]},
        { code: 'A10BX', label: 'Otros antidiabéticos orales', level: 4, children: [
          { code: 'A10BX02', label: 'repaglinida', level: 5 },
        ]},
      ]},
    ]},
  ]},
  { code: 'B', label: 'Sangre y órganos hematopoyéticos', level: 1, children: [
    { code: 'B01', label: 'Antitrombóticos', level: 2, children: [
      { code: 'B01A', label: 'Antitrombóticos', level: 3, children: [
        { code: 'B01AC', label: 'Antiagregantes plaquetarios', level: 4, children: [
          { code: 'B01AC06', label: 'ácido acetilsalicílico', level: 5 },
          { code: 'B01AC04', label: 'clopidogrel', level: 5 },
        ]},
        { code: 'B01AA', label: 'Antagonistas de la vitamina K', level: 4, children: [
          { code: 'B01AA03', label: 'warfarina', level: 5 },
        ]},
        { code: 'B01AF', label: 'Inhibidores directos del factor Xa', level: 4, children: [
          { code: 'B01AF01', label: 'rivaroxabán', level: 5 },
          { code: 'B01AF02', label: 'apixabán', level: 5 },
        ]},
      ]},
    ]},
  ]},
  { code: 'C', label: 'Sistema cardiovascular', level: 1, children: [
    { code: 'C02', label: 'Antihipertensivos', level: 2, children: [
      { code: 'C02A', label: 'Antiadrenérgicos de acción central', level: 3, children: [
        { code: 'C02AC', label: 'Agonistas imidazolina', level: 4, children: [
          { code: 'C02AC01', label: 'clonidina', level: 5 },
        ]},
      ]},
    ]},
    { code: 'C03', label: 'Diuréticos', level: 2, children: [
      { code: 'C03A', label: 'Diuréticos tiazídicos', level: 3, children: [
        { code: 'C03AA', label: 'Tiazidas', level: 4, children: [
          { code: 'C03AA03', label: 'hidroclorotiazida', level: 5 },
        ]},
      ]},
      { code: 'C03C', label: 'Diuréticos del asa', level: 3, children: [
        { code: 'C03CA', label: 'Sulfonamidas', level: 4, children: [
          { code: 'C03CA01', label: 'furosemida', level: 5 },
        ]},
      ]},
      { code: 'C03D', label: 'Diuréticos ahorradores de potasio', level: 3, children: [
        { code: 'C03DA', label: 'Antagonistas aldosterona', level: 4, children: [
          { code: 'C03DA01', label: 'espironolactona', level: 5 },
        ]},
      ]},
    ]},
    { code: 'C07', label: 'Betabloqueantes', level: 2, children: [
      { code: 'C07A', label: 'Betabloqueantes', level: 3, children: [
        { code: 'C07AB', label: 'Betabloqueantes selectivos', level: 4, children: [
          { code: 'C07AB02', label: 'metoprolol', level: 5 },
          { code: 'C07AB03', label: 'atenolol', level: 5 },
          { code: 'C07AB07', label: 'bisoprolol', level: 5 },
        ]},
        { code: 'C07AG', label: 'Alfa y betabloqueantes', level: 4, children: [
          { code: 'C07AG02', label: 'carvedilol', level: 5 },
        ]},
      ]},
    ]},
    { code: 'C08', label: 'Bloqueantes de canales de calcio', level: 2, children: [
      { code: 'C08C', label: 'Dihidropiridinas', level: 3, children: [
        { code: 'C08CA', label: 'Dihidropiridinas', level: 4, children: [
          { code: 'C08CA01', label: 'amlodipino', level: 5 },
          { code: 'C08CA05', label: 'nifedipino', level: 5 },
        ]},
      ]},
      { code: 'C08D', label: 'Benzotiazepinas', level: 3, children: [
        { code: 'C08DA', label: 'Benzotiazepinas', level: 4, children: [
          { code: 'C08DA01', label: 'diltiazem', level: 5 },
        ]},
      ]},
    ]},
    { code: 'C09', label: 'Agentes del SRAA', level: 2, children: [
      { code: 'C09A', label: 'IECA', level: 3, children: [
        { code: 'C09AA', label: 'IECA solos', level: 4, children: [
          { code: 'C09AA02', label: 'enalapril', level: 5 },
          { code: 'C09AA05', label: 'ramipril', level: 5 },
          { code: 'C09AA03', label: 'lisinopril', level: 5 },
        ]},
      ]},
      { code: 'C09C', label: 'ARA II', level: 3, children: [
        { code: 'C09CA', label: 'ARA II solos', level: 4, children: [
          { code: 'C09CA01', label: 'losartán', level: 5 },
          { code: 'C09CA03', label: 'valsartán', level: 5 },
          { code: 'C09CA04', label: 'irbesartán', level: 5 },
          { code: 'C09CA06', label: 'candesartán', level: 5 },
        ]},
      ]},
      { code: 'C09D', label: 'ARA II combinaciones', level: 3, children: [
        { code: 'C09DA', label: 'ARA II + diuréticos', level: 4, children: [
          { code: 'C09DA01', label: 'losartán + hidroclorotiazida', level: 5 },
        ]},
        { code: 'C09DB', label: 'ARA II + calcioantagonistas', level: 4, children: [
          { code: 'C09DB07', label: 'candesartán + amlodipino', level: 5 },
        ]},
      ]},
    ]},
    { code: 'C10', label: 'Hipolipemiantes', level: 2, children: [
      { code: 'C10A', label: 'Hipolipemiantes', level: 3, children: [
        { code: 'C10AA', label: 'Estatinas', level: 4, children: [
          { code: 'C10AA01', label: 'simvastatina', level: 5 },
          { code: 'C10AA05', label: 'atorvastatina', level: 5 },
          { code: 'C10AA07', label: 'rosuvastatina', level: 5 },
        ]},
      ]},
    ]},
  ]},
  { code: 'J', label: 'Antiinfecciosos sistémicos', level: 1, children: [
    { code: 'J01', label: 'Antibacterianos sistémicos', level: 2, children: [
      { code: 'J01C', label: 'Betalactámicos — penicilinas', level: 3, children: [
        { code: 'J01CA', label: 'Penicilinas amplio espectro', level: 4, children: [
          { code: 'J01CA04', label: 'amoxicilina', level: 5 },
        ]},
        { code: 'J01CR', label: 'Penicilinas + inhibidor betalactamasa', level: 4, children: [
          { code: 'J01CR02', label: 'amoxicilina + ácido clavulánico', level: 5 },
        ]},
      ]},
      { code: 'J01D', label: 'Betalactámicos — otros', level: 3, children: [
        { code: 'J01DD', label: 'Cefalosporinas 3.ª generación', level: 4, children: [
          { code: 'J01DD04', label: 'ceftriaxona', level: 5 },
        ]},
      ]},
      { code: 'J01F', label: 'Macrólidos', level: 3, children: [
        { code: 'J01FA', label: 'Macrólidos', level: 4, children: [
          { code: 'J01FA10', label: 'azitromicina', level: 5 },
          { code: 'J01FA09', label: 'claritromicina', level: 5 },
        ]},
      ]},
      { code: 'J01M', label: 'Quinolonas', level: 3, children: [
        { code: 'J01MA', label: 'Fluoroquinolonas', level: 4, children: [
          { code: 'J01MA02', label: 'ciprofloxacino', level: 5 },
          { code: 'J01MA12', label: 'levofloxacino', level: 5 },
        ]},
      ]},
    ]},
  ]},
  { code: 'M', label: 'Sistema musculoesquelético', level: 1, children: [
    { code: 'M01', label: 'Antiinflamatorios', level: 2, children: [
      { code: 'M01A', label: 'AINE', level: 3, children: [
        { code: 'M01AB', label: 'Derivados del ácido acético', level: 4, children: [
          { code: 'M01AB05', label: 'diclofenaco', level: 5 },
        ]},
        { code: 'M01AE', label: 'Derivados del ácido propiónico', level: 4, children: [
          { code: 'M01AE01', label: 'ibuprofeno', level: 5 },
          { code: 'M01AE02', label: 'naproxeno', level: 5 },
        ]},
      ]},
    ]},
  ]},
  { code: 'N', label: 'Sistema nervioso', level: 1, children: [
    { code: 'N02', label: 'Analgésicos', level: 2, children: [
      { code: 'N02B', label: 'Analgésicos no opioides', level: 3, children: [
        { code: 'N02BE', label: 'Anilidas', level: 4, children: [
          { code: 'N02BE01', label: 'paracetamol', level: 5 },
        ]},
      ]},
      { code: 'N02A', label: 'Opioides', level: 3, children: [
        { code: 'N02AX', label: 'Otros opioides', level: 4, children: [
          { code: 'N02AX02', label: 'tramadol', level: 5 },
        ]},
      ]},
    ]},
    { code: 'N05', label: 'Psicolépticos', level: 2, children: [
      { code: 'N05B', label: 'Ansiolíticos', level: 3, children: [
        { code: 'N05BA', label: 'Benzodiazepinas', level: 4, children: [
          { code: 'N05BA01', label: 'diazepam', level: 5 },
          { code: 'N05BA06', label: 'lorazepam', level: 5 },
        ]},
      ]},
    ]},
  ]},
  { code: 'R', label: 'Sistema respiratorio', level: 1, children: [
    { code: 'R03', label: 'Antiasmáticos', level: 2, children: [
      { code: 'R03A', label: 'Adrenérgicos inhalados', level: 3, children: [
        { code: 'R03AC', label: 'Agonistas β2 selectivos', level: 4, children: [
          { code: 'R03AC02', label: 'salbutamol', level: 5 },
          { code: 'R03AC13', label: 'formoterol', level: 5 },
        ]},
      ]},
      { code: 'R03B', label: 'Corticoides inhalados', level: 3, children: [
        { code: 'R03BA', label: 'Glucocorticoides', level: 4, children: [
          { code: 'R03BA01', label: 'budesonida', level: 5 },
          { code: 'R03BA05', label: 'fluticasona', level: 5 },
        ]},
      ]},
    ]},
  ]},
  { code: 'H', label: 'Hormonas sistémicas', level: 1, children: [
    { code: 'H02', label: 'Corticosteroides sistémicos', level: 2, children: [
      { code: 'H02A', label: 'Corticosteroides solos', level: 3, children: [
        { code: 'H02AB', label: 'Glucocorticoides', level: 4, children: [
          { code: 'H02AB07', label: 'prednisona', level: 5 },
          { code: 'H02AB04', label: 'metilprednisolona', level: 5 },
          { code: 'H02AB02', label: 'dexametasona', level: 5 },
        ]},
      ]},
    ]},
    { code: 'H03', label: 'Tiroides', level: 2, children: [
      { code: 'H03A', label: 'Preparados tiroideos', level: 3, children: [
        { code: 'H03AA', label: 'Hormonas tiroideas', level: 4, children: [
          { code: 'H03AA01', label: 'levotiroxina', level: 5 },
        ]},
      ]},
    ]},
  ]},
];

export function flatAtc(nodes: AtcNode[] = ATC_TREE): AtcNode[] {
  return nodes.flatMap(n => [n, ...flatAtc(n.children || [])]);
}

export function findAtcNode(code: string, nodes: AtcNode[] = ATC_TREE): AtcNode | null {
  for (const n of nodes) {
    if (n.code === code) return n;
    const found = findAtcNode(code, n.children || []);
    if (found) return found;
  }
  return null;
}
