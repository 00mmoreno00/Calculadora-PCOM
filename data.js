// ══════════════════════════════════════════════
//  CATÁLOGO DE PRECIOS — Propiedades.com
// ══════════════════════════════════════════════

const MESES_POR_PERIODO = {
  mensual: 1,
  trimestral: 3,
  semestral: 6,
  anual: 12
};

const DESCUENTO_MAXIMO_POR_ZONA = {
  "FullPrice": 0,
  "CDMX_EDOMEX": 20,
  "JALISCO_NL": 50,
  "QUERETARO": 65,
  "RESTO": 70
};

const OPORTUNIDADES_ILIMITADAS_PRECIOS_MENSUALES = {
  "FullPrice": {
    "10": 599,
    "40": 1999,
    "80": 2999,
    "140": 4995,
    "300": 7999,
    "500": 9199,
    "extra500": 1380
  }
};

const ELITE_PRECIOS_MENSUALES = {
  "FullPrice": {
    "hasta300": 8500,
    "hasta500": 11050,
    "extra500": 3315
  },
  "CDMX_EDOMEX": {
    "hasta300": 8500,
    "hasta500": 11050,
    "extra500": 3315
  },
  "JALISCO_NL": {
    "hasta300": 4750,
    "hasta500": 6413,
    "extra500": 1924
  },
  "QUERETARO": {
    "hasta300": 3500,
    "hasta500": 4725,
    "extra500": 1418
  },
  "RESTO": {
    "hasta300": 3000,
    "hasta500": 4050,
    "extra500": 1215
  }
};

const DESTACADO_FULLPRICE_MENSUAL = 599;
const PRIME_FULLPRICE_MENSUAL = 699;

