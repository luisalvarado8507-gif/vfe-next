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
    "id": "c01",
    "n": "01",
    "name": "Sistema Cardiovascular",
    "subs": [
      {
        "id": "s0101",
        "name": "Antihipertensivos",
        "subs": []
      },
      {
        "id": "s0102",
        "name": "Antiarrítmicos",
        "subs": []
      },
      {
        "id": "s0103",
        "name": "Insuficiencia cardíaca",
        "subs": []
      },
      {
        "id": "s0104",
        "name": "Hipolipemiantes",
        "subs": []
      },
      {
        "id": "s0105",
        "name": "Vasodilatadores",
        "subs": []
      }
    ]
  },
  {
    "id": "c02",
    "n": "02",
    "name": "Sangre y Coagulación",
    "subs": [
      {
        "id": "s0201",
        "name": "Anticoagulantes",
        "subs": []
      },
      {
        "id": "s0202",
        "name": "Antiagregantes",
        "subs": []
      },
      {
        "id": "s0203",
        "name": "Fibrinolíticos",
        "subs": []
      },
      {
        "id": "s0204",
        "name": "Anemia",
        "subs": []
      }
    ]
  },
  {
    "id": "c03",
    "n": "03",
    "name": "Sistema Gastrointestinal",
    "subs": [
      {
        "id": "s0301",
        "name": "Patología gastrointestinal",
        "subs": [
          {
            "id": "s030101",
            "name": "Inhibidores de la secreción de ácido gástrico",
            "subs": []
          },
          {
            "id": "s030102",
            "name": "Antiácidos",
            "subs": []
          },
          {
            "id": "s030103",
            "name": "Citoprotectores gástricos",
            "subs": []
          }
        ]
      },
      {
        "id": "s0302",
        "name": "Antiespásticos anticolinérgicos",
        "subs": []
      },
      {
        "id": "s0303",
        "name": "Antieméticos",
        "subs": []
      },
      {
        "id": "s0304",
        "name": "Medicamentos para la diarrea",
        "subs": []
      },
      {
        "id": "s0305",
        "name": "Laxantes",
        "subs": []
      },
      {
        "id": "s0306",
        "name": "Hepatoprotectores",
        "subs": []
      }
    ]
  },
  {
    "id": "c04",
    "n": "04",
    "name": "Sistema Respiratorio",
    "subs": [
      {
        "id": "s0401",
        "name": "Broncodilatadores SABA",
        "subs": []
      },
      {
        "id": "s0402",
        "name": "Broncodilatadores LABA",
        "subs": []
      },
      {
        "id": "s0403",
        "name": "Corticoides inhalados",
        "subs": []
      },
      {
        "id": "s0404",
        "name": "Mucolíticos / Antitusígenos",
        "subs": []
      }
    ]
  },
  {
    "id": "c05",
    "n": "05",
    "name": "Dolor y Fiebre",
    "subs": [
      {
        "id": "s0501",
        "name": "Analgésicos no opioides",
        "subs": []
      },
      {
        "id": "s0502",
        "name": "Opioides mayores",
        "subs": []
      },
      {
        "id": "s0503",
        "name": "Opioides menores",
        "subs": []
      },
      {
        "id": "s0504",
        "name": "AINEs",
        "subs": []
      },
      {
        "id": "s0505",
        "name": "Antimigrañosos",
        "subs": []
      }
    ]
  },
  {
    "id": "c06",
    "n": "06",
    "name": "Patología Osteoarticular",
    "subs": [
      {
        "id": "s0601",
        "name": "Antigotosos",
        "subs": []
      },
      {
        "id": "s0602",
        "name": "DMARDs",
        "subs": []
      },
      {
        "id": "s0603",
        "name": "Osteoporosis",
        "subs": []
      },
      {
        "id": "s0604",
        "name": "Relajantes musculares",
        "subs": []
      }
    ]
  },
  {
    "id": "c07",
    "n": "07",
    "name": "Sistema Hormonal",
    "subs": [
      {
        "id": "s0701",
        "name": "Insulinas",
        "subs": []
      },
      {
        "id": "s0702",
        "name": "Antidiabéticos orales",
        "subs": []
      },
      {
        "id": "s0703",
        "name": "Tiroides",
        "subs": []
      },
      {
        "id": "s0704",
        "name": "Corticoides sistémicos",
        "subs": []
      },
      {
        "id": "s0705",
        "name": "Hormonas sexuales",
        "subs": []
      }
    ]
  },
  {
    "id": "c08",
    "n": "08",
    "name": "Ginecología y Obstetricia",
    "subs": [
      {
        "id": "s0801",
        "name": "Anticonceptivos",
        "subs": []
      },
      {
        "id": "s0802",
        "name": "Uterotónicos",
        "subs": []
      },
      {
        "id": "s0803",
        "name": "Tocolíticos",
        "subs": []
      },
      {
        "id": "s0804",
        "name": "Menopausia",
        "subs": []
      }
    ]
  },
  {
    "id": "c09",
    "n": "09",
    "name": "Sistema Urogenital",
    "subs": [
      {
        "id": "s0901",
        "name": "Prostáticos",
        "subs": []
      },
      {
        "id": "s0902",
        "name": "Vejiga hiperactiva",
        "subs": []
      },
      {
        "id": "s0903",
        "name": "Infecciones urinarias",
        "subs": []
      }
    ]
  },
  {
    "id": "c10",
    "n": "10",
    "name": "Sistema Nervioso",
    "subs": [
      {
        "id": "s1001",
        "name": "Antidepresivos ISRS",
        "subs": []
      },
      {
        "id": "s1002",
        "name": "Antidepresivos otros",
        "subs": []
      },
      {
        "id": "s1003",
        "name": "Ansiolíticos",
        "subs": []
      },
      {
        "id": "s1004",
        "name": "Antipsicóticos",
        "subs": []
      },
      {
        "id": "s1005",
        "name": "Antiepilépticos",
        "subs": []
      },
      {
        "id": "s1006",
        "name": "Parkinson",
        "subs": []
      }
    ]
  },
  {
    "id": "c11",
    "n": "11",
    "name": "Infecciones",
    "subs": [
      {
        "id": "s1101",
        "name": "Penicilinas",
        "subs": []
      },
      {
        "id": "s1102",
        "name": "Cefalosporinas",
        "subs": []
      },
      {
        "id": "s1103",
        "name": "Macrólidos",
        "subs": []
      },
      {
        "id": "s1104",
        "name": "Quinolonas",
        "subs": []
      },
      {
        "id": "s1105",
        "name": "Antifúngicos",
        "subs": []
      },
      {
        "id": "s1106",
        "name": "Antivirales",
        "subs": []
      },
      {
        "id": "s1107",
        "name": "Antiparasitarios",
        "subs": []
      },
      {
        "id": "s1108",
        "name": "Antituberculosos",
        "subs": []
      }
    ]
  },
  {
    "id": "c12",
    "n": "12",
    "name": "Inmunidad",
    "subs": [
      {
        "id": "s1201",
        "name": "Vacunas",
        "subs": []
      },
      {
        "id": "s1202",
        "name": "Inmunosupresores",
        "subs": []
      },
      {
        "id": "s1203",
        "name": "Inmunoestimulantes",
        "subs": []
      }
    ]
  },
  {
    "id": "c13",
    "n": "13",
    "name": "Dermatología",
    "subs": [
      {
        "id": "s1301",
        "name": "Corticoides tópicos",
        "subs": []
      },
      {
        "id": "s1302",
        "name": "Antimicóticos tópicos",
        "subs": []
      },
      {
        "id": "s1303",
        "name": "Emolientes",
        "subs": []
      },
      {
        "id": "s1304",
        "name": "Acné",
        "subs": []
      }
    ]
  },
  {
    "id": "c14",
    "n": "14",
    "name": "Oftalmología",
    "subs": [
      {
        "id": "s1401",
        "name": "Antiglaucomatosos",
        "subs": []
      },
      {
        "id": "s1402",
        "name": "Antibióticos oculares",
        "subs": []
      },
      {
        "id": "s1403",
        "name": "Antiinflamatorios oculares",
        "subs": []
      },
      {
        "id": "s1404",
        "name": "Lágrimas artificiales",
        "subs": []
      }
    ]
  },
  {
    "id": "c15",
    "n": "15",
    "name": "Otorrinolaringología",
    "subs": [
      {
        "id": "s1501",
        "name": "Descongestionantes",
        "subs": []
      },
      {
        "id": "s1502",
        "name": "Antihistamínicos",
        "subs": []
      },
      {
        "id": "s1503",
        "name": "Antibióticos óticos",
        "subs": []
      },
      {
        "id": "s1504",
        "name": "Corticoides nasales",
        "subs": []
      }
    ]
  },
  {
    "id": "c16",
    "n": "16",
    "name": "Anestésicos",
    "subs": [
      {
        "id": "s1601",
        "name": "Anestesia general",
        "subs": []
      },
      {
        "id": "s1602",
        "name": "Anestesia local",
        "subs": []
      },
      {
        "id": "s1603",
        "name": "Relajantes neuromusculares",
        "subs": []
      },
      {
        "id": "s1604",
        "name": "Sedación / Hipnóticos",
        "subs": []
      }
    ]
  },
  {
    "id": "c17",
    "n": "17",
    "name": "Antídotos y Quelantes",
    "subs": [
      {
        "id": "s1701",
        "name": "Antídotos específicos",
        "subs": []
      },
      {
        "id": "s1702",
        "name": "Quelantes",
        "subs": []
      },
      {
        "id": "s1703",
        "name": "Antídotos generales",
        "subs": []
      }
    ]
  },
  {
    "id": "c18",
    "n": "18",
    "name": "Medicamentos Diversos",
    "subs": [
      {
        "id": "s1801",
        "name": "Vitaminas y minerales",
        "subs": []
      },
      {
        "id": "s1802",
        "name": "Nutrición parenteral",
        "subs": []
      },
      {
        "id": "s1803",
        "name": "Medios de contraste",
        "subs": []
      },
      {
        "id": "s1804",
        "name": "Soluciones electrolíticas",
        "subs": []
      }
    ]
  }
];

export function getSubcaps(chapId: string): SubCapitulo[] {
  const cap = CHAPS.find(c => c.id === chapId);
  return cap?.subs || [];
}
