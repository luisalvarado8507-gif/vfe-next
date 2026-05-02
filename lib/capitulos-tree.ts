export interface SubCapitulo {
  id: string;
  name: string;
  subs: SubCapitulo[];
}
export interface CapituloTree {
  id: string;
  n: string;
  name: string;
  subs: SubCapitulo[];
}

export const CHAPS: CapituloTree[] = [
  {
    id: 'c01', n: '01', name: 'Sistema Cardiovascular',
    subs: [
      { id: 's0101', name: 'Evaluación y manejo del riesgo cardiovascular', subs: [] },
      { id: 's0102', name: 'Hipertensión', subs: [
        { id: 's010201', name: 'Bloqueadores alfa adrenérgicos', subs: [] },
        { id: 's010202', name: 'Vasodilatadores', subs: [] },
        { id: 's010203', name: 'Antihipertensivos combinados', subs: [
          { id: 's01020301', name: 'Betabloqueador + diurético', subs: [] },
          { id: 's01020302', name: 'Betabloqueador + antagonista del calcio', subs: [] },
          { id: 's01020303', name: 'IECA + diurético', subs: [] },
          { id: 's01020304', name: 'ARA II + diurético', subs: [] },
          { id: 's01020305', name: 'Antagonista del calcio + IECA', subs: [] },
          { id: 's01020306', name: 'Antagonista del calcio + ARA II', subs: [] },
          { id: 's01020307', name: 'Antagonista del calcio + ARA II + diurético', subs: [] },
        ]},
      ]},
      { id: 's0103', name: 'Angina de pecho', subs: [
        { id: 's010301', name: 'Nitratos', subs: [] },
        { id: 's010302', name: 'Otros fármacos utilizados en la angina de pecho', subs: [] },
      ]},
      { id: 's0104', name: 'Insuficiencia cardiaca', subs: [
        { id: 's010401', name: 'Glucósidos digitálicos', subs: [] },
        { id: 's010402', name: 'Complejo sacubitril/valsartán', subs: [] },
      ]},
      { id: 's0105', name: 'Diuréticos', subs: [
        { id: 's010501', name: 'Diuréticos que aumentan la pérdida de potasio', subs: [] },
        { id: 's010502', name: 'Diuréticos ahorradores de potasio', subs: [] },
      ]},
      { id: 's0106', name: 'Betabloqueadores', subs: [] },
      { id: 's0107', name: 'Antagonistas de los canales de calcio', subs: [
        { id: 's010701', name: 'Dihidropiridinas', subs: [] },
        { id: 's010702', name: 'Diltiazem y verapamilo', subs: [] },
      ]},
      { id: 's0108', name: 'Medicamentos que actúan sobre el sistema renina angiotensina', subs: [
        { id: 's010801', name: 'Inhibidores de la enzima convertidora de angiotensina (IECA)', subs: [] },
        { id: 's010802', name: 'Antagonistas de los receptores de angiotensina II (ARA II)', subs: [] },
      ]},
      { id: 's0109', name: 'Antiarrítmicos', subs: [
        { id: 's010901', name: 'Antiarrítmicos supraventriculares', subs: [] },
        { id: 's010902', name: 'Antiarrítmicos ventriculares', subs: [] },
        { id: 's010903', name: 'Antiarrítmicos para arritmias ventriculares y supraventriculares', subs: [] },
      ]},
      { id: 's0110', name: 'Hipolipemiantes', subs: [
        { id: 's011001', name: 'Estatinas', subs: [] },
        { id: 's011002', name: 'Fibratos', subs: [] },
        { id: 's011003', name: 'Ezetimiba', subs: [] },
        { id: 's011004', name: 'Ácidos grasos omega-3', subs: [] },
        { id: 's011005', name: 'Combinaciones', subs: [] },
      ]},
    ]
  },
  {
    id: 'c02', n: '02', name: 'Sangre y Coagulación',
    subs: [
      { id: 's0201', name: 'Antitrombóticos', subs: [
        { id: 's020101', name: 'Antiagregantes', subs: [] },
        { id: 's020102', name: 'Anticoagulantes', subs: [] },
        { id: 's020103', name: 'Trombolíticos', subs: [] },
      ]},
      { id: 's0202', name: 'Antihemorrágicos', subs: [
        { id: 's020201', name: 'Antifibrinolíticos: ácido tranexámico', subs: [] },
        { id: 's020202', name: 'Etamsilato', subs: [] },
      ]},
      { id: 's0203', name: 'Medicamentos para la hematopoyesis', subs: [
        { id: 's020301', name: 'Medicamentos para la anemia', subs: [] },
      ]},
    ]
  },
  {
    id: 'c03', n: '03', name: 'Sistema Gastrointestinal',
    subs: [
      { id: 's0301', name: 'Patología gastroduodenal', subs: [
        { id: 's030101', name: 'Inhibidores de la secreción de ácido gástrico', subs: [] },
        { id: 's030102', name: 'Antiácidos', subs: [] },
        { id: 's030103', name: 'Otros: sucralfato y simeticona/dimeticona', subs: [] },
      ]},
      { id: 's0302', name: 'Antiespasmódicos', subs: [
        { id: 's030201', name: 'Antiespasmódicos musculotropos', subs: [] },
        { id: 's030202', name: 'Antiespasmódicos anticolinérgicos', subs: [] },
      ]},
      { id: 's0303', name: 'Antieméticos', subs: [
        { id: 's030301', name: 'Metoclopramida y domperidona', subs: [] },
        { id: 's030302', name: 'Antagonistas de los receptores 5HT3', subs: [] },
        { id: 's030303', name: 'Antagonistas NK1', subs: [] },
        { id: 's030304', name: 'Otros', subs: [] },
      ]},
      { id: 's0304', name: 'Medicamentos usados en la diarrea', subs: [
        { id: 's030401', name: 'Sales de rehidratación oral (SRO)', subs: [] },
        { id: 's030402', name: 'Sulfato de zinc', subs: [] },
        { id: 's030403', name: 'Absorbentes', subs: [] },
        { id: 's030404', name: 'Probióticos', subs: [] },
        { id: 's030405', name: 'Inhibidores del tránsito intestinal', subs: [] },
        { id: 's030406', name: 'Antisecretores', subs: [] },
      ]},
    ]
  },
  {
    id: 'c04', n: '04', name: 'Sistema Respiratorio',
    subs: [
      { id: 's0401', name: 'Asma y EPOC', subs: [
        { id: 's040101', name: 'β2 agonistas', subs: [] },
        { id: 's040102', name: 'Anticolinérgicos', subs: [] },
        { id: 's040103', name: 'β2 agonista + anticolinérgico', subs: [] },
        { id: 's040104', name: 'Corticoides inhalados (CI)', subs: [] },
        { id: 's040105', name: 'β2 agonistas de acción prolongada (LABA) + corticoide inhalado (CI)', subs: [] },
        { id: 's040106', name: 'Antagonistas de los receptores de leucotrienos', subs: [] },
        { id: 's040107', name: 'Metilxantinas (teofilina y aminofilina)', subs: [] },
        { id: 's040108', name: 'Omalizumab', subs: [] },
      ]},
      { id: 's0402', name: 'Antitusivos, expectorantes y mucolíticos', subs: [
        { id: 's040201', name: 'Antitusivos', subs: [] },
        { id: 's040202', name: 'Mucolíticos y expectorantes', subs: [] },
        { id: 's040203', name: 'Combinaciones', subs: [] },
      ]},
      { id: 's0403', name: 'Analépticos respiratorios y surfactante pulmonar', subs: [
        { id: 's040301', name: 'Analépticos respiratorios', subs: [] },
        { id: 's040302', name: 'Surfactante pulmonar', subs: [] },
      ]},
    ]
  },
  {
    id: 'c05', n: '05', name: 'Dolor y Fiebre',
    subs: [
      { id: 's0501', name: 'Analgésicos y antipiréticos', subs: [
        { id: 's050101', name: 'Paracetamol (acetaminofén)', subs: [] },
        { id: 's050102', name: 'Ácido acetilsalicílico', subs: [] },
        { id: 's050103', name: 'Metamizol (dipirona)', subs: [] },
        { id: 's050104', name: 'Combinaciones', subs: [] },
      ]},
      { id: 's0502', name: 'Analgésicos Opioides', subs: [
        { id: 's050201', name: 'Preparados no combinados', subs: [] },
        { id: 's050202', name: 'Combinaciones', subs: [] },
      ]},
      { id: 's0503', name: 'Principios generales del manejo del dolor en cuidados paliativos', subs: [] },
    ]
  },
  {
    id: 'c06', n: '06', name: 'Patología Osteoarticular',
    subs: [
      { id: 's0601', name: 'Antiinflamatorios no esteroides', subs: [
        { id: 's060101', name: 'AINE de uso sistémico', subs: [] },
        { id: 's060102', name: 'AINE de uso tópico', subs: [] },
      ]},
      { id: 's0602', name: 'Artritis Crónica', subs: [
        { id: 's060201', name: 'Metotrexato', subs: [] },
        { id: 's060202', name: 'Antipalúdicos', subs: [] },
        { id: 's060203', name: 'Leflunomida', subs: [] },
        { id: 's060204', name: 'Rituximab', subs: [] },
      ]},
      { id: 's0603', name: 'Gota', subs: [
        { id: 's060301', name: 'Colchicina', subs: [] },
        { id: 's060302', name: 'Inhibidores de la xantina oxidasa (alopurinol)', subs: [] },
      ]},
      { id: 's0604', name: 'Artrosis', subs: [
        { id: 's060401', name: 'Glucosamina', subs: [] },
        { id: 's060402', name: 'Ácido hialurónico', subs: [] },
      ]},
      { id: 's0605', name: 'Osteoporosis y enfermedad de Paget', subs: [
        { id: 's060501', name: 'Calcio', subs: [] },
        { id: 's060502', name: 'Bifosfonatos', subs: [] },
      ]},
    ]
  },
  {
    id: 'c07', n: '07', name: 'Sistema Hormonal',
    subs: [
      { id: 's0701', name: 'Diabetes', subs: [
        { id: 's070101', name: 'Insulina', subs: [] },
        { id: 's070102', name: 'Metformina', subs: [] },
        { id: 's070103', name: 'Sulfamidas hipoglucemiantes (sulfonilureas)', subs: [] },
        { id: 's070104', name: 'Gliflozinas (Inhibidores del SGLT2)', subs: [] },
        { id: 's070105', name: 'Inhibidores de la DPP-4 (gliptinas)', subs: [] },
        { id: 's070106', name: 'Análogos del GLP-1 (Incretinomiméticos)', subs: [] },
        { id: 's070107', name: 'Combinaciones', subs: [] },
      ]},
      { id: 's0702', name: 'Patología de la tiroides', subs: [
        { id: 's070201', name: 'Hormonas tiroideas', subs: [] },
        { id: 's070202', name: 'Fármacos antitiroideos', subs: [] },
        { id: 's070203', name: 'Yodo', subs: [] },
        { id: 's070204', name: 'Tirotropina alfa', subs: [] },
      ]},
      { id: 's0703', name: 'Corticoides por vía sistémica', subs: [
        { id: 's070301', name: 'Betametasona', subs: [] },
        { id: 's070302', name: 'Dexametasona', subs: [] },
        { id: 's070303', name: 'Hidrocortisona', subs: [] },
        { id: 's070304', name: 'Metilprednisolona', subs: [] },
        { id: 's070305', name: 'Prednisona y prednisolona', subs: [] },
        { id: 's070306', name: 'Deflazacort', subs: [] },
      ]},
    ]
  },
  {
    id: 'c08', n: '08', name: 'Ginecología y Obstetricia',
    subs: [
      { id: 's0801', name: 'Vaginitis', subs: [
        { id: 's080101', name: 'Medicamentos para el tratamiento de la vaginitis', subs: [] },
        { id: 's080102', name: 'Combinaciones', subs: [] },
        { id: 's080103', name: 'Otros medicamentos de uso vaginal', subs: [] },
      ]},
      { id: 's0802', name: 'Anticoncepción', subs: [
        { id: 's080201', name: 'Anticonceptivos combinados (estrógenos + progestágenos)', subs: [] },
        { id: 's080202', name: 'Progestágenos para uso en anticoncepción', subs: [] },
        { id: 's080203', name: 'Anticonceptivos de emergencia', subs: [] },
      ]},
      { id: 's0803', name: 'Menopausia y substitución hormonal', subs: [
        { id: 's080301', name: 'Estrógenos', subs: [] },
        { id: 's080302', name: 'Asociaciones de estrógenos y progestágenos para la menopausia', subs: [] },
        { id: 's080303', name: 'Tibolona', subs: [] },
        { id: 's080304', name: 'Estradiol + ciproterona', subs: [] },
      ]},
      { id: 's0804', name: 'Medicamentos que actúan sobre la motilidad uterina', subs: [
        { id: 's080401', name: 'Uterotónicos', subs: [] },
        { id: 's080402', name: 'Tocolíticos', subs: [] },
      ]},
      { id: 's0805', name: 'Medicamentos para los trastornos hipertensivos del embarazo', subs: [] },
      { id: 's0806', name: 'Medicamentos utilizados en reproducción asistida', subs: [
        { id: 's080601', name: 'Clomifeno', subs: [] },
        { id: 's080602', name: 'Gonadotrofinas', subs: [] },
        { id: 's080603', name: 'Antagonistas de la gonadorelina', subs: [] },
      ]},
      { id: 's0807', name: 'Progestágenos', subs: [
        { id: 's080701', name: 'Progestágenos vía oral', subs: [] },
        { id: 's080702', name: 'Progestágenos por vía vaginal', subs: [] },
        { id: 's080703', name: 'Progestágenos por vía parenteral', subs: [] },
        { id: 's080704', name: 'Progestágenos por vía transdérmica', subs: [] },
      ]},
      { id: 's0808', name: 'Supresión de la lactancia e hiperprolactinemia', subs: [] },
    ]
  },
  {
    id: 'c09', n: '09', name: 'Sistema Urogenital',
    subs: [
      { id: 's0901', name: 'Trastornos de la función vesical', subs: [
        { id: 's090101', name: 'Medicamentos para el tratamiento de la inestabilidad vesical', subs: [] },
      ]},
      { id: 's0902', name: 'Hiperplasia prostática benigna', subs: [
        { id: 's090201', name: 'Bloqueadores α1', subs: [] },
        { id: 's090202', name: 'Inhibidores de la 5-alfa-reductasa', subs: [] },
        { id: 's090203', name: 'Combinación de un bloqueador α1 + un inhibidor de la 5-α-reductasa', subs: [] },
        { id: 's090204', name: 'Extractos de plantas', subs: [] },
      ]},
      { id: 's0903', name: 'Trastornos de la erección', subs: [
        { id: 's090301', name: 'Inhibidores de la fosfodiesterasa de tipo 5', subs: [] },
      ]},
      { id: 's0904', name: 'Medicamentos para la litiasis renal', subs: [] },
    ]
  },
  {
    id: 'c10', n: '10', name: 'Sistema Nervioso',
    subs: [
      { id: 's1001', name: 'Hipnóticos, sedantes y ansiolíticos', subs: [
        { id: 's100101', name: 'Benzodiazepinas', subs: [] },
        { id: 's100102', name: 'Análogos de las benzodiazepinas (Z-drugs)', subs: [] },
        { id: 's100103', name: 'Melatonina', subs: [] },
        { id: 's100104', name: 'Medicamentos a base de plantas', subs: [] },
      ]},
      { id: 's1002', name: 'Antipsicóticos', subs: [
        { id: 's100201', name: 'Fenotizinas: levomepromazina', subs: [] },
        { id: 's100202', name: 'Butirofenonas: haloperidol', subs: [] },
        { id: 's100203', name: 'Antipsicóticos atípicos', subs: [] },
      ]},
      { id: 's1003', name: 'Antidepresivos y medicamentos para el trastorno bipolar', subs: [
        { id: 's100301', name: 'Inhibidores selectivos de la recaptación', subs: [] },
        { id: 's100302', name: 'Inhibidores no selectivos de la recaptación', subs: [] },
        { id: 's100303', name: 'Antidepresivos que actúan directamente sobre neuroreceptores', subs: [] },
        { id: 's100304', name: 'Vortioxetina', subs: [] },
        { id: 's100305', name: 'Medicamentos para el trastorno bipolar', subs: [] },
      ]},
      { id: 's1004', name: 'Medicamentos utilizados en dependencias', subs: [
        { id: 's100401', name: 'Medicamentos utilizados en el alcoholismo', subs: [] },
        { id: 's100402', name: 'Medicamentos utilizados en el tabaquismo', subs: [] },
      ]},
      { id: 's1005', name: 'Antiparkinsonianos', subs: [
        { id: 's100501', name: 'Levodopa + inhibidor de la dopadecarboxilasa', subs: [] },
        { id: 's100502', name: 'Agonistas dopaminérgicos', subs: [] },
        { id: 's100503', name: 'Inhibidores de la COMT (entacapone)', subs: [] },
        { id: 's100504', name: 'Inhibidores de la MAO-B (IMAO-B)', subs: [] },
        { id: 's100505', name: 'Anticolinérgicos', subs: [] },
        { id: 's100506', name: 'Combinaciones', subs: [] },
      ]},
      { id: 's1006', name: 'Antiepilépticos', subs: [
        { id: 's100601', name: 'Antiepilépticos de amplio espectro', subs: [] },
        { id: 's100602', name: 'Antiepilépticos con espectro de acción estrecho', subs: [] },
        { id: 's100603', name: 'Otros antiepilépticos', subs: [] },
      ]},
      { id: 's1007', name: 'Antimigrañosos', subs: [
        { id: 's100701', name: 'Medicamentos para la crisis aguda de migraña', subs: [] },
        { id: 's100702', name: 'Medicamentos profilácticos', subs: [] },
      ]},
      { id: 's1008', name: 'Medicamentos para la enfermedad de Alzheimer', subs: [] },
      { id: 's1009', name: 'Síndrome de Hiperactividad con Déficit de Atención y Narcolepsia', subs: [] },
    ]
  },
  {
    id: 'c11', n: '11', name: 'Infecciones',
    subs: [
      { id: 's1101', name: 'Antibacterianos', subs: [
        { id: 's110101', name: 'Betalactámicos', subs: [] },
        { id: 's110102', name: 'Macrólidos', subs: [] },
        { id: 's110103', name: 'Tetraciclinas', subs: [] },
        { id: 's110104', name: 'Clindamicina y lincomicina', subs: [] },
        { id: 's110105', name: 'Quinolonas', subs: [] },
        { id: 's110106', name: 'Cotrimoxazol', subs: [] },
        { id: 's110107', name: 'Aminoglucósidos', subs: [] },
        { id: 's110108', name: 'Glicopéptidos', subs: [] },
        { id: 's110109', name: 'Diversos antibacterianos', subs: [] },
        { id: 's110110', name: 'Antibacterianos urinarios', subs: [] },
        { id: 's110111', name: 'Medicamentos para la Tuberculosis', subs: [] },
        { id: 's110112', name: 'Medicamentos para la Lepra', subs: [] },
      ]},
      { id: 's1102', name: 'Antimicóticos', subs: [
        { id: 's110201', name: 'Polienos', subs: [] },
        { id: 's110202', name: 'Equinocandinas', subs: [] },
        { id: 's110203', name: 'Derivados azólicos', subs: [] },
        { id: 's110204', name: 'Terbinafina', subs: [] },
      ]},
      { id: 's1103', name: 'Antiparasitarios', subs: [
        { id: 's110301', name: 'Antihelmínticos', subs: [] },
        { id: 's110302', name: 'Antipalúdicos', subs: [] },
        { id: 's110303', name: 'Antileishmaniásicos', subs: [] },
        { id: 's110304', name: 'Medicamentos tripanomicidas', subs: [] },
        { id: 's110305', name: 'Otros antiprotozoarios', subs: [] },
      ]},
      { id: 's1104', name: 'Antivirales', subs: [
        { id: 's110401', name: 'Medicamentos contra los virus herpéticos', subs: [] },
        { id: 's110402', name: 'Medicamentos contra virus respiratorios', subs: [] },
      ]},
    ]
  },
  {
    id: 'c12', n: '12', name: 'Inmunidad',
    subs: [
      { id: 's1201', name: 'Vacunas', subs: [
        { id: 's120101', name: 'Vacunas antivirales', subs: [] },
        { id: 's120102', name: 'Vacunas antibacterianas', subs: [] },
        { id: 's120103', name: 'Vacunas combinadas', subs: [] },
      ]},
      { id: 's1202', name: 'Alergia', subs: [
        { id: 's120201', name: 'Emergencias alérgicas', subs: [] },
        { id: 's120202', name: 'Antihistamínicos', subs: [] },
      ]},
      { id: 's1203', name: 'Medicamentos para enfermedades inmunitarias crónicas', subs: [
        { id: 's120301', name: 'Inhibidores del Factor de Necrosis Tumoral (FNT)', subs: [] },
        { id: 's120302', name: 'Inhibidores de interleuinas', subs: [] },
        { id: 's120303', name: 'Inhibidores de proteína quinasas no oncológicas', subs: [] },
      ]},
    ]
  },
  {
    id: 'c13', n: '13', name: 'Dermatología',
    subs: [
      { id: 's1301', name: 'Medicamentos antiinfecciosos', subs: [
        { id: 's130101', name: 'Antisépticos y desinfectantes', subs: [] },
        { id: 's130102', name: 'Antibióticos y sulfamidas', subs: [] },
        { id: 's130103', name: 'Antimicóticos', subs: [] },
        { id: 's130104', name: 'Antivirales', subs: [] },
        { id: 's130105', name: 'Medicamentos para la pediculosis', subs: [] },
        { id: 's130106', name: 'Medicamentos para la escabiosis', subs: [] },
      ]},
      { id: 's1302', name: 'Corticoides de uso dérmico', subs: [
        { id: 's130201', name: 'Corticoides muy potentes', subs: [] },
        { id: 's130202', name: 'Corticoides potentes', subs: [] },
        { id: 's130203', name: 'Corticoides de potencia moderada', subs: [] },
        { id: 's130204', name: 'Corticoides de potencia leve', subs: [] },
        { id: 's130205', name: 'Combinaciones con corticoides', subs: [] },
      ]},
      { id: 's1303', name: 'Antipruriginosos', subs: [] },
      { id: 's1304', name: 'Medicamentos para traumatismos y trastornos venosos', subs: [] },
      { id: 's1305', name: 'Acné y rosácea', subs: [
        { id: 's130501', name: 'Peróxido de benzoilo', subs: [] },
        { id: 's130502', name: 'Antibióticos de uso local', subs: [] },
        { id: 's130503', name: 'Ácido azelaico', subs: [] },
        { id: 's130504', name: 'Adapaleno y tretinoína de uso dérmico', subs: [] },
        { id: 's130505', name: 'Isotretinoína', subs: [] },
        { id: 's130506', name: 'Combinaciones antiacnéicas', subs: [] },
        { id: 's130507', name: 'Ivermectina de uso dérmico', subs: [] },
      ]},
      { id: 's1306', name: 'Eczema y psoriasis', subs: [
        { id: 's130601', name: 'Combinaciones de calcipotriol + corticoide', subs: [] },
        { id: 's130602', name: 'Combinaciones de ácido salicílico + corticoide', subs: [] },
        { id: 's130603', name: 'Psoralenos (PUVA)', subs: [] },
        { id: 's130604', name: 'Alquitrán de hulla', subs: [] },
      ]},
      { id: 's1307', name: 'Queratolíticos (medicamentos para verrugas)', subs: [] },
      { id: 's1308', name: 'Enzimas', subs: [] },
      { id: 's1309', name: 'Preparaciones protectoras, cicatrizantes y emolientes', subs: [] },
      { id: 's1310', name: 'Inmunomoduladores', subs: [] },
      { id: 's1311', name: 'Otros medicamentos de uso dermatológico', subs: [] },
    ]
  },
  {
    id: 'c14', n: '14', name: 'Oftalmología',
    subs: [
      { id: 's1401', name: 'Antiinfecciosos', subs: [
        { id: 's140101', name: 'Antibióticos', subs: [] },
        { id: 's140102', name: 'Antivirales', subs: [] },
      ]},
      { id: 's1402', name: 'Antialérgicos y antiinflamatorios', subs: [
        { id: 's140201', name: 'Corticoides', subs: [] },
        { id: 's140202', name: 'Antiinflamatorios no esteroides (AINE) de uso oftálmico', subs: [] },
        { id: 's140203', name: 'Antialérgicos', subs: [] },
        { id: 's140204', name: 'Corticoides + antibióticos', subs: [] },
        { id: 's140205', name: 'Combinaciones de AINE + antibiótico', subs: [] },
      ]},
      { id: 's1403', name: 'Descongestionantes', subs: [] },
      { id: 's1404', name: 'Midriáticos y ciclopléjicos', subs: [] },
      { id: 's1405', name: 'Medicamentos para el glaucoma', subs: [
        { id: 's140501', name: 'Mióticos (colinomiméticos)', subs: [] },
        { id: 's140502', name: 'Betabloqueadores de uso oftálmico', subs: [] },
        { id: 's140503', name: 'Simpaticomiméticos alfa', subs: [] },
        { id: 's140504', name: 'Análogos de prostaglandinas', subs: [] },
        { id: 's140505', name: 'Inhibidores de la anhidrasa carbónica', subs: [] },
      ]},
      { id: 's1406', name: 'Anestésicos locales', subs: [] },
      { id: 's1407', name: 'Lágrimas artificiales', subs: [] },
      { id: 's1408', name: 'Medicamentos utilizados en enfermedades de la retina', subs: [
        { id: 's140801', name: 'Medicamentos utilizados en el tratamiento de la neo vascularización de la retina y los edemas maculares secundarios', subs: [] },
      ]},
    ]
  },
  {
    id: 'c15', n: '15', name: 'Otorrinolaringología',
    subs: [
      { id: 's1501', name: 'Medicamentos para uso en otitis', subs: [
        { id: 's150101', name: 'Antibióticos de uso ótico', subs: [] },
        { id: 's150102', name: 'Corticoides + antibióticos', subs: [] },
        { id: 's150103', name: 'Anestésicos locales', subs: [] },
        { id: 's150104', name: 'Corticoide + antibiótico + anestésico', subs: [] },
        { id: 's150105', name: 'Medicamentos para disolver el cerumen', subs: [] },
      ]},
      { id: 's1502', name: 'Enfermedad de ménière y medicamentos para el mareo del viajero', subs: [
        { id: 's150201', name: 'Enfermedad de Ménière', subs: [] },
        { id: 's150202', name: 'Medicamentos para el mareo del viajero', subs: [] },
      ]},
      { id: 's1503', name: 'Rinitis y sinusitis', subs: [
        { id: 's150301', name: 'Medicamentos por vía oral', subs: [] },
        { id: 's150302', name: 'Medicamentos de uso nasal', subs: [] },
        { id: 's150303', name: 'Pomadas para inhalación', subs: [] },
      ]},
      { id: 's1504', name: 'Afecciones orofaríngeas', subs: [
        { id: 's150401', name: 'Comprimidos para chupar/masticar', subs: [] },
        { id: 's150402', name: 'Medicamentos diversos', subs: [] },
        { id: 's150403', name: 'Medicamentos para xerostomía', subs: [] },
      ]},
    ]
  },
  {
    id: 'c16', n: '16', name: 'Anestésicos',
    subs: [
      { id: 's1601', name: 'Anestésicos locales y sedantes', subs: [
        { id: 's160101', name: 'Anestésicos locales inyectables', subs: [] },
        { id: 's160102', name: 'Sedantes', subs: [] },
      ]},
    ]
  },
  {
    id: 'c17', n: '17', name: 'Antídotos y Quelantes',
    subs: [
      { id: 's1701', name: 'Antídotos para intoxicación medicamentosa', subs: [
        { id: 's170101', name: 'Anticuerpos antidigoxina para intoxicación digitálica', subs: [] },
        { id: 's170102', name: 'Protamina para sobredosis de heparina', subs: [] },
        { id: 's170103', name: 'Vitamina K1 para sobredosis de warfarina', subs: [] },
        { id: 's170104', name: 'Idarucizumab como antídoto del dabigatrán', subs: [] },
        { id: 's170105', name: 'Glucagón y glucosa en hipoglicemia', subs: [] },
        { id: 's170106', name: 'Acetilcisteína en caso de intoxicación con paracetamol', subs: [] },
        { id: 's170107', name: 'Naloxona en intoxicación por opioides', subs: [] },
        { id: 's170108', name: 'Flumazenil en caso de intoxicación con benzodiazepinas', subs: [] },
        { id: 's170109', name: 'Azul de metileno en caso de metahemoglobinemia', subs: [] },
        { id: 's170110', name: 'Gluconato de calcio en sobredosis con sulfato de magnesio', subs: [] },
      ]},
      { id: 's1702', name: 'Antídotos para intoxicaciones no medicamentosas', subs: [
        { id: 's170201', name: 'Hidroxicobalamina en intoxicación por cianuro', subs: [] },
        { id: 's170202', name: 'Atropina para intoxicación por plaguidas organofosforados', subs: [] },
        { id: 's170203', name: 'Pralidoxima para intoxicación por plaguicidas organofosforados', subs: [] },
        { id: 's170204', name: 'Fomepizol y etanol para intoxicación por metanol y etilenglicol', subs: [] },
      ]},
      { id: 's1703', name: 'Antídotos para la mordedura de serpiente y la picadura de escorpión', subs: [] },
      { id: 's1704', name: 'Quelantes', subs: [
        { id: 's170401', name: 'Quelantes del hierro', subs: [] },
        { id: 's170402', name: 'Quelantes de metales pesados', subs: [] },
      ]},
    ]
  },
  {
    id: 'c18', n: '18', name: 'Medicamentos Diversos',
    subs: [
      { id: 's1801', name: 'Vitamina A (retinol)', subs: [] },
      { id: 's1802', name: 'Calcitriol y paricalcitol', subs: [] },
    ]
  },
];

export function getSubcaps(chapId: string): SubCapitulo[] {
  const cap = CHAPS.find(c => c.id === chapId);
  return cap?.subs || [];
}