const DESTACADOS_PRECIOS = {
  "1": {
    "mensual": 599,
    "trimestral": 999,
    "semestral": 2070,
    "anual": 3600
  },
  "2": {
    "mensual": 1198,
    "trimestral": 1998,
    "semestral": 3312,
    "anual": 5310
  },
  "3": {
    "mensual": 1797,
    "trimestral": 2898,
    "semestral": 4016,
    "anual": 6885
  },
  "4": {
    "mensual": 2396,
    "trimestral": 3696,
    "semestral": 5161,
    "anual": 8400
  },
  "5": {
    "mensual": 2995,
    "trimestral": 4500,
    "semestral": 5762,
    "anual": 9000
  },
  "6": {
    "mensual": 3594,
    "trimestral": 5094,
    "semestral": 6665,
    "anual": 10350
  },
  "7": {
    "mensual": 4193,
    "trimestral": 5859,
    "semestral": 7487,
    "anual": 11655
  },
  "8": {
    "mensual": 4792,
    "trimestral": 6648,
    "semestral": 8390,
    "anual": 12840
  },
  "9": {
    "mensual": 5391,
    "trimestral": 7398,
    "semestral": 9191,
    "anual": 14040
  },
  "10": {
    "mensual": 5990,
    "trimestral": 8160,
    "semestral": 10143,
    "anual": 15000
  },
  "11": {
    "mensual": 6589,
    "trimestral": 8844,
    "semestral": 11006,
    "anual": 16170
  },
  "12": {
    "mensual": 7188,
    "trimestral": 9540,
    "semestral": 11923,
    "anual": 17280
  },
  "13": {
    "mensual": 7787,
    "trimestral": 10257,
    "semestral": 12737,
    "anual": 18330
  },
  "14": {
    "mensual": 8386,
    "trimestral": 10920,
    "semestral": 13621,
    "anual": 19320
  },
  "15": {
    "mensual": 8985,
    "trimestral": 11565,
    "semestral": 14490,
    "anual": 20250
  },
  "16": {
    "mensual": 9584,
    "trimestral": 12192,
    "semestral": 15346,
    "anual": 21360
  },
  "17": {
    "mensual": 10183,
    "trimestral": 12801,
    "semestral": 16070,
    "anual": 22185
  },
  "18": {
    "mensual": 10782,
    "trimestral": 13392,
    "semestral": 16891,
    "anual": 23220
  },
  "19": {
    "mensual": 11381,
    "trimestral": 14022,
    "semestral": 17699,
    "anual": 24225
  },
  "20": {
    "mensual": 11980,
    "trimestral": 14520,
    "semestral": 18354,
    "anual": 24900
  },
  "21": {
    "mensual": 12579,
    "trimestral": 15120,
    "semestral": 19127,
    "anual": 25830
  },
  "22": {
    "mensual": 13178,
    "trimestral": 15576,
    "semestral": 19886,
    "anual": 26400
  },
  "23": {
    "mensual": 13777,
    "trimestral": 16146,
    "semestral": 20472,
    "anual": 27600
  },
  "24": {
    "mensual": 14376,
    "trimestral": 16632,
    "semestral": 21197,
    "anual": 28800
  },
  "25": {
    "mensual": 14975,
    "trimestral": 17100,
    "semestral": 21908,
    "anual": 30000
  },
  "26": {
    "mensual": 15574,
    "trimestral": 17550,
    "semestral": 22604,
    "anual": 31200
  },
  "27": {
    "mensual": 16173,
    "trimestral": 17982,
    "semestral": 23101,
    "anual": 32400
  },
  "28": {
    "mensual": 16772,
    "trimestral": 18480,
    "semestral": 23764,
    "anual": 33600
  },
  "29": {
    "mensual": 17371,
    "trimestral": 18879,
    "semestral": 24412,
    "anual": 34800
  },
  "30": {
    "mensual": 17970,
    "trimestral": 19170,
    "semestral": 25047,
    "anual": 36000
  },
  "31": {
    "mensual": 18569,
    "trimestral": 19623,
    "semestral": 25668,
    "anual": 37200
  },
  "32": {
    "mensual": 19168,
    "trimestral": 19968,
    "semestral": 26054,
    "anual": 38400
  },
  "33": {
    "mensual": 19767,
    "trimestral": 20295,
    "semestral": 26641,
    "anual": 39600
  },
  "34": {
    "mensual": 20366,
    "trimestral": 20604,
    "semestral": 27214,
    "anual": 40800
  },
  "35": {
    "mensual": 20965,
    "trimestral": 20895,
    "semestral": 27773,
    "anual": 42000
  },
  "36": {
    "mensual": 21564,
    "trimestral": 21168,
    "semestral": 28318,
    "anual": 43200
  },
  "37": {
    "mensual": 22163,
    "trimestral": 21423,
    "semestral": 28849,
    "anual": 44400
  },
  "38": {
    "mensual": 22762,
    "trimestral": 21660,
    "semestral": 29366,
    "anual": 45600
  },
  "39": {
    "mensual": 23361,
    "trimestral": 21996,
    "semestral": 29870,
    "anual": 46800
  },
  "40": {
    "mensual": 23960,
    "trimestral": 22200,
    "semestral": 30360,
    "anual": 48000
  },
  "41": {
    "mensual": 24559,
    "trimestral": 22386,
    "semestral": 30836,
    "anual": 49200
  },
  "42": {
    "mensual": 25158,
    "trimestral": 22554,
    "semestral": 31298,
    "anual": 50400
  },
  "43": {
    "mensual": 25757,
    "trimestral": 22704,
    "semestral": 31747,
    "anual": 51600
  },
  "44": {
    "mensual": 26356,
    "trimestral": 22836,
    "semestral": 32182,
    "anual": 52800
  },
  "45": {
    "mensual": 26955,
    "trimestral": 22950,
    "semestral": 32603,
    "anual": 54000
  },
  "46": {
    "mensual": 27554,
    "trimestral": 23046,
    "semestral": 33010,
    "anual": 55200
  },
  "47": {
    "mensual": 28153,
    "trimestral": 23124,
    "semestral": 33079,
    "anual": 56400
  },
  "48": {
    "mensual": 28752,
    "trimestral": 23184,
    "semestral": 33782,
    "anual": 57600
  },
  "49": {
    "mensual": 29351,
    "trimestral": 23226,
    "semestral": 34148,
    "anual": 58800
  },
  "50": {
    "mensual": 29950,
    "trimestral": 23400,
    "semestral": 34500,
    "anual": 60000
  },
  "51": {
    "mensual": 30549,
    "trimestral": 23715,
    "semestral": 34838,
    "anual": 61200
  },
  "52": {
    "mensual": 31148,
    "trimestral": 24180,
    "semestral": 35521,
    "anual": 62400
  },
  "53": {
    "mensual": 31747,
    "trimestral": 24486,
    "semestral": 36204,
    "anual": 63600
  },
  "54": {
    "mensual": 32346,
    "trimestral": 24948,
    "semestral": 36887,
    "anual": 64800
  },
  "55": {
    "mensual": 32945,
    "trimestral": 25245,
    "semestral": 37191,
    "anual": 66000
  },
  "56": {
    "mensual": 33544,
    "trimestral": 25704,
    "semestral": 37867,
    "anual": 67200
  },
  "57": {
    "mensual": 34143,
    "trimestral": 25992,
    "semestral": 38543,
    "anual": 68400
  },
  "58": {
    "mensual": 34742,
    "trimestral": 26448,
    "semestral": 39220,
    "anual": 69600
  },
  "59": {
    "mensual": 35341,
    "trimestral": 26727,
    "semestral": 39489,
    "anual": 70800
  },
  "60": {
    "mensual": 35940,
    "trimestral": 27180,
    "semestral": 40158,
    "anual": 72000
  },
  "61": {
    "mensual": 36539,
    "trimestral": 27450,
    "semestral": 40827,
    "anual": 73200
  },
  "62": {
    "mensual": 37138,
    "trimestral": 27900,
    "semestral": 41497,
    "anual": 74400
  },
  "63": {
    "mensual": 37737,
    "trimestral": 28161,
    "semestral": 41731,
    "anual": 75600
  },
  "64": {
    "mensual": 38336,
    "trimestral": 28608,
    "semestral": 42394,
    "anual": 76800
  },
  "65": {
    "mensual": 38935,
    "trimestral": 28860,
    "semestral": 43056,
    "anual": 78000
  },
  "66": {
    "mensual": 39534,
    "trimestral": 29304,
    "semestral": 43718,
    "anual": 79200
  },
  "67": {
    "mensual": 40133,
    "trimestral": 29547,
    "semestral": 43919,
    "anual": 80400
  },
  "68": {
    "mensual": 40732,
    "trimestral": 29988,
    "semestral": 44574,
    "anual": 81600
  },
  "69": {
    "mensual": 41331,
    "trimestral": 30222,
    "semestral": 45230,
    "anual": 82800
  },
  "70": {
    "mensual": 41930,
    "trimestral": 30660,
    "semestral": 45402,
    "anual": 84000
  },
  "71": {
    "mensual": 42529,
    "trimestral": 30885,
    "semestral": 46051,
    "anual": 85200
  },
  "72": {
    "mensual": 43128,
    "trimestral": 31320,
    "semestral": 46699,
    "anual": 86400
  },
  "73": {
    "mensual": 43727,
    "trimestral": 31536,
    "semestral": 47348,
    "anual": 87600
  },
  "74": {
    "mensual": 44326,
    "trimestral": 31968,
    "semestral": 47486,
    "anual": 88800
  },
  "75": {
    "mensual": 44925,
    "trimestral": 32175,
    "semestral": 48128,
    "anual": 90000
  },
  "76": {
    "mensual": 45524,
    "trimestral": 32604,
    "semestral": 48769,
    "anual": 91200
  },
  "77": {
    "mensual": 46123,
    "trimestral": 32802,
    "semestral": 49411,
    "anual": 92400
  },
  "78": {
    "mensual": 46722,
    "trimestral": 33228,
    "semestral": 49514,
    "anual": 93600
  },
  "79": {
    "mensual": 47321,
    "trimestral": 33417,
    "semestral": 50149,
    "anual": 94800
  },
  "80": {
    "mensual": 47920,
    "trimestral": 33840,
    "semestral": 50784,
    "anual": 96000
  },
  "81": {
    "mensual": 48519,
    "trimestral": 34020,
    "semestral": 51419,
    "anual": 97200
  },
  "82": {
    "mensual": 49118,
    "trimestral": 34440,
    "semestral": 51488,
    "anual": 98400
  },
  "83": {
    "mensual": 49717,
    "trimestral": 34611,
    "semestral": 52116,
    "anual": 99600
  },
  "84": {
    "mensual": 50316,
    "trimestral": 35028,
    "semestral": 52744,
    "anual": 100800
  },
  "85": {
    "mensual": 50915,
    "trimestral": 35190,
    "semestral": 53372,
    "anual": 102000
  },
  "86": {
    "mensual": 51514,
    "trimestral": 35604,
    "semestral": 53406,
    "anual": 103200
  },
  "87": {
    "mensual": 52113,
    "trimestral": 35757,
    "semestral": 54027,
    "anual": 104400
  },
  "88": {
    "mensual": 52712,
    "trimestral": 36168,
    "semestral": 54648,
    "anual": 105600
  },
  "89": {
    "mensual": 53311,
    "trimestral": 36312,
    "semestral": 55269,
    "anual": 106800
  },
  "90": {
    "mensual": 53910,
    "trimestral": 36720,
    "semestral": 55269,
    "anual": 108000
  },
  "91": {
    "mensual": 54509,
    "trimestral": 36855,
    "semestral": 55883,
    "anual": 109200
  },
  "92": {
    "mensual": 55108,
    "trimestral": 37260,
    "semestral": 56497,
    "anual": 110400
  },
  "93": {
    "mensual": 55707,
    "trimestral": 37386,
    "semestral": 56470,
    "anual": 111600
  },
  "94": {
    "mensual": 56306,
    "trimestral": 37788,
    "semestral": 57077,
    "anual": 112800
  },
  "95": {
    "mensual": 56905,
    "trimestral": 37905,
    "semestral": 57684,
    "anual": 114000
  },
  "96": {
    "mensual": 57504,
    "trimestral": 38304,
    "semestral": 58291,
    "anual": 115200
  },
  "97": {
    "mensual": 58103,
    "trimestral": 38412,
    "semestral": 58229,
    "anual": 116400
  },
  "98": {
    "mensual": 58702,
    "trimestral": 38808,
    "semestral": 58800,
    "anual": 117600
  },
  "99": {
    "mensual": 59301,
    "trimestral": 38907,
    "semestral": 59400,
    "anual": 118800
  },
  "100": {
    "mensual": 59900,
    "trimestral": 39300,
    "semestral": 60000,
    "anual": 120000
  },
  "101": {
    "mensual": 60499,
    "trimestral": 39390,
    "semestral": 60600,
    "anual": 121200
  },
  "102": {
    "mensual": 61098,
    "trimestral": 39780,
    "semestral": 61200,
    "anual": 122400
  },
  "103": {
    "mensual": 61697,
    "trimestral": 39861,
    "semestral": 61800,
    "anual": 123600
  },
  "104": {
    "mensual": 62296,
    "trimestral": 40248,
    "semestral": 62400,
    "anual": 124800
  },
  "105": {
    "mensual": 62895,
    "trimestral": 40320,
    "semestral": 63000,
    "anual": 126000
  },
  "106": {
    "mensual": 63494,
    "trimestral": 40704,
    "semestral": 63600,
    "anual": 127200
  },
  "107": {
    "mensual": 64093,
    "trimestral": 40767,
    "semestral": 64200,
    "anual": 128400
  },
  "108": {
    "mensual": 64692,
    "trimestral": 41148,
    "semestral": 64800,
    "anual": 129600
  },
  "109": {
    "mensual": 65291,
    "trimestral": 41202,
    "semestral": 65400,
    "anual": 130800
  },
  "110": {
    "mensual": 65890,
    "trimestral": 41580,
    "semestral": 66000,
    "anual": 132000
  },
  "111": {
    "mensual": 66489,
    "trimestral": 41625,
    "semestral": 66600,
    "anual": 133200
  },
  "112": {
    "mensual": 67088,
    "trimestral": 42000,
    "semestral": 67200,
    "anual": 134400
  },
  "113": {
    "mensual": 67687,
    "trimestral": 42036,
    "semestral": 67800,
    "anual": 135600
  },
  "114": {
    "mensual": 68286,
    "trimestral": 42408,
    "semestral": 68400,
    "anual": 136800
  },
  "115": {
    "mensual": 68885,
    "trimestral": 42435,
    "semestral": 69000,
    "anual": 138000
  },
  "116": {
    "mensual": 69484,
    "trimestral": 42804,
    "semestral": 69600,
    "anual": 139200
  },
  "117": {
    "mensual": 70083,
    "trimestral": 42822,
    "semestral": 70200,
    "anual": 140400
  },
  "118": {
    "mensual": 70682,
    "trimestral": 43188,
    "semestral": 70800,
    "anual": 141600
  },
  "119": {
    "mensual": 71281,
    "trimestral": 43197,
    "semestral": 71400,
    "anual": 142800
  },
  "120": {
    "mensual": 71880,
    "trimestral": 43560,
    "semestral": 72000,
    "anual": 144000
  },
  "121": {
    "mensual": 72479,
    "trimestral": 43560,
    "semestral": 72600,
    "anual": 145200
  },
  "122": {
    "mensual": 73078,
    "trimestral": 43920,
    "semestral": 73200,
    "anual": 146400
  },
  "123": {
    "mensual": 73677,
    "trimestral": 43911,
    "semestral": 73800,
    "anual": 147600
  },
  "124": {
    "mensual": 74276,
    "trimestral": 44268,
    "semestral": 74400,
    "anual": 148800
  },
  "125": {
    "mensual": 74875,
    "trimestral": 44250,
    "semestral": 75000,
    "anual": 150000
  },
  "126": {
    "mensual": 75474,
    "trimestral": 44604,
    "semestral": 75600,
    "anual": 151200
  },
  "127": {
    "mensual": 76073,
    "trimestral": 44577,
    "semestral": 76200,
    "anual": 152400
  },
  "128": {
    "mensual": 76672,
    "trimestral": 44928,
    "semestral": 76800,
    "anual": 153600
  },
  "129": {
    "mensual": 77271,
    "trimestral": 44892,
    "semestral": 77400,
    "anual": 154800
  },
  "130": {
    "mensual": 77870,
    "trimestral": 45240,
    "semestral": 78000,
    "anual": 156000
  },
  "131": {
    "mensual": 78469,
    "trimestral": 45195,
    "semestral": 78600,
    "anual": 157200
  },
  "132": {
    "mensual": 79068,
    "trimestral": 45540,
    "semestral": 79200,
    "anual": 158400
  },
  "133": {
    "mensual": 79667,
    "trimestral": 45486,
    "semestral": 79800,
    "anual": 159600
  },
  "134": {
    "mensual": 80266,
    "trimestral": 45828,
    "semestral": 80400,
    "anual": 160800
  },
  "135": {
    "mensual": 80865,
    "trimestral": 45765,
    "semestral": 81000,
    "anual": 162000
  },
  "136": {
    "mensual": 81464,
    "trimestral": 46104,
    "semestral": 81600,
    "anual": 163200
  },
  "137": {
    "mensual": 82063,
    "trimestral": 46032,
    "semestral": 82200,
    "anual": 164400
  },
  "138": {
    "mensual": 82662,
    "trimestral": 46368,
    "semestral": 82800,
    "anual": 165600
  },
  "139": {
    "mensual": 83261,
    "trimestral": 46287,
    "semestral": 83400,
    "anual": 166800
  },
  "140": {
    "mensual": 83860,
    "trimestral": 46620,
    "semestral": 84000,
    "anual": 168000
  },
  "141": {
    "mensual": 84459,
    "trimestral": 46530,
    "semestral": 84600,
    "anual": 169200
  },
  "142": {
    "mensual": 85058,
    "trimestral": 46860,
    "semestral": 85200,
    "anual": 170400
  },
  "143": {
    "mensual": 85657,
    "trimestral": 46761,
    "semestral": 85800,
    "anual": 171600
  },
  "144": {
    "mensual": 86256,
    "trimestral": 47088,
    "semestral": 86400,
    "anual": 172800
  },
  "145": {
    "mensual": 86855,
    "trimestral": 46980,
    "semestral": 87000,
    "anual": 174000
  },
  "146": {
    "mensual": 87454,
    "trimestral": 47304,
    "semestral": 87600,
    "anual": 175200
  },
  "147": {
    "mensual": 88053,
    "trimestral": 47187,
    "semestral": 88200,
    "anual": 176400
  },
  "148": {
    "mensual": 88652,
    "trimestral": 47508,
    "semestral": 88800,
    "anual": 177600
  },
  "149": {
    "mensual": 89251,
    "trimestral": 47382,
    "semestral": 89400,
    "anual": 178800
  },
  "150": {
    "mensual": 89850,
    "trimestral": 47700,
    "semestral": 90000,
    "anual": 180000
  },
  "151": {
    "mensual": 90449,
    "trimestral": 47565,
    "semestral": 90600,
    "anual": 181200
  },
  "152": {
    "mensual": 91048,
    "trimestral": 47880,
    "semestral": 91200,
    "anual": 182400
  },
  "153": {
    "mensual": 91647,
    "trimestral": 47736,
    "semestral": 91800,
    "anual": 183600
  },
  "154": {
    "mensual": 92246,
    "trimestral": 48048,
    "semestral": 92400,
    "anual": 184800
  },
  "155": {
    "mensual": 92845,
    "trimestral": 47895,
    "semestral": 93000,
    "anual": 186000
  },
  "156": {
    "mensual": 93444,
    "trimestral": 48204,
    "semestral": 93600,
    "anual": 187200
  },
  "157": {
    "mensual": 94043,
    "trimestral": 48042,
    "semestral": 94200,
    "anual": 188400
  },
  "158": {
    "mensual": 94642,
    "trimestral": 48348,
    "semestral": 94800,
    "anual": 189600
  },
  "159": {
    "mensual": 95241,
    "trimestral": 48177,
    "semestral": 95400,
    "anual": 190800
  },
  "160": {
    "mensual": 95840,
    "trimestral": 48480,
    "semestral": 96000,
    "anual": 192000
  },
  "161": {
    "mensual": 96439,
    "trimestral": 48300,
    "semestral": 96600,
    "anual": 193200
  },
  "162": {
    "mensual": 97038,
    "trimestral": 48600,
    "semestral": 97200,
    "anual": 194400
  },
  "163": {
    "mensual": 97637,
    "trimestral": 48900,
    "semestral": 97800,
    "anual": 195600
  },
  "164": {
    "mensual": 98236,
    "trimestral": 49200,
    "semestral": 98400,
    "anual": 196800
  },
  "165": {
    "mensual": 98835,
    "trimestral": 49500,
    "semestral": 99000,
    "anual": 198000
  },
  "166": {
    "mensual": 99434,
    "trimestral": 49800,
    "semestral": 99600,
    "anual": 199200
  },
  "167": {
    "mensual": 100033,
    "trimestral": 50100,
    "semestral": 100200,
    "anual": 200400
  },
  "168": {
    "mensual": 100632,
    "trimestral": 50400,
    "semestral": 100800,
    "anual": 201600
  },
  "169": {
    "mensual": 101231,
    "trimestral": 50700,
    "semestral": 101400,
    "anual": 202800
  },
  "170": {
    "mensual": 101830,
    "trimestral": 51000,
    "semestral": 102000,
    "anual": 204000
  },
  "171": {
    "mensual": 102429,
    "trimestral": 51300,
    "semestral": 102600,
    "anual": 205200
  },
  "172": {
    "mensual": 103028,
    "trimestral": 51600,
    "semestral": 103200,
    "anual": 206400
  },
  "173": {
    "mensual": 103627,
    "trimestral": 51900,
    "semestral": 103800,
    "anual": 207600
  },
  "174": {
    "mensual": 104226,
    "trimestral": 52200,
    "semestral": 104400,
    "anual": 208800
  },
  "175": {
    "mensual": 104825,
    "trimestral": 52500,
    "semestral": 105000,
    "anual": 210000
  },
  "176": {
    "mensual": 105424,
    "trimestral": 52800,
    "semestral": 105600,
    "anual": 211200
  },
  "177": {
    "mensual": 106023,
    "trimestral": 53100,
    "semestral": 106200,
    "anual": 212400
  },
  "178": {
    "mensual": 106622,
    "trimestral": 53400,
    "semestral": 106800,
    "anual": 213600
  },
  "179": {
    "mensual": 107221,
    "trimestral": 53700,
    "semestral": 107400,
    "anual": 214800
  },
  "180": {
    "mensual": 107820,
    "trimestral": 54000,
    "semestral": 108000,
    "anual": 216000
  },
  "181": {
    "mensual": 108419,
    "trimestral": 54300,
    "semestral": 108600,
    "anual": 217200
  },
  "182": {
    "mensual": 109018,
    "trimestral": 54600,
    "semestral": 109200,
    "anual": 218400
  },
  "183": {
    "mensual": 109617,
    "trimestral": 54900,
    "semestral": 109800,
    "anual": 219600
  },
  "184": {
    "mensual": 110216,
    "trimestral": 55200,
    "semestral": 110400,
    "anual": 220800
  },
  "185": {
    "mensual": 110815,
    "trimestral": 55500,
    "semestral": 111000,
    "anual": 222000
  },
  "186": {
    "mensual": 111414,
    "trimestral": 55800,
    "semestral": 111600,
    "anual": 223200
  },
  "187": {
    "mensual": 112013,
    "trimestral": 56100,
    "semestral": 112200,
    "anual": 224400
  },
  "188": {
    "mensual": 112612,
    "trimestral": 56400,
    "semestral": 112800,
    "anual": 225600
  },
  "189": {
    "mensual": 113211,
    "trimestral": 56700,
    "semestral": 113400,
    "anual": 226800
  },
  "190": {
    "mensual": 113810,
    "trimestral": 57000,
    "semestral": 114000,
    "anual": 228000
  },
  "191": {
    "mensual": 114409,
    "trimestral": 57300,
    "semestral": 114600,
    "anual": 229200
  },
  "192": {
    "mensual": 115008,
    "trimestral": 57600,
    "semestral": 115200,
    "anual": 230400
  },
  "193": {
    "mensual": 115607,
    "trimestral": 57900,
    "semestral": 115800,
    "anual": 231600
  },
  "194": {
    "mensual": 116206,
    "trimestral": 58200,
    "semestral": 116400,
    "anual": 232800
  },
  "195": {
    "mensual": 116805,
    "trimestral": 58500,
    "semestral": 117000,
    "anual": 234000
  },
  "196": {
    "mensual": 117404,
    "trimestral": 58800,
    "semestral": 117600,
    "anual": 235200
  },
  "197": {
    "mensual": 118003,
    "trimestral": 59100,
    "semestral": 118200,
    "anual": 236400
  },
  "198": {
    "mensual": 118602,
    "trimestral": 59400,
    "semestral": 118800,
    "anual": 237600
  },
  "199": {
    "mensual": 119201,
    "trimestral": 59700,
    "semestral": 119400,
    "anual": 238800
  },
  "200": {
    "mensual": 119800,
    "trimestral": 60000,
    "semestral": 120000,
    "anual": 240000
  }
};

