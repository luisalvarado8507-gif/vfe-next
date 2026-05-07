// Árbol ATC — 5 niveles (WHO ATC 2025, selección Ecuador)
export interface AtcNode {
  code: string;
  label: string;
  level: 1 | 2 | 3 | 4 | 5;
  children?: AtcNode[];
}

export const ATC_TREE: AtcNode[] = [
  { code: 'A', label: 'Aparato digestivo y metabolismo', level: 1, children: [
    { code: 'A02', label: 'Antiácidos y antiulcerosos', level: 2, children: [
      { code: 'A02B', label: 'Antiulcerosos', level: 3, children: [
        { code: 'A02BC', label: 'Inhibidores bomba de protones', level: 4, children: [
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
          { code: 'A10AB01', label: 'insulina humana', level: 5 },
          { code: 'A10AB04', label: 'insulina lispro', level: 5 },
        ]},
        { code: 'A10AE', label: 'Insulinas acción prolongada', level: 4, children: [
          { code: 'A10AE01', label: 'insulina glargina', level: 5 },
          { code: 'A10AE04', label: 'insulina detemir', level: 5 },
        ]},
      ]},
      { code: 'A10B', label: 'Antidiabéticos orales', level: 3, children: [
        { code: 'A10BA', label: 'Biguanidas', level: 4, children: [
          { code: 'A10BA02', label: 'metformina', level: 5 },
        ]},
        { code: 'A10BB', label: 'Sulfonilureas', level: 4, children: [
          { code: 'A10BB01', label: 'glibenclamida', level: 5 },
          { code: 'A10BB12', label: 'glimepirida', level: 5 },
          { code: 'A10BB09', label: 'gliclazida', level: 5 },
        ]},
        { code: 'A10BH', label: 'Inhibidores DPP-4', level: 4, children: [
          { code: 'A10BH01', label: 'sitagliptina', level: 5 },
          { code: 'A10BH02', label: 'vildagliptina', level: 5 },
        ]},
        { code: 'A10BK', label: 'Inhibidores SGLT2', level: 4, children: [
          { code: 'A10BK01', label: 'dapagliflozina', level: 5 },
          { code: 'A10BK02', label: 'canagliflozina', level: 5 },
          { code: 'A10BK03', label: 'empagliflozina', level: 5 },
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
          { code: 'B01AC22', label: 'prasugrel', level: 5 },
        ]},
        { code: 'B01AA', label: 'Antagonistas vitamina K', level: 4, children: [
          { code: 'B01AA03', label: 'warfarina', level: 5 },
        ]},
        { code: 'B01AF', label: 'Inhibidores factor Xa', level: 4, children: [
          { code: 'B01AF01', label: 'rivaroxabán', level: 5 },
          { code: 'B01AF02', label: 'apixabán', level: 5 },
        ]},
        { code: 'B01AE', label: 'Inhibidores trombina', level: 4, children: [
          { code: 'B01AE07', label: 'dabigatrán', level: 5 },
        ]},
      ]},
    ]},
    { code: 'B03', label: 'Antianémicos', level: 2, children: [
      { code: 'B03A', label: 'Preparados de hierro', level: 3, children: [
        { code: 'B03AA', label: 'Hierro bivalente oral', level: 4, children: [
          { code: 'B03AA07', label: 'sulfato ferroso', level: 5 },
        ]},
      ]},
      { code: 'B03B', label: 'Vitamina B12 y ácido fólico', level: 3, children: [
        { code: 'B03BB', label: 'Ácido fólico', level: 4, children: [
          { code: 'B03BB01', label: 'ácido fólico', level: 5 },
        ]},
      ]},
    ]},
  ]},

  { code: 'C', label: 'Sistema cardiovascular', level: 1, children: [
    { code: 'C03', label: 'Diuréticos', level: 2, children: [
      { code: 'C03A', label: 'Tiazídicos', level: 3, children: [
        { code: 'C03AA', label: 'Tiazidas', level: 4, children: [
          { code: 'C03AA03', label: 'hidroclorotiazida', level: 5 },
        ]},
      ]},
      { code: 'C03C', label: 'Diuréticos del asa', level: 3, children: [
        { code: 'C03CA', label: 'Sulfonamidas', level: 4, children: [
          { code: 'C03CA01', label: 'furosemida', level: 5 },
          { code: 'C03CA02', label: 'bumetanida', level: 5 },
        ]},
      ]},
      { code: 'C03D', label: 'Ahorradores de potasio', level: 3, children: [
        { code: 'C03DA', label: 'Antagonistas aldosterona', level: 4, children: [
          { code: 'C03DA01', label: 'espironolactona', level: 5 },
          { code: 'C03DA04', label: 'eplerenona', level: 5 },
        ]},
      ]},
    ]},
    { code: 'C07', label: 'Betabloqueantes', level: 2, children: [
      { code: 'C07A', label: 'Betabloqueantes', level: 3, children: [
        { code: 'C07AB', label: 'Betabloqueantes selectivos', level: 4, children: [
          { code: 'C07AB02', label: 'metoprolol', level: 5 },
          { code: 'C07AB03', label: 'atenolol', level: 5 },
          { code: 'C07AB07', label: 'bisoprolol', level: 5 },
          { code: 'C07AB12', label: 'nebivolol', level: 5 },
        ]},
        { code: 'C07AG', label: 'Alfa y betabloqueantes', level: 4, children: [
          { code: 'C07AG02', label: 'carvedilol', level: 5 },
        ]},
      ]},
    ]},
    { code: 'C08', label: 'Bloqueantes calcio', level: 2, children: [
      { code: 'C08C', label: 'Dihidropiridinas', level: 3, children: [
        { code: 'C08CA', label: 'Dihidropiridinas', level: 4, children: [
          { code: 'C08CA01', label: 'amlodipino', level: 5 },
          { code: 'C08CA05', label: 'nifedipino', level: 5 },
          { code: 'C08CA13', label: 'lercanidipino', level: 5 },
        ]},
      ]},
      { code: 'C08D', label: 'Benzotiazepinas', level: 3, children: [
        { code: 'C08DA', label: 'Benzotiazepinas', level: 4, children: [
          { code: 'C08DA01', label: 'diltiazem', level: 5 },
        ]},
      ]},
    ]},
    { code: 'C09', label: 'Agentes SRAA', level: 2, children: [
      { code: 'C09A', label: 'IECA solos', level: 3, children: [
        { code: 'C09AA', label: 'IECA', level: 4, children: [
          { code: 'C09AA02', label: 'enalapril', level: 5 },
          { code: 'C09AA03', label: 'lisinopril', level: 5 },
          { code: 'C09AA05', label: 'ramipril', level: 5 },
          { code: 'C09AA09', label: 'fosinopril', level: 5 },
        ]},
      ]},
      { code: 'C09C', label: 'ARA II solos', level: 3, children: [
        { code: 'C09CA', label: 'ARA II', level: 4, children: [
          { code: 'C09CA01', label: 'losartán', level: 5 },
          { code: 'C09CA03', label: 'valsartán', level: 5 },
          { code: 'C09CA04', label: 'irbesartán', level: 5 },
          { code: 'C09CA06', label: 'candesartán', level: 5 },
          { code: 'C09CA07', label: 'telmisartán', level: 5 },
        ]},
      ]},
      { code: 'C09D', label: 'ARA II combinaciones', level: 3, children: [
        { code: 'C09DA', label: 'ARA II + diuréticos', level: 4, children: [
          { code: 'C09DA01', label: 'losartán + hidroclorotiazida', level: 5 },
          { code: 'C09DA03', label: 'valsartán + hidroclorotiazida', level: 5 },
        ]},
        { code: 'C09DB', label: 'ARA II + calcioantagonistas', level: 4, children: [
          { code: 'C09DB07', label: 'candesartán + amlodipino', level: 5 },
          { code: 'C09DB01', label: 'olmesartán + amlodipino', level: 5 },
        ]},
      ]},
    ]},
    { code: 'C10', label: 'Hipolipemiantes', level: 2, children: [
      { code: 'C10A', label: 'Hipolipemiantes', level: 3, children: [
        { code: 'C10AA', label: 'Estatinas', level: 4, children: [
          { code: 'C10AA01', label: 'simvastatina', level: 5 },
          { code: 'C10AA05', label: 'atorvastatina', level: 5 },
          { code: 'C10AA07', label: 'rosuvastatina', level: 5 },
          { code: 'C10AA03', label: 'pravastatina', level: 5 },
        ]},
        { code: 'C10AB', label: 'Fibratos', level: 4, children: [
          { code: 'C10AB05', label: 'fenofibrato', level: 5 },
        ]},
      ]},
    ]},
  ]},

  { code: 'H', label: 'Hormonas sistémicas', level: 1, children: [
    { code: 'H02', label: 'Corticosteroides sistémicos', level: 2, children: [
      { code: 'H02A', label: 'Corticosteroides solos', level: 3, children: [
        { code: 'H02AB', label: 'Glucocorticoides', level: 4, children: [
          { code: 'H02AB02', label: 'dexametasona', level: 5 },
          { code: 'H02AB04', label: 'metilprednisolona', level: 5 },
          { code: 'H02AB07', label: 'prednisona', level: 5 },
          { code: 'H02AB08', label: 'triamcinolona', level: 5 },
        ]},
      ]},
    ]},
    { code: 'H03', label: 'Tiroides', level: 2, children: [
      { code: 'H03A', label: 'Preparados tiroideos', level: 3, children: [
        { code: 'H03AA', label: 'Hormonas tiroideas', level: 4, children: [
          { code: 'H03AA01', label: 'levotiroxina', level: 5 },
        ]},
      ]},
      { code: 'H03B', label: 'Antitiroideos', level: 3, children: [
        { code: 'H03BB', label: 'Tioamidas', level: 4, children: [
          { code: 'H03BB02', label: 'carbimazol', level: 5 },
          { code: 'H03BB01', label: 'propiltiouracilo', level: 5 },
        ]},
      ]},
    ]},
  ]},

  { code: 'J', label: 'Antiinfecciosos sistémicos', level: 1, children: [
    { code: 'J01', label: 'Antibacterianos sistémicos', level: 2, children: [
      { code: 'J01C', label: 'Betalactámicos — penicilinas', level: 3, children: [
        { code: 'J01CA', label: 'Penicilinas amplio espectro', level: 4, children: [
          { code: 'J01CA04', label: 'amoxicilina', level: 5 },
          { code: 'J01CA01', label: 'ampicilina', level: 5 },
        ]},
        { code: 'J01CR', label: 'Penicilinas + inhibidor betalactamasa', level: 4, children: [
          { code: 'J01CR02', label: 'amoxicilina + ácido clavulánico', level: 5 },
          { code: 'J01CR01', label: 'ampicilina + sulbactam', level: 5 },
        ]},
      ]},
      { code: 'J01D', label: 'Betalactámicos — otros', level: 3, children: [
        { code: 'J01DB', label: 'Cefalosporinas 1.ª gen.', level: 4, children: [
          { code: 'J01DB01', label: 'cefalexina', level: 5 },
          { code: 'J01DB04', label: 'cefazolina', level: 5 },
        ]},
        { code: 'J01DC', label: 'Cefalosporinas 2.ª gen.', level: 4, children: [
          { code: 'J01DC02', label: 'cefuroxima', level: 5 },
        ]},
        { code: 'J01DD', label: 'Cefalosporinas 3.ª gen.', level: 4, children: [
          { code: 'J01DD04', label: 'ceftriaxona', level: 5 },
          { code: 'J01DD02', label: 'ceftazidima', level: 5 },
          { code: 'J01DD08', label: 'cefixima', level: 5 },
        ]},
        { code: 'J01DE', label: 'Cefalosporinas 4.ª gen.', level: 4, children: [
          { code: 'J01DE01', label: 'cefepima', level: 5 },
        ]},
        { code: 'J01DH', label: 'Carbapenems', level: 4, children: [
          { code: 'J01DH02', label: 'meropenem', level: 5 },
          { code: 'J01DH51', label: 'imipenem + cilastatina', level: 5 },
        ]},
      ]},
      { code: 'J01F', label: 'Macrólidos y lincosamidas', level: 3, children: [
        { code: 'J01FA', label: 'Macrólidos', level: 4, children: [
          { code: 'J01FA10', label: 'azitromicina', level: 5 },
          { code: 'J01FA09', label: 'claritromicina', level: 5 },
          { code: 'J01FA01', label: 'eritromicina', level: 5 },
        ]},
        { code: 'J01FF', label: 'Lincosamidas', level: 4, children: [
          { code: 'J01FF01', label: 'clindamicina', level: 5 },
        ]},
      ]},
      { code: 'J01G', label: 'Aminoglucósidos', level: 3, children: [
        { code: 'J01GB', label: 'Otros aminoglucósidos', level: 4, children: [
          { code: 'J01GB06', label: 'amikacina', level: 5 },
          { code: 'J01GB03', label: 'gentamicina', level: 5 },
        ]},
      ]},
      { code: 'J01M', label: 'Quinolonas', level: 3, children: [
        { code: 'J01MA', label: 'Fluoroquinolonas', level: 4, children: [
          { code: 'J01MA02', label: 'ciprofloxacino', level: 5 },
          { code: 'J01MA12', label: 'levofloxacino', level: 5 },
          { code: 'J01MA14', label: 'moxifloxacino', level: 5 },
        ]},
      ]},
      { code: 'J01X', label: 'Otros antibacterianos', level: 3, children: [
        { code: 'J01XA', label: 'Glucopéptidos', level: 4, children: [
          { code: 'J01XA01', label: 'vancomicina', level: 5 },
        ]},
        { code: 'J01XD', label: 'Imidazoles', level: 4, children: [
          { code: 'J01XD01', label: 'metronidazol', level: 5 },
        ]},
      ]},
    ]},
    { code: 'J02', label: 'Antimicóticos sistémicos', level: 2, children: [
      { code: 'J02A', label: 'Antimicóticos sistémicos', level: 3, children: [
        { code: 'J02AB', label: 'Imidazoles', level: 4, children: [
          { code: 'J02AB02', label: 'ketoconazol', level: 5 },
        ]},
        { code: 'J02AC', label: 'Triazoles', level: 4, children: [
          { code: 'J02AC01', label: 'fluconazol', level: 5 },
          { code: 'J02AC02', label: 'itraconazol', level: 5 },
          { code: 'J02AC03', label: 'voriconazol', level: 5 },
        ]},
      ]},
    ]},
    { code: 'J05', label: 'Antivirales sistémicos', level: 2, children: [
      { code: 'J05A', label: 'Antivirales directos', level: 3, children: [
        { code: 'J05AB', label: 'Nucleósidos y nucleótidos', level: 4, children: [
          { code: 'J05AB01', label: 'aciclovir', level: 5 },
          { code: 'J05AB14', label: 'valganciclovir', level: 5 },
        ]},
        { code: 'J05AE', label: 'Inhibidores proteasa', level: 4, children: [
          { code: 'J05AE10', label: 'atazanavir', level: 5 },
        ]},
        { code: 'J05AF', label: 'Inhibidores transcriptasa inversa', level: 4, children: [
          { code: 'J05AF07', label: 'tenofovir', level: 5 },
          { code: 'J05AF09', label: 'emtricitabina', level: 5 },
        ]},
      ]},
    ]},
  ]},

  { code: 'L', label: 'Antineoplásicos e inmunomoduladores', level: 1, children: [
    { code: 'L01', label: 'Antineoplásicos', level: 2, children: [
      { code: 'L01B', label: 'Antimetabolitos', level: 3, children: [
        { code: 'L01BA', label: 'Análogos ácido fólico', level: 4, children: [
          { code: 'L01BA01', label: 'metotrexato', level: 5 },
        ]},
        { code: 'L01BC', label: 'Análogos pirimidina', level: 4, children: [
          { code: 'L01BC02', label: 'fluorouracilo', level: 5 },
          { code: 'L01BC06', label: 'capecitabina', level: 5 },
        ]},
      ]},
      { code: 'L01E', label: 'Inhibidores protein quinasa', level: 3, children: [
        { code: 'L01EB', label: 'Inhibidores EGFR', level: 4, children: [
          { code: 'L01EB01', label: 'gefitinib', level: 5 },
          { code: 'L01EB02', label: 'erlotinib', level: 5 },
        ]},
      ]},
    ]},
    { code: 'L04', label: 'Inmunosupresores', level: 2, children: [
      { code: 'L04A', label: 'Inmunosupresores', level: 3, children: [
        { code: 'L04AA', label: 'Inmunosupresores selectivos', level: 4, children: [
          { code: 'L04AA06', label: 'micofenolato', level: 5 },
          { code: 'L04AA10', label: 'sirolimus', level: 5 },
        ]},
        { code: 'L04AD', label: 'Inhibidores calcineurina', level: 4, children: [
          { code: 'L04AD01', label: 'ciclosporina', level: 5 },
          { code: 'L04AD02', label: 'tacrolimus', level: 5 },
        ]},
      ]},
    ]},
  ]},

  { code: 'M', label: 'Sistema musculoesquelético', level: 1, children: [
    { code: 'M01', label: 'Antiinflamatorios', level: 2, children: [
      { code: 'M01A', label: 'AINE', level: 3, children: [
        { code: 'M01AB', label: 'Derivados ácido acético', level: 4, children: [
          { code: 'M01AB05', label: 'diclofenaco', level: 5 },
          { code: 'M01AB08', label: 'etodolaco', level: 5 },
        ]},
        { code: 'M01AE', label: 'Derivados ácido propiónico', level: 4, children: [
          { code: 'M01AE01', label: 'ibuprofeno', level: 5 },
          { code: 'M01AE02', label: 'naproxeno', level: 5 },
          { code: 'M01AE03', label: 'ketoprofeno', level: 5 },
        ]},
        { code: 'M01AH', label: 'Coxibs', level: 4, children: [
          { code: 'M01AH01', label: 'celecoxib', level: 5 },
        ]},
      ]},
    ]},
    { code: 'M04', label: 'Antigotosos', level: 2, children: [
      { code: 'M04A', label: 'Antigotosos', level: 3, children: [
        { code: 'M04AA', label: 'Inhibidores xantino oxidasa', level: 4, children: [
          { code: 'M04AA01', label: 'alopurinol', level: 5 },
          { code: 'M04AA03', label: 'febuxostat', level: 5 },
        ]},
      ]},
    ]},
  ]},

  { code: 'N', label: 'Sistema nervioso', level: 1, children: [
    { code: 'N02', label: 'Analgésicos', level: 2, children: [
      { code: 'N02A', label: 'Opioides', level: 3, children: [
        { code: 'N02AA', label: 'Alcaloides opio naturales', level: 4, children: [
          { code: 'N02AA01', label: 'morfina', level: 5 },
          { code: 'N02AA05', label: 'oxicodona', level: 5 },
        ]},
        { code: 'N02AX', label: 'Otros opioides', level: 4, children: [
          { code: 'N02AX02', label: 'tramadol', level: 5 },
          { code: 'N02AX06', label: 'tapentadol', level: 5 },
        ]},
      ]},
      { code: 'N02B', label: 'Analgésicos no opioides', level: 3, children: [
        { code: 'N02BE', label: 'Anilidas', level: 4, children: [
          { code: 'N02BE01', label: 'paracetamol', level: 5 },
        ]},
      ]},
    ]},
    { code: 'N03', label: 'Antiepilépticos', level: 2, children: [
      { code: 'N03A', label: 'Antiepilépticos', level: 3, children: [
        { code: 'N03AB', label: 'Derivados hidantoína', level: 4, children: [
          { code: 'N03AB02', label: 'fenitoína', level: 5 },
        ]},
        { code: 'N03AF', label: 'Derivados carboxamida', level: 4, children: [
          { code: 'N03AF01', label: 'carbamazepina', level: 5 },
          { code: 'N03AF02', label: 'oxcarbazepina', level: 5 },
        ]},
        { code: 'N03AX', label: 'Otros antiepilépticos', level: 4, children: [
          { code: 'N03AX16', label: 'pregabalina', level: 5 },
          { code: 'N03AX14', label: 'levetiracetam', level: 5 },
          { code: 'N03AX12', label: 'gabapentina', level: 5 },
        ]},
      ]},
    ]},
    { code: 'N05', label: 'Psicolépticos', level: 2, children: [
      { code: 'N05A', label: 'Antipsicóticos', level: 3, children: [
        { code: 'N05AH', label: 'Diazepinas, oxazepinas', level: 4, children: [
          { code: 'N05AH03', label: 'olanzapina', level: 5 },
          { code: 'N05AH04', label: 'quetiapina', level: 5 },
        ]},
        { code: 'N05AX', label: 'Otros antipsicóticos', level: 4, children: [
          { code: 'N05AX08', label: 'risperidona', level: 5 },
          { code: 'N05AX13', label: 'aripiprazol', level: 5 },
        ]},
      ]},
      { code: 'N05B', label: 'Ansiolíticos', level: 3, children: [
        { code: 'N05BA', label: 'Benzodiazepinas', level: 4, children: [
          { code: 'N05BA01', label: 'diazepam', level: 5 },
          { code: 'N05BA06', label: 'lorazepam', level: 5 },
          { code: 'N05BA12', label: 'alprazolam', level: 5 },
        ]},
      ]},
      { code: 'N05C', label: 'Hipnóticos y sedantes', level: 3, children: [
        { code: 'N05CD', label: 'Benzodiazepinas', level: 4, children: [
          { code: 'N05CD02', label: 'nitrazepam', level: 5 },
          { code: 'N05CD07', label: 'triazolam', level: 5 },
        ]},
      ]},
    ]},
    { code: 'N06', label: 'Psicoanalépticos', level: 2, children: [
      { code: 'N06A', label: 'Antidepresivos', level: 3, children: [
        { code: 'N06AB', label: 'ISRS', level: 4, children: [
          { code: 'N06AB04', label: 'citalopram', level: 5 },
          { code: 'N06AB05', label: 'paroxetina', level: 5 },
          { code: 'N06AB06', label: 'sertralina', level: 5 },
          { code: 'N06AB10', label: 'escitalopram', level: 5 },
          { code: 'N06AB03', label: 'fluoxetina', level: 5 },
        ]},
        { code: 'N06AX', label: 'Otros antidepresivos', level: 4, children: [
          { code: 'N06AX16', label: 'venlafaxina', level: 5 },
          { code: 'N06AX21', label: 'duloxetina', level: 5 },
          { code: 'N06AX11', label: 'mirtazapina', level: 5 },
        ]},
      ]},
    ]},
  ]},

  { code: 'P', label: 'Antiparasitarios, insecticidas y repelentes', level: 1, children: [
    { code: 'P01', label: 'Antiprotozoarios', level: 2, children: [
      { code: 'P01A', label: 'Agentes contra amebiasis', level: 3, children: [
        { code: 'P01AB', label: 'Nitromidazoles', level: 4, children: [
          { code: 'P01AB01', label: 'metronidazol', level: 5 },
          { code: 'P01AB02', label: 'tinidazol', level: 5 },
        ]},
      ]},
      { code: 'P01B', label: 'Antimaláricos', level: 3, children: [
        { code: 'P01BA', label: 'Aminoquinolinas', level: 4, children: [
          { code: 'P01BA01', label: 'cloroquina', level: 5 },
          { code: 'P01BA02', label: 'hidroxicloroquina', level: 5 },
        ]},
        { code: 'P01BC', label: 'Metanolquinolinas', level: 4, children: [
          { code: 'P01BC01', label: 'quinina', level: 5 },
        ]},
      ]},
    ]},
    { code: 'P02', label: 'Antihelmínticos', level: 2, children: [
      { code: 'P02C', label: 'Antinematodos', level: 3, children: [
        { code: 'P02CA', label: 'Benzimidazoles', level: 4, children: [
          { code: 'P02CA03', label: 'albendazol', level: 5 },
          { code: 'P02CA01', label: 'mebendazol', level: 5 },
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
          { code: 'R03AC18', label: 'indacaterol', level: 5 },
        ]},
      ]},
      { code: 'R03B', label: 'Corticoides inhalados', level: 3, children: [
        { code: 'R03BA', label: 'Glucocorticoides', level: 4, children: [
          { code: 'R03BA01', label: 'budesonida', level: 5 },
          { code: 'R03BA05', label: 'fluticasona', level: 5 },
          { code: 'R03BA08', label: 'ciclesonida', level: 5 },
        ]},
      ]},
      { code: 'R03D', label: 'Otros antiasmáticos sistémicos', level: 3, children: [
        { code: 'R03DA', label: 'Xantinas', level: 4, children: [
          { code: 'R03DA04', label: 'teofilina', level: 5 },
          { code: 'R03DA05', label: 'aminofilina', level: 5 },
        ]},
      ]},
    ]},
    { code: 'R05', label: 'Preparados para tos y resfriado', level: 2, children: [
      { code: 'R05C', label: 'Expectorantes', level: 3, children: [
        { code: 'R05CB', label: 'Mucolíticos', level: 4, children: [
          { code: 'R05CB06', label: 'ambroxol', level: 5 },
          { code: 'R05CB01', label: 'acetilcisteína', level: 5 },
        ]},
      ]},
      { code: 'R05D', label: 'Antitusivos', level: 3, children: [
        { code: 'R05DA', label: 'Alcaloides opio', level: 4, children: [
          { code: 'R05DA09', label: 'codeína', level: 5 },
        ]},
      ]},
    ]},
  ]},

  { code: 'S', label: 'Órganos de los sentidos', level: 1, children: [
    { code: 'S01', label: 'Oftalmología', level: 2, children: [
      { code: 'S01E', label: 'Antiglaucomatosos', level: 3, children: [
        { code: 'S01EB', label: 'Parasimpaticomiméticos', level: 4, children: [
          { code: 'S01EB01', label: 'pilocarpina', level: 5 },
        ]},
        { code: 'S01ED', label: 'Betabloqueantes', level: 4, children: [
          { code: 'S01ED01', label: 'timolol', level: 5 },
        ]},
        { code: 'S01EE', label: 'Análogos prostaglandinas', level: 4, children: [
          { code: 'S01EE01', label: 'latanoprost', level: 5 },
          { code: 'S01EE03', label: 'bimatoprost', level: 5 },
        ]},
      ]},
      { code: 'S01G', label: 'Descongestionantes y antialérgicos', level: 3, children: [
        { code: 'S01GX', label: 'Otros antialérgicos', level: 4, children: [
          { code: 'S01GX01', label: 'cromoglicato', level: 5 },
        ]},
      ]},
    ]},
    { code: 'S02', label: 'Otología', level: 2, children: [
      { code: 'S02C', label: 'Corticosteroides + antiinfecciosos', level: 3, children: [
        { code: 'S02CA', label: 'Corticosteroides + antibióticos', level: 4, children: [
          { code: 'S02CA05', label: 'ciprofloxacino + dexametasona', level: 5 },
        ]},
      ]},
    ]},
  ]},

  { code: 'V', label: 'Varios', level: 1, children: [
    { code: 'V03', label: 'Otros productos terapéuticos', level: 2, children: [
      { code: 'V03A', label: 'Otros productos terapéuticos', level: 3, children: [
        { code: 'V03AB', label: 'Antídotos', level: 4, children: [
          { code: 'V03AB23', label: 'acetilcisteína (antídoto)', level: 5 },
          { code: 'V03AB14', label: 'protamina', level: 5 },
        ]},
        { code: 'V03AE', label: 'Quelantes fósforo', level: 4, children: [
          { code: 'V03AE02', label: 'sevelamer', level: 5 },
        ]},
      ]},
    ]},
    { code: 'V04', label: 'Diagnóstico', level: 2, children: [
      { code: 'V04C', label: 'Otros diagnósticos', level: 3, children: [
        { code: 'V04CG', label: 'Pruebas función pancreática', level: 4, children: [
          { code: 'V04CG30', label: 'glucosa', level: 5 },
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
