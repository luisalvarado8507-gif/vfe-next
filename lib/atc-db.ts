// Base de datos ATC-WHO completa con descripciones niveles 1-5
// Fuente: WHO Collaborating Centre for Drug Statistics Methodology
// https://www.whocc.no/atc_ddd_index/

export const ATC_L1: Record<string, string> = {
  A: 'Tracto alimentario y metabolismo',
  B: 'Sangre y órganos hematopoyéticos',
  C: 'Sistema cardiovascular',
  D: 'Dermatológicos',
  G: 'Sistema genitourinario y hormonas sexuales',
  H: 'Preparados hormonales sistémicos',
  J: 'Antiinfecciosos para uso sistémico',
  L: 'Agentes antineoplásicos e inmunomoduladores',
  M: 'Sistema musculoesquelético',
  N: 'Sistema nervioso',
  P: 'Antiparasitarios, insecticidas y repelentes',
  R: 'Sistema respiratorio',
  S: 'Órganos de los sentidos',
  V: 'Varios',
};

export const ATC_L2: Record<string, string> = {
  A01:'Stomatological preparations', A02:'Drugs for acid related disorders',
  A03:'Drugs for functional GI disorders', A04:'Antiemetics and antinauseants',
  A05:'Bile and liver therapy', A06:'Drugs for constipation',
  A07:'Antidiarrheals, intestinal antiinflammatories', A08:'Antiobesity preparations',
  A09:'Digestives incl. enzymes', A10:'Drugs used in diabetes',
  A11:'Vitamins', A12:'Mineral supplements', A13:'Tonics',
  A14:'Anabolic agents for systemic use', A16:'Other alimentary tract products',
  B01:'Antithrombotic agents', B02:'Antihemorrhagics',
  B03:'Antianemic preparations', B05:'Blood substitutes and perfusion solutions',
  B06:'Other hematological agents',
  C01:'Cardiac therapy', C02:'Antihypertensives', C03:'Diuretics',
  C04:'Peripheral vasodilators', C05:'Vasoprotectives',
  C07:'Beta blocking agents', C08:'Calcium channel blockers',
  C09:'Agents acting on the renin-angiotensin system', C10:'Lipid modifying agents',
  D01:'Antifungals for dermatological use', D02:'Emollients and protectives',
  D03:'Preparations for wounds and ulcers', D04:'Antipruritics',
  D05:'Antipsoriatics', D06:'Antibiotics for dermatological use',
  D07:'Corticosteroids, dermatological', D08:'Antiseptics and disinfectants',
  D10:'Anti-acne preparations', D11:'Other dermatological preparations',
  G01:'Gynecological antiinfectives', G02:'Other gynecologicals',
  G03:'Sex hormones and modulators', G04:'Urologicals',
  H01:'Pituitary and hypothalamic hormones', H02:'Corticosteroids for systemic use',
  H03:'Thyroid therapy', H04:'Pancreatic hormones', H05:'Calcium homeostasis',
  J01:'Antibacterials for systemic use', J02:'Antimycotics for systemic use',
  J04:'Antimycobacterials', J05:'Antivirals for systemic use',
  J06:'Immune sera and immunoglobulins', J07:'Vaccines',
  L01:'Antineoplastic agents', L02:'Endocrine therapy',
  L03:'Immunostimulants', L04:'Immunosuppressants',
  M01:'Antiinflammatory and antirheumatic products',
  M02:'Topical products for joint and muscular pain',
  M03:'Muscle relaxants', M04:'Antigout preparations',
  M05:'Drugs for bone diseases',
  N01:'Anesthetics', N02:'Analgesics', N03:'Antiepileptics',
  N04:'Anti-parkinson drugs', N05:'Psycholeptics',
  N06:'Psychoanaleptics', N07:'Other nervous system drugs',
  P01:'Antiprotozoals', P02:'Anthelmintics', P03:'Ectoparasiticides',
  R01:'Nasal preparations', R02:'Throat preparations',
  R03:'Drugs for obstructive airway diseases',
  R05:'Cough and cold preparations', R06:'Antihistamines for systemic use',
  S01:'Ophthalmologicals', S02:'Otologicals',
  V01:'Allergens', V03:'All other therapeutic products',
  V04:'Diagnostic agents', V06:'General nutrients', V08:'Contrast media',
};