const ASESORES = {
  "cc": {
    "nombre": "Contact Center",
    "telefono": "5568181068"
  },
  "anahi_cruz": {
    "nombre": "Anahi Cruz",
    "telefono": "5215594484517"
  },
  "doranely_gonzalez": {
    "nombre": "Doranely Gonzalez",
    "telefono": "5215594486001"
  },
  "daniel_brena": {
    "nombre": "Daniel Brena",
    "telefono": "5215597712824"
  },
  "hannali_de_la_garza": {
    "nombre": "Hannali de la Garza",
    "telefono": "5215597710410"
  },
  "asesor5": {
    "nombre": "Asesor 5",
    "telefono": null
  },
  "asesor6": {
    "nombre": "Asesor 6",
    "telefono": null
  },
  "asesor7": {
    "nombre": "Asesor 7",
    "telefono": null
  },
  "asesor8": {
    "nombre": "Asesor 8",
    "telefono": null
  },
  "asesor9": {
    "nombre": "Asesor 9",
    "telefono": null
  }
};

// ── Helpers de región ─────────────────────────
function regionDescuento(ciudad) {
  const raw = String(ciudad || '').trim();

  if (raw === 'FullPrice') return 'FullPrice';
  if (raw === 'CDMX_EDOMEX') return 'CDMX_EDOMEX';
  if (raw === 'JALISCO_NL') return 'JALISCO_NL';
  if (raw === 'QUERETARO') return 'QUERETARO';
  if (raw === 'RESTO') return 'RESTO';

  const value = normalizeText(ciudad);

  if (value === 'fullprice') return 'FullPrice';

  if (
    value === 'cdmx edomex' ||
    value === 'cdmx edo mex' ||
    value === 'cdmx edo mexico' ||
    value === 'cdmx' ||
    value === 'edomex' ||
    value === 'estado de mexico' ||
    value === 'toluca'
  ) return 'CDMX_EDOMEX';

  if (
    value === 'jalisco nl' ||
    value === 'jalisco nuevo leon' ||
    value === 'jalisco' ||
    value === 'nuevo leon'
  ) return 'JALISCO_NL';

  if (value === 'queretaro') return 'QUERETARO';

  return 'RESTO';
}