export const ATC_L3: Record<string, string> = {
  // C09 - Renin-angiotensin
  C09A:'ACE inhibitors, plain', C09B:'ACE inhibitors, combinations',
  C09C:'Angiotensin II receptor blockers (ARBs), plain',
  C09D:'Angiotensin II receptor blockers (ARBs), combinations',
  C09X:'Other agents acting on renin-angiotensin system',
  // C07 - Beta blockers
  C07A:'Beta blocking agents, plain', C07B:'Beta blocking agents and thiazides',
  C07C:'Beta blocking agents and other diuretics',
  C07D:'Beta blocking agents, thiazides and other diuretics',
  C07F:'Beta blocking agents and other antihypertensives',
  // C08 - Calcium channel blockers
  C08C:'Selective calcium channel blockers with mainly vascular effects',
  C08D:'Selective calcium channel blockers with direct cardiac effects',
  C08E:'Non-selective calcium channel blockers',
  C08G:'Calcium channel blockers and diuretics',
  // C10 - Lipid modifying
  C10A:'Cholesterol and triglyceride regulating preparations, plain',
  C10B:'Cholesterol and triglyceride regulating preparations, combinations',
  // C03 - Diuretics
  C03A:'Low-ceiling diuretics, thiazides', C03B:'Low-ceiling diuretics, excl. thiazides',
  C03C:'High-ceiling diuretics', C03D:'Potassium-sparing agents',
  C03E:'Diuretics and potassium-sparing agents', C03X:'Other diuretics',
  // A10 - Diabetes
  A10A:'Insulins and analogues', A10B:'Blood glucose lowering drugs, excl. insulins',
  A10X:'Other drugs used in diabetes',
  // J01 - Antibacterials
  J01A:'Tetracyclines', J01B:'Amphenicols',
  J01C:'Beta-lactam antibacterials, penicillins',
  J01D:'Other beta-lactam antibacterials',
  J01E:'Sulfonamides and trimethoprim',
  J01F:'Macrolides, lincosamides and streptogramins',
  J01G:'Aminoglycoside antibacterials',
  J01M:'Quinolone antibacterials',
  J01X:'Other antibacterials',
  // N02 - Analgesics
  N02A:'Opioids', N02B:'Other analgesics and antipyretics', N02C:'Antimigraine preparations',
  // N05 - Psycholeptics
  N05A:'Antipsychotics', N05B:'Anxiolytics', N05C:'Hypnotics and sedatives',
  // N06 - Psychoanaleptics
  N06A:'Antidepressants', N06B:'Psychostimulants, agents used for ADHD',
  N06C:'Psycholeptics and psychoanaleptics', N06D:'Anti-dementia drugs',
  // M01 - Antiinflammatory
  M01A:'Antiinflammatory and antirheumatic products, non-steroids',
  M01B:'Antiinflammatory/antirheumatic agents with corticosteroids',
  M01C:'Specific antirheumatic agents',
  // R03 - Airway
  R03A:'Adrenergics, inhalants', R03B:'Other drugs for obstructive airway diseases, inhalants',
  R03C:'Adrenergics for systemic use', R03D:'Other systemic drugs for obstructive airway diseases',
  // H03 - Thyroid
  H03A:'Thyroid preparations', H03B:'Antithyroid preparations', H03C:'Iodine therapy',
};

export const ATC_L4: Record<string, string> = {
  // C09C - ARBs plain
  C09CA:'Losartan and combinations', C09CB:'Valsartan and combinations',
  C09CC:'Irbesartan and combinations', C09CD:'Candesartan and combinations',
  C09CE:'Eprosartan and combinations', C09CF:'Olmesartan medoxomil',
  C09CG:'Telmisartan', C09CX:'Other angiotensin II antagonists',
  // C09D - ARBs combinations
  C09DA:'Angiotensin II receptor blockers and diuretics',
  C09DB:'Angiotensin II receptor blockers and calcium channel blockers',
  C09DX:'Angiotensin II receptor blockers, other combinations',
  // C09A - ACE inhibitors
  C09AA:'ACE inhibitors, plain',
  C09BA:'ACE inhibitors and diuretics',
  C09BB:'ACE inhibitors and calcium channel blockers',
  C09BX:'ACE inhibitors, other combinations',
  // C08C - DHP calcium blockers
  C08CA:'Dihydropyridine derivatives',
  C08CX:'Other selective calcium channel blockers with vascular effects',
  // C10A - Statins
  C10AA:'HMG CoA reductase inhibitors', C10AB:'Fibrates',
  C10AC:'Bile acid sequestrants', C10AD:'Nicotinic acid and derivatives',
  C10AX:'Other cholesterol and triglyceride regulating preparations',
  // C10B - Combinations
  C10BA:'HMG CoA reductase inhibitors in combination with other lipid modifying agents',
  C10BX:'HMG CoA reductase inhibitors, other combinations',
  // A10B - Oral antidiabetics
  A10BA:'Biguanides', A10BB:'Sulfonylureas', A10BC:'Sulfonamides, urea derivatives',
  A10BD:'Combinations of oral blood glucose lowering drugs',
  A10BF:'Alpha glucosidase inhibitors', A10BG:'Thiazolidinediones',
  A10BH:'Dipeptidyl peptidase 4 (DPP-4) inhibitors',
  A10BJ:'Glucagon-like peptide-1 (GLP-1) analogues',
  A10BK:'Sodium-glucose co-transporter 2 (SGLT2) inhibitors',
  A10BX:'Other blood glucose lowering drugs',
  // J01C - Penicillins
  J01CA:'Extended-spectrum penicillins', J01CE:'Beta-lactamase sensitive penicillins',
  J01CF:'Beta-lactamase resistant penicillins', J01CG:'Beta-lactamase inhibitors',
  J01CR:'Combinations of penicillins',
  // J01D - Other beta-lactams
  J01DB:'First-generation cephalosporins', J01DC:'Second-generation cephalosporins',
  J01DD:'Third-generation cephalosporins', J01DE:'Fourth-generation cephalosporins',
  J01DF:'Monobactams', J01DH:'Carbapenems', J01DI:'Fifth-generation cephalosporins',
  // N02B - Other analgesics
  N02BA:'Salicylic acid and derivatives', N02BB:'Pyrazolones',
  N02BE:'Anilides', N02BG:'Other analgesics and antipyretics',
  // N05A - Antipsychotics
  N05AA:'Phenothiazines with aliphatic side-chain',
  N05AB:'Phenothiazines with piperazine structure',
  N05AC:'Phenothiazines with piperidine structure',
  N05AD:'Butyrophenone derivatives', N05AE:'Indole derivatives',
  N05AF:'Thioxanthene derivatives', N05AG:'Diphenylbutylpiperidine derivatives',
  N05AH:'Diazepines, oxazepines, thiazepines and oxepines',
  N05AL:'Benzamides', N05AN:'Lithium', N05AX:'Other antipsychotics',
  // N06A - Antidepressants
  N06AA:'Non-selective monoamine reuptake inhibitors',
  N06AB:'Selective serotonin reuptake inhibitors (SSRIs)',
  N06AG:'Monoamine oxidase A inhibitors', N06AX:'Other antidepressants',
};

export const ATC_L5: Record<string, string> = {
  // C09DA - ARBs + diuretics
  C09DA01:'Losartan and diuretics', C09DA02:'Eprosartan and diuretics',
  C09DA03:'Valsartan and diuretics', C09DA04:'Irbesartan and diuretics',
  C09DA06:'Candesartan and diuretics', C09DA07:'Telmisartan and diuretics',
  C09DA08:'Olmesartan medoxomil and diuretics',
  // C09DB - ARBs + calcium channel blockers
  C09DB01:'Valsartan and amlodipine', C09DB02:'Olmesartan medoxomil and amlodipine',
  C09DB04:'Telmisartan and amlodipine', C09DB05:'Irbesartan and amlodipine',
  C09DB06:'Candesartan and amlodipine', C09DB07:'Candesartan and amlodipino',
  // C08CA - Dihydropyridines
  C08CA01:'Amlodipine', C08CA02:'Felodipine', C08CA03:'Isradipine',
  C08CA04:'Nicardipine', C08CA05:'Nifedipine', C08CA06:'Nimodipine',
  C08CA07:'Nisoldipine', C08CA08:'Nitrendipine', C08CA09:'Lacidipine',
  C08CA10:'Nilvadipine', C08CA13:'Lercanidipine', C08CA55:'Nifedipine and atenolol',
  // C10AA - Statins
  C10AA01:'Simvastatin', C10AA02:'Lovastatin', C10AA03:'Pravastatin',
  C10AA04:'Fluvastatin', C10AA05:'Atorvastatin', C10AA06:'Cerivastatin',
  C10AA07:'Rosuvastatin', C10AA08:'Pitavastatin',
  // A10BA - Biguanides
  A10BA01:'Phenformin', A10BA02:'Metformin', A10BA03:'Buformin',
  // A10BB - Sulfonylureas
  A10BB01:'Glibenclamide', A10BB03:'Tolbutamide', A10BB07:'Glipizide',
  A10BB09:'Gliclazide', A10BB12:'Glimepiride',
  // A10BH - DPP4 inhibitors
  A10BH01:'Sitagliptin', A10BH02:'Vildagliptin', A10BH03:'Saxagliptin',
  A10BH04:'Alogliptin', A10BH05:'Linagliptin', A10BH06:'Trelagliptin',
  A10BH07:'Omarigliptin',
  // A10BJ - GLP-1
  A10BJ01:'Exenatide', A10BJ02:'Liraglutide', A10BJ03:'Lixisenatide',
  A10BJ04:'Albiglutide', A10BJ05:'Dulaglutide', A10BJ06:'Semaglutide',
  A10BJ07:'Efpeglenatide',
  // A10BK - SGLT2
  A10BK01:'Dapagliflozin', A10BK02:'Canagliflozin', A10BK03:'Empagliflozin',
  A10BK04:'Ertugliflozin',
  // N02BE - Anilides
  N02BE01:'Paracetamol (acetaminophen)', N02BE05:'Phenazone',
  N02BE71:'Paracetamol, combinations excl. psycholeptics',
  // N02BA - Salicylates
  N02BA01:'Acetylsalicylic acid', N02BA03:'Aloxiprin',
  N02BA51:'Acetylsalicylic acid, combinations excl. psycholeptics',
  N02BA71:'Acetylsalicylic acid, combinations with psycholeptics',
  // N06AB - SSRIs
  N06AB03:'Fluoxetine', N06AB04:'Citalopram', N06AB05:'Paroxetine',
  N06AB06:'Sertraline', N06AB08:'Fluvoxamine', N06AB10:'Escitalopram',
  // J01CA - Aminopenicillins
  J01CA01:'Ampicillin', J01CA04:'Amoxicillin', J01CA12:'Pivampicillin',
  // J01CR - Combinations
  J01CR02:'Amoxicillin and enzyme inhibitor', J01CR05:'Ampicillin and enzyme inhibitor',
  // J01DD - 3rd gen cephalosporins
  J01DD01:'Cefotaxime', J01DD02:'Ceftazidime', J01DD03:'Cefsulodin',
  J01DD04:'Ceftriaxone', J01DD08:'Cefixime', J01DD14:'Cefpodoxime',
  J01DD15:'Ceftibuten',
  // M01AE - Propionic acid derivatives
  M01AE01:'Ibuprofen', M01AE02:'Naproxen', M01AE03:'Ketoprofen',
  M01AE14:'Dexibuprofen', M01AE17:'Dexketoprofen',
  // H03AA - Thyroid hormones
  H03AA01:'Levothyroxine sodium', H03AA02:'Liothyronine sodium',
  // H03BA - Antithyroid
  H03BA01:'Carbimazole', H03BA02:'Propylthiouracil', H03BA03:'Methimazole',
};