function getDescuentoMaximo(ciudad) {
  const region = regionDescuento(ciudad);
  return DESCUENTO_MAXIMO_POR_ZONA[region] ?? 0;
}

function regionElite(ciudad) {
  return regionDescuento(ciudad);
}

function regionOportunidades(ciudad) {
  return regionDescuento(ciudad);
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ');
}

// ── Helpers de cálculo ────────────────────────
function mesesPorPeriodo(periodo) {
  return MESES_POR_PERIODO[periodo] || 12;
}

function paquetePorInventario(inventario) {
  const inv = Number(inventario) || 300;

  if (inv <= 10) return 10;
  if (inv <= 40) return 40;
  if (inv <= 80) return 80;
  if (inv <= 140) return 140;
  if (inv <= 300) return 300;
  if (inv <= 500) return 500;

  return 500;
}

function precioOportunidadesMensual(ciudad, inventario) {
  const full = precioOportunidadesFullMensual(inventario);
  const descuentoCatalogo = getDescuentoMaximo(ciudad);
  const region = regionOportunidades(ciudad);
  const mensual = Math.round(full.mensual * (1 - descuentoCatalogo / 100));

  return {
    mensual,
    region,
    paquete: full.paquete,
    extras: full.extras,
    descuentoCatalogo
  };
}

function precioOportunidadesFullMensual(inventario) {
  const row = OPORTUNIDADES_ILIMITADAS_PRECIOS_MENSUALES.FullPrice;
  const inv = Number(inventario) || 300;

  if (inv <= 500) {
    const paquete = paquetePorInventario(inv);
    return {
      mensual: row[String(paquete)],
      paquete,
      extras: 0
    };
  }

  const extras = Math.ceil((inv - 500) / 500);
  return {
    mensual: row["500"] + extras * row.extra500,
    paquete: 500,
    extras
  };
}

function precioEliteMensual(ciudad, inventario) {
  const region = regionElite(ciudad);
  const row = ELITE_PRECIOS_MENSUALES[region] || ELITE_PRECIOS_MENSUALES.RESTO;
  const inv = Number(inventario) || 300;

  if (inv <= 300) {
    return { mensual: row.hasta300, region, extras: 0 };
  }

  if (inv <= 500) {
    return { mensual: row.hasta500, region, extras: 0 };
  }

  const extras = Math.ceil((inv - 500) / 500);

  return {
    mensual: row.hasta500 + extras * row.extra500,
    region,
    extras
  };
}

function getPrecioElite(ciudad, inventario, periodo) {
  return precioEliteMensual(ciudad, inventario).mensual * mesesPorPeriodo(periodo);
}