// Función para obtener descripción completa de un código ATC
export function getATCDescription(code: string): {
  code: string;
  level: number;
  description: string;
} | null {
  if (!code || code.length < 1) return null;
  const c = code.toUpperCase().trim();
  
  if (c.length >= 7 && ATC_L5[c.substring(0,7)]) {
    return { code: c.substring(0,7), level: 5, description: ATC_L5[c.substring(0,7)] };
  }
  if (c.length >= 5 && ATC_L4[c.substring(0,5)]) {
    return { code: c.substring(0,5), level: 4, description: ATC_L4[c.substring(0,5)] };
  }
  if (c.length >= 4 && ATC_L3[c.substring(0,4)]) {
    return { code: c.substring(0,4), level: 3, description: ATC_L3[c.substring(0,4)] };
  }
  if (c.length >= 3 && ATC_L2[c.substring(0,3)]) {
    return { code: c.substring(0,3), level: 2, description: ATC_L2[c.substring(0,3)] };
  }
  if (c.length >= 1 && ATC_L1[c[0]]) {
    return { code: c[0], level: 1, description: ATC_L1[c[0]] };
  }
  return null;
}

// Función para obtener jerarquía completa
export function getATCHierarchy(code: string): Array<{
  code: string; level: number; description: string;
}> {
  if (!code) return [];
  const c = code.toUpperCase().trim();
  const levels = [];
  
  if (c[0] && ATC_L1[c[0]])
    levels.push({ code: c[0], level: 1, description: ATC_L1[c[0]] });
  if (c.length >= 3 && ATC_L2[c.substring(0,3)])
    levels.push({ code: c.substring(0,3), level: 2, description: ATC_L2[c.substring(0,3)] });
  if (c.length >= 4 && ATC_L3[c.substring(0,4)])
    levels.push({ code: c.substring(0,4), level: 3, description: ATC_L3[c.substring(0,4)] });
  if (c.length >= 5 && ATC_L4[c.substring(0,5)])
    levels.push({ code: c.substring(0,5), level: 4, description: ATC_L4[c.substring(0,5)] });
  if (c.length >= 7 && ATC_L5[c.substring(0,7)])
    levels.push({ code: c.substring(0,7), level: 5, description: ATC_L5[c.substring(0,7)] });
  
  return levels;
}