function getPrecioOportunidades(ciudad, inventario, periodo) {
  return precioOportunidadesMensual(ciudad, inventario).mensual * mesesPorPeriodo(periodo);
}

function getPrecioOportunidadesFull(inventario, periodo) {
  return precioOportunidadesFullMensual(inventario).mensual * mesesPorPeriodo(periodo);
}

function getPrecioDestacados(qty, periodo) {
  const cantidad = Math.max(1, Math.min(200, Math.round(Number(qty) || 1)));
  const row = DESTACADOS_PRECIOS[String(cantidad)];

  if (!row) return 0;

  return row[periodo] || row.anual || 0;
}

function getPrecioPrime(qty, periodo) {
  const cantidad = Math.max(1, Math.min(200, Math.round(Number(qty) || 1)));
  return PRIME_FULLPRICE_MENSUAL * cantidad * mesesPorPeriodo(periodo);
}

function applyDiscount(precio, pct) {
  const descuento = Number(pct) || 0;

  if (!descuento || descuento <= 0) {
    return { final: precio, original: null, pct: 0 };
  }

  const final = Math.round(precio * (1 - descuento / 100));
  return { final, original: precio, pct: descuento };
}

function priceObject(final, original = null, pct = 0, extra = {}) {
  return {
    final: Math.round(final),
    original: original && original > final ? Math.round(original) : null,
    pct: pct || 0,
    ...extra
  };
}

function fmt(n) {
  return '$' + Math.round(Number(n || 0)).toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${parseInt(d)} de ${months[parseInt(m) - 1]} de ${y}`;
}
