import type { Coords } from '../types/trip';

/**
 * 港鐵重鐵全網資料（2026 版，參照港鐵官方 System Map 的拓撲與相對位置重新繪製）
 *
 * 座標系說明：
 * - `pos`  ：路綫示意圖（schematic）座標，45° 八方向排版，單位約 1px
 * - `pos2` ：轉乘站膠囊另一端（兩條路綫平行並行的站，例如太子／旺角／油麻地）
 * - `coords`：真實經緯度，用於「最近車站」與地理模式
 *
 * 路綫 `segments` 由「車站 id」或「轉折點 [x, y]」組成；`id@2` 代表此路綫走該站的 pos2。
 */

export type MtrLineId = 'ael' | 'tcl' | 'drl' | 'twl' | 'ktl' | 'tml' | 'eal' | 'isl' | 'sil' | 'tkl';
export type LabelPos = 'l' | 'r' | 't' | 'b' | 'tl' | 'tr' | 'bl' | 'br';
export type PathToken = string | [number, number];

export interface MtrLineDef {
  id: MtrLineId;
  code: string;
  zh: string;
  en: string;
  color: string;
  /** 一條路綫可包含主綫與支綫 */
  segments: PathToken[][];
}

export interface MtrStationDef {
  id: string;
  code: string;
  zh: string;
  en: string;
  coords: Coords;
  pos: [number, number];
  pos2?: [number, number];
  label?: LabelPos;
  isBase?: boolean;
  /** 從帝京酒店出發的旅人小抄 */
  tip?: string;
  /** 周邊景點 */
  nearby?: string;
}

export const MTR_LINE_DEFS: MtrLineDef[] = [
  {
    id: 'eal',
    code: 'EAL',
    zh: '東鐵綫',
    en: 'East Rail Line',
    color: '#53B7E8',
    segments: [
      [
        'admiralty@2', [762, 828], [780, 810], 'exhibition', 'hung-hom', 'mong-kok-east', 'kowloon-tong', 'tai-wai',
        'sha-tin', 'fo-tan', 'racecourse', 'university', 'tai-po-market', 'tai-wo', 'fanling', 'sheung-shui', 'lo-wu'
      ],
      ['sheung-shui', [740, -440], 'lok-ma-chau']
    ]
  },
  {
    id: 'tml',
    code: 'TML',
    zh: '屯馬綫',
    en: 'Tuen Ma Line',
    color: '#923011',
    segments: [
      [
        'tuen-mun', 'siu-hong', 'tin-shui-wai', [40, 140], 'long-ping', 'yuen-long', 'kam-sheung-road', [320, 140], [400, 220],
        'tsuen-wan-west', 'mei-foo', 'nam-cheong', [480, 580], [480, 680], [520, 720], 'austin', 'east-tsim-sha-tsui',
        'hung-hom', [840, 660], 'ho-man-tin', 'to-kwa-wan', 'sung-wong-toi', 'kai-tak', 'diamond-hill', [960, 250],
        'hin-keng', [820, 110], 'tai-wai@2', [820, 60], 'che-kung-temple', 'sha-tin-wai', 'city-one', 'shek-mun',
        'tai-shui-hang', 'heng-on', 'ma-on-shan', 'wu-kai-sha'
      ]
    ]
  },
  {
    id: 'twl',
    code: 'TWL',
    zh: '荃灣綫',
    en: 'Tsuen Wan Line',
    color: '#ED1D24',
    segments: [
      [
        'central@2', 'admiralty@2', 'tsim-sha-tsui', 'jordan', 'yau-ma-tei', 'mong-kok', 'prince-edward', [640, 400],
        [620, 380], 'sham-shui-po', 'cheung-sha-wan', 'lai-chi-kok', 'mei-foo', 'lai-king', 'kwai-fong', 'kwai-hing',
        'tai-wo-hau', 'tsuen-wan'
      ]
    ]
  },
  {
    id: 'ktl',
    code: 'KTL',
    zh: '觀塘綫',
    en: 'Kwun Tong Line',
    color: '#00AB4E',
    segments: [
      [
        'whampoa', 'ho-man-tin', [764, 640], 'yau-ma-tei@2', 'mong-kok@2', 'prince-edward@2', 'shek-kip-mei', [664, 320],
        [704, 280], 'kowloon-tong', 'lok-fu', 'wong-tai-sin', 'diamond-hill', 'choi-hung', 'kowloon-bay', 'ngau-tau-kok',
        'kwun-tong', 'lam-tin', [1240, 480], 'yau-tong', 'tiu-keng-leng'
      ]
    ]
  },
  {
    id: 'isl',
    code: 'ISL',
    zh: '港島綫',
    en: 'Island Line',
    color: '#007DC5',
    segments: [
      [
        'kennedy-town', 'hku', 'sai-ying-pun', 'sheung-wan', 'central', 'admiralty', 'wan-chai', 'causeway-bay', 'tin-hau',
        'fortress-hill', 'north-point', 'quarry-bay', 'tai-koo', 'sai-wan-ho', 'shau-kei-wan', 'heng-fa-chuen', 'chai-wan'
      ]
    ]
  },
  {
    id: 'sil',
    code: 'SIL',
    zh: '南港島綫',
    en: 'South Island Line',
    color: '#BAC429',
    segments: [['admiralty', 'ocean-park', [590, 1000], 'wong-chuk-hang', 'lei-tung', 'south-horizons']]
  },
  {
    id: 'tkl',
    code: 'TKL',
    zh: '將軍澳綫',
    en: 'Tseung Kwan O Line',
    color: '#7D499D',
    segments: [
      [
        'north-point@2', 'quarry-bay@2', [1160, 836], [1240, 756], 'yau-tong@2', 'tiu-keng-leng@2', 'tseung-kwan-o',
        'hang-hau', 'po-lam'
      ],
      ['tseung-kwan-o', 'lohas-park']
    ]
  },
  {
    id: 'tcl',
    code: 'TCL',
    zh: '東涌綫',
    en: 'Tung Chung Line',
    color: '#F7943E',
    segments: [
      ['hong-kong', 'kowloon', 'olympic', 'nam-cheong', [320, 420], 'lai-king', 'tsing-yi', 'sunny-bay', 'tung-chung']
    ]
  },
  {
    id: 'ael',
    code: 'AEL',
    zh: '機場快綫',
    en: 'Airport Express',
    color: '#00888A',
    segments: [['hong-kong@2', 'kowloon@2', [376, 596], 'tsing-yi', 'airport', 'asiaworld-expo']]
  },
  {
    id: 'drl',
    code: 'DRL',
    zh: '迪士尼綫',
    en: 'Disneyland Resort Line',
    color: '#F173AC',
    segments: [['sunny-bay', 'disneyland']]
  }
];

/** 站外步行轉乘通道（不同站名但地下相連） */
export const MTR_WALKWAYS: Array<{ a: string; b: string; minutes: number; label: string }> = [
  { a: 'hong-kong', b: 'central', minutes: 6, label: '香港站 ↔ 中環站 地下通道' },
  { a: 'tsim-sha-tsui', b: 'east-tsim-sha-tsui', minutes: 5, label: '尖沙咀站 ↔ 尖東站 地下通道' }
];

export const MTR_STATION_DEFS: MtrStationDef[] = [
  // ───────── 機場快綫／東涌綫／迪士尼綫 ─────────
  {
    id: 'hong-kong', code: 'hok', zh: '香港', en: 'Hong Kong', coords: [22.2849, 114.1581], pos: [400, 790], pos2: [376, 790], label: 'l',
    tip: '與中環站地下通道相連，機場快綫市區預辦登機。', nearby: 'IFC 國際金融中心，還有搭天星小輪的中環碼頭'
  },
  {
    id: 'kowloon', code: 'kow', zh: '九龍', en: 'Kowloon', coords: [22.3049, 114.1615], pos: [400, 680], pos2: [376, 680], label: 'l',
    tip: '旺角站 → 荔景轉東涌綫至九龍，或搭的士約 10 分鐘直達。', nearby: '西九文化區 M+ 博物館，圓方商場，還有機場快綫市區預辦登機'
  },
  {
    id: 'olympic', code: 'oly', zh: '奧運', en: 'Olympic', coords: [22.3178, 114.1602], pos: [400, 590], label: 'r',
    tip: '從旺角步行約 15 分鐘或搭小巴即達。', nearby: '奧海城和大角咀美食區'
  },
  {
    id: 'nam-cheong', code: 'nac', zh: '南昌', en: 'Nam Cheong', coords: [22.3266, 114.1537], pos: [400, 500], label: 'l',
    tip: '旺角站搭荃灣綫至美孚轉屯馬綫 1 站即達。', nearby: 'V Walk 和深水埗西'
  },
  {
    id: 'lai-king', code: 'lak', zh: '荔景', en: 'Lai King', coords: [22.3484, 114.1261], pos: [320, 380], label: 'tr',
    tip: '旺角站搭荃灣綫 4 站即達，對面月台無縫轉乘東涌綫！', nearby: '前往東涌或迪士尼的重要轉車站'
  },
  {
    id: 'tsing-yi', code: 'tsy', zh: '青衣', en: 'Tsing Yi', coords: [22.3584, 114.1075], pos: [240, 460], label: 'tl',
    tip: '東涌綫與機場快綫轉乘樞紐，鄰近青衣城。', nearby: '青馬大橋海景區域和青衣城'
  },
  {
    id: 'sunny-bay', code: 'sun', zh: '欣澳', en: 'Sunny Bay', coords: [22.3317, 114.0289], pos: [160, 540], label: 'r',
    tip: '旺角站荃灣綫 → 荔景轉東涌綫至欣澳，約 28 分鐘。', nearby: '轉乘迪士尼綫往香港迪士尼樂園'
  },
  {
    id: 'tung-chung', code: 'tuc', zh: '東涌', en: 'Tung Chung', coords: [22.2892, 113.9415], pos: [80, 620], label: 'b',
    tip: '步行至旺角站搭荃灣綫 → 荔景站轉東涌綫 → 終點站東涌，約 38 分鐘。', nearby: '昂坪 360 纜車站，東薈城名店倉裡有 Bakehouse，還有往大澳的巴士總站'
  },
  {
    id: 'disneyland', code: 'dis', zh: '迪士尼', en: 'Disneyland Resort', coords: [22.3158, 114.0453], pos: [160, 620], label: 'b',
    tip: '欣澳站換乘可愛米奇車窗的迪士尼綫，約 35 分鐘。', nearby: '香港迪士尼樂園，是 Day 3 可以彈性替換的選項'
  },
  {
    id: 'airport', code: 'air', zh: '機場', en: 'Airport', coords: [22.3159, 113.9365], pos: [60, 460], label: 'l',
    tip: '機場快綫從九龍站到機場約 20 分鐘，也可以搭東涌綫到東涌再轉 S1 巴士。', nearby: 'HB703 在這裡抵達，回程 UO116 從二號客運大樓出發'
  },
  {
    id: 'asiaworld-expo', code: 'awe', zh: '博覽館', en: 'AsiaWorld-Expo', coords: [22.321, 113.9424], pos: [60, 400], label: 'l',
    tip: '機場快綫終點站。', nearby: '亞洲國際博覽館'
  },

  // ───────── 荃灣綫 ─────────
  {
    id: 'central', code: 'cen', zh: '中環', en: 'Central', coords: [22.2819, 114.158], pos: [520, 860], pos2: [520, 828], label: 'b',
    tip: '旺角站搭荃灣綫直達，約 13 分鐘，或旺角東搭東鐵綫至金鐘轉 1 站。', nearby: '大館，石板街，半山扶梯，蘭芳園，還有 Bakehouse'
  },
  {
    id: 'admiralty', code: 'adm', zh: '金鐘', en: 'Admiralty', coords: [22.279, 114.1648], pos: [640, 860], pos2: [640, 828], label: 'br',
    tip: '旺角東站搭東鐵綫過海 3 站直達金鐘，約 11 分鐘，不用轉車超省時！', nearby: '步行約 10 分鐘可達山頂纜車總站和香港公園'
  },
  {
    id: 'tsim-sha-tsui', code: 'tst', zh: '尖沙咀', en: 'Tsim Sha Tsui', coords: [22.2976, 114.1722], pos: [640, 660], label: 'l',
    tip: '旺角站搭荃灣綫 3 站即達，約 7 分鐘，地下通道可往尖東站。', nearby: '海港城，珍妮曲奇，九龍公園，還有天星小輪碼頭'
  },
  {
    id: 'jordan', code: 'jor', zh: '佐敦', en: 'Jordan', coords: [22.3049, 114.1717], pos: [640, 600], label: 'l',
    tip: '旺角站搭荃灣綫 2 站即達，約 5 分鐘。', nearby: '廟街興記煲仔飯，佳佳甜品，還有澳洲牛奶公司'
  },
  {
    id: 'yau-ma-tei', code: 'ymt', zh: '油麻地', en: 'Yau Ma Tei', coords: [22.3129, 114.1707], pos: [640, 540], pos2: [664, 540], label: 'l',
    tip: '旺角站搭荃灣綫或觀塘綫 1 站即達。', nearby: '廟街夜市北段和果欄'
  },
  {
    id: 'mong-kok', code: 'mok', zh: '旺角', en: 'Mong Kok', coords: [22.3193, 114.1694], pos: [640, 480], pos2: [664, 480], label: 'l',
    tip: '從帝京酒店穿過新世紀廣場天橋步行約 8 分鐘即達。', nearby: '金華冰廳，女人街，還有朗豪坊'
  },
  {
    id: 'prince-edward', code: 'pre', zh: '太子', en: 'Prince Edward', coords: [22.3246, 114.1683], pos: [640, 420], pos2: [664, 420], label: 'l',
    tip: '從帝京酒店步行約 7 分鐘即達。', nearby: '一點心米其林港點和金魚街北段'
  },
  {
    id: 'sham-shui-po', code: 'ssp', zh: '深水埗', en: 'Sham Shui Po', coords: [22.3308, 114.1622], pos: [580, 380], label: 't',
    tip: '旺角站搭荃灣綫 2 站即達。', nearby: '鴨寮街，合益泰腸粉，還有文青咖啡街'
  },
  { id: 'cheung-sha-wan', code: 'csw', zh: '長沙灣', en: 'Cheung Sha Wan', coords: [22.3355, 114.1563], pos: [520, 380], label: 't' },
  { id: 'lai-chi-kok', code: 'lck', zh: '荔枝角', en: 'Lai Chi Kok', coords: [22.3373, 114.1481], pos: [460, 380], label: 't' },
  {
    id: 'mei-foo', code: 'mef', zh: '美孚', en: 'Mei Foo', coords: [22.3381, 114.1394], pos: [400, 380], label: 'tl',
    tip: '旺角站搭荃灣綫 3 站即達。', nearby: '荔枝角公園和嶺南之風'
  },
  { id: 'kwai-fong', code: 'kwf', zh: '葵芳', en: 'Kwai Fong', coords: [22.357, 114.1278], pos: [280, 340], label: 'l' },
  { id: 'kwai-hing', code: 'kwh', zh: '葵興', en: 'Kwai Hing', coords: [22.3632, 114.1312], pos: [240, 300], label: 'l' },
  { id: 'tai-wo-hau', code: 'twh', zh: '大窩口', en: 'Tai Wo Hau', coords: [22.3707, 114.125], pos: [200, 260], label: 'l' },
  {
    id: 'tsuen-wan', code: 'tsw', zh: '荃灣', en: 'Tsuen Wan', coords: [22.3738, 114.1176], pos: [160, 220], label: 'l',
    tip: '旺角站搭荃灣綫往荃灣方向總站。', nearby: '南豐紗廠和荃灣廣場'
  },

  // ───────── 觀塘綫 ─────────
  {
    id: 'whampoa', code: 'wha', zh: '黃埔', en: 'Whampoa', coords: [22.3051, 114.1896], pos: [910, 640], label: 'b',
    tip: '旺角站搭觀塘綫 3 站即達。', nearby: '黃埔天地和紅磡海濱長廊'
  },
  {
    id: 'ho-man-tin', code: 'hom', zh: '何文田', en: 'Ho Man Tin', coords: [22.3094, 114.1827], pos: [840, 640], label: 'b',
    tip: '旺角站搭觀塘綫 2 站即達。', nearby: '愛民邨和紅磡北'
  },
  { id: 'shek-kip-mei', code: 'skm', zh: '石硤尾', en: 'Shek Kip Mei', coords: [22.3322, 114.1688], pos: [664, 350], label: 'r' },
  {
    id: 'kowloon-tong', code: 'kot', zh: '九龍塘', en: 'Kowloon Tong', coords: [22.337, 114.1762], pos: [780, 280], label: 'tr',
    tip: '旺角東站搭東鐵綫 1 站即達。', nearby: '又一城商場'
  },
  { id: 'lok-fu', code: 'lof', zh: '樂富', en: 'Lok Fu', coords: [22.3381, 114.1873], pos: [850, 280], label: 'b' },
  {
    id: 'wong-tai-sin', code: 'wts', zh: '黃大仙', en: 'Wong Tai Sin', coords: [22.3418, 114.1935], pos: [910, 280], label: 'b',
    nearby: '黃大仙祠'
  },
  {
    id: 'diamond-hill', code: 'dih', zh: '鑽石山', en: 'Diamond Hill', coords: [22.3401, 114.2016], pos: [960, 280], label: 'tr',
    tip: '旺角站搭觀塘綫 5 站即達。', nearby: '志蓮淨苑，南蓮園池，還有荷里活廣場'
  },
  { id: 'choi-hung', code: 'chh', zh: '彩虹', en: 'Choi Hung', coords: [22.3349, 114.2091], pos: [1040, 280], label: 't', nearby: '彩虹邨打卡籃球場' },
  { id: 'kowloon-bay', code: 'kob', zh: '九龍灣', en: 'Kowloon Bay', coords: [22.3233, 114.214], pos: [1080, 320], label: 'tr' },
  { id: 'ngau-tau-kok', code: 'ntk', zh: '牛頭角', en: 'Ngau Tau Kok', coords: [22.3155, 114.219], pos: [1120, 360], label: 'tr' },
  {
    id: 'kwun-tong', code: 'kwt', zh: '觀塘', en: 'Kwun Tong', coords: [22.3122, 114.2263], pos: [1160, 400], label: 'tr',
    tip: '旺角站搭觀塘綫直達。', nearby: 'apm 商場和觀塘海濱花園'
  },
  { id: 'lam-tin', code: 'lat', zh: '藍田', en: 'Lam Tin', coords: [22.3069, 114.233], pos: [1200, 440], label: 'tr' },
  {
    id: 'yau-tong', code: 'yat', zh: '油塘', en: 'Yau Tong', coords: [22.2979, 114.237], pos: [1240, 560], pos2: [1240, 584], label: 'l',
    tip: '旺角站搭觀塘綫直達。', nearby: '鯉魚門海鮮街和大本型'
  },
  {
    id: 'tiu-keng-leng', code: 'tik', zh: '調景嶺', en: 'Tiu Keng Leng', coords: [22.3044, 114.2527], pos: [1320, 560], pos2: [1320, 584], label: 't',
    tip: '旺角站搭觀塘綫終點站。', nearby: '將軍澳南海濱'
  },

  // ───────── 將軍澳綫 ─────────
  { id: 'tseung-kwan-o', code: 'tko', zh: '將軍澳', en: 'Tseung Kwan O', coords: [22.3075, 114.2598], pos: [1400, 584], label: 'b' },
  { id: 'hang-hau', code: 'hah', zh: '坑口', en: 'Hang Hau', coords: [22.3155, 114.2645], pos: [1440, 544], label: 'r' },
  {
    id: 'po-lam', code: 'poa', zh: '寶琳', en: 'Po Lam', coords: [22.3226, 114.258], pos: [1480, 504], label: 'r',
    tip: '旺角站觀塘綫至調景嶺轉將軍澳綫。', nearby: '新都城中心'
  },
  { id: 'lohas-park', code: 'lhp', zh: '康城', en: 'LOHAS Park', coords: [22.2954, 114.269], pos: [1460, 644], label: 'r' },

  // ───────── 港島綫 ─────────
  {
    id: 'kennedy-town', code: 'ket', zh: '堅尼地城', en: 'Kennedy Town', coords: [22.2813, 114.1287], pos: [200, 860], label: 'b',
    tip: '旺角東搭東鐵綫至金鐘轉港島綫西行總站。', nearby: '堅尼地城海旁和籃球場打卡位'
  },
  { id: 'hku', code: 'hku', zh: '香港大學', en: 'HKU', coords: [22.284, 114.1352], pos: [270, 860], label: 'b' },
  { id: 'sai-ying-pun', code: 'syp', zh: '西營盤', en: 'Sai Ying Pun', coords: [22.2857, 114.1426], pos: [340, 860], label: 'b' },
  {
    id: 'sheung-wan', code: 'shw', zh: '上環', en: 'Sheung Wan', coords: [22.2866, 114.1517], pos: [430, 860], label: 'b',
    tip: '旺角東搭東鐵綫至金鐘 → 轉港島綫 2 站即達。', nearby: '九記牛腩，文武廟，還有西港城'
  },
  {
    id: 'wan-chai', code: 'wac', zh: '灣仔', en: 'Wan Chai', coords: [22.2775, 114.173], pos: [740, 860], label: 'b',
    tip: '旺角東至金鐘轉港島綫 1 站即達。', nearby: '利東街，藍屋建築群，還有叮叮車沿線'
  },
  {
    id: 'causeway-bay', code: 'cab', zh: '銅鑼灣', en: 'Causeway Bay', coords: [22.2802, 114.1838], pos: [820, 860], label: 'b',
    tip: '旺角東至金鐘轉港島綫 2 站即達，也可以從中環搭叮叮車慢慢晃過來。', nearby: '希慎廣場，時代廣場，還有鵝頸橋'
  },
  { id: 'tin-hau', code: 'tih', zh: '天后', en: 'Tin Hau', coords: [22.2826, 114.1918], pos: [900, 860], label: 'b' },
  { id: 'fortress-hill', code: 'foh', zh: '炮台山', en: 'Fortress Hill', coords: [22.2881, 114.1935], pos: [970, 860], label: 'b' },
  {
    id: 'north-point', code: 'nop', zh: '北角', en: 'North Point', coords: [22.2911, 114.2005], pos: [1040, 860], pos2: [1040, 836], label: 'b',
    tip: '旺角東至金鐘轉港島綫。', nearby: '春秧街叮叮車市場和北角海濱'
  },
  {
    id: 'quarry-bay', code: 'qub', zh: '鰂魚涌', en: 'Quarry Bay', coords: [22.288, 114.2097], pos: [1120, 860], pos2: [1120, 836], label: 'b',
    tip: '旺角東至金鐘轉港島綫。', nearby: '海山樓，也就是大家說的怪獸大廈'
  },
  { id: 'tai-koo', code: 'tak', zh: '太古', en: 'Tai Koo', coords: [22.2849, 114.2163], pos: [1190, 860], label: 'b', nearby: '太古城中心' },
  { id: 'sai-wan-ho', code: 'swh', zh: '西灣河', en: 'Sai Wan Ho', coords: [22.2822, 114.2218], pos: [1260, 860], label: 'b' },
  { id: 'shau-kei-wan', code: 'skw', zh: '筲箕灣', en: 'Shau Kei Wan', coords: [22.2792, 114.2287], pos: [1330, 860], label: 'b' },
  { id: 'heng-fa-chuen', code: 'hfc', zh: '杏花邨', en: 'Heng Fa Chuen', coords: [22.2768, 114.2397], pos: [1400, 860], label: 'b' },
  {
    id: 'chai-wan', code: 'chw', zh: '柴灣', en: 'Chai Wan', coords: [22.2646, 114.237], pos: [1470, 860], label: 'b',
    tip: '港島綫東行終點站。', nearby: '羅屋民俗館'
  },

  // ───────── 南港島綫 ─────────
  {
    id: 'ocean-park', code: 'ocp', zh: '海洋公園', en: 'Ocean Park', coords: [22.2486, 114.1742], pos: [640, 950], label: 'r',
    tip: '旺角東搭東鐵綫至金鐘轉南港島綫 1 站即達！', nearby: '香港海洋公園正門'
  },
  { id: 'wong-chuk-hang', code: 'wch', zh: '黃竹坑', en: 'Wong Chuk Hang', coords: [22.248, 114.168], pos: [560, 1000], label: 'b' },
  { id: 'lei-tung', code: 'let', zh: '利東', en: 'Lei Tung', coords: [22.2421, 114.156], pos: [480, 1000], label: 'b' },
  {
    id: 'south-horizons', code: 'soh', zh: '海怡半島', en: 'South Horizons', coords: [22.2426, 114.149], pos: [400, 1000], label: 'b',
    tip: '金鐘轉南港島綫終點站。', nearby: '鴨脷洲海濱長廊'
  },

  // ───────── 東鐵綫 ─────────
  {
    id: 'exhibition', code: 'exc', zh: '會展', en: 'Exhibition Centre', coords: [22.2817, 114.1756], pos: [780, 800], label: 'r',
    tip: '旺角東搭東鐵綫 2 站直達，約 9 分鐘。', nearby: '灣仔北，香港會議展覽中心，還有金紫荊廣場'
  },
  {
    id: 'hung-hom', code: 'huh', zh: '紅磡', en: 'Hung Hom', coords: [22.303, 114.1818], pos: [780, 720], label: 'br',
    tip: '旺角東站搭東鐵綫 1 站即達，約 4 分鐘。', nearby: '紅磡體育館和過海往港島前最後一站'
  },
  {
    id: 'mong-kok-east', code: 'mkk', zh: '旺角東', en: 'Mong Kok East', coords: [22.3222, 114.1726], pos: [780, 470], label: 'r', isBase: true,
    tip: '這裡是住宿基地，帝京酒店直通 D 出口！搭東鐵綫 2 站直達會展，3 站就過海到金鐘，超快。', nearby: '帝京酒店 Royal Plaza Hotel 和 MOKO 新世紀廣場'
  },
  {
    id: 'tai-wai', code: 'taw', zh: '大圍', en: 'Tai Wai', coords: [22.3726, 114.1785], pos: [780, 100], pos2: [820, 100], label: 'l',
    tip: '旺角東站搭東鐵綫 2 站即達。', nearby: '圍方商場和車公廟'
  },
  { id: 'sha-tin', code: 'sht', zh: '沙田', en: 'Sha Tin', coords: [22.3825, 114.1873], pos: [780, 40], label: 'l', nearby: '新城市廣場和萬佛寺' },
  { id: 'fo-tan', code: 'fot', zh: '火炭', en: 'Fo Tan', coords: [22.3953, 114.1981], pos: [780, -20], label: 'l' },
  { id: 'racecourse', code: 'rac', zh: '馬場', en: 'Racecourse', coords: [22.4006, 114.2032], pos: [780, -80], label: 'l' },
  { id: 'university', code: 'uni', zh: '大學', en: 'University', coords: [22.4134, 114.2101], pos: [780, -140], label: 'l' },
  { id: 'tai-po-market', code: 'tap', zh: '大埔墟', en: 'Tai Po Market', coords: [22.4447, 114.1704], pos: [780, -220], label: 'r' },
  { id: 'tai-wo', code: 'two', zh: '太和', en: 'Tai Wo', coords: [22.451, 114.1617], pos: [780, -280], label: 'r' },
  { id: 'fanling', code: 'fan', zh: '粉嶺', en: 'Fanling', coords: [22.492, 114.1386], pos: [780, -340], label: 'r' },
  { id: 'sheung-shui', code: 'shs', zh: '上水', en: 'Sheung Shui', coords: [22.5011, 114.1281], pos: [780, -400], label: 'r' },
  {
    id: 'lo-wu', code: 'low', zh: '羅湖', en: 'Lo Wu', coords: [22.5283, 114.1135], pos: [780, -480], label: 't',
    tip: '旺角東站搭東鐵綫北行終點站。', nearby: '羅湖口岸'
  },
  { id: 'lok-ma-chau', code: 'lmc', zh: '落馬洲', en: 'Lok Ma Chau', coords: [22.515, 114.0656], pos: [740, -480], label: 't', nearby: '落馬洲支線口岸' },

  // ───────── 屯馬綫 ─────────
  {
    id: 'tuen-mun', code: 'tum', zh: '屯門', en: 'Tuen Mun', coords: [22.3949, 113.9731], pos: [40, 320], label: 'r',
    tip: '旺角站荃灣綫至美孚轉屯馬綫直達。', nearby: 'V city 和屯門市廣場'
  },
  { id: 'siu-hong', code: 'sih', zh: '兆康', en: 'Siu Hong', coords: [22.4114, 113.9789], pos: [40, 260], label: 'r' },
  { id: 'tin-shui-wai', code: 'tis', zh: '天水圍', en: 'Tin Shui Wai', coords: [22.4482, 114.0049], pos: [40, 200], label: 'r' },
  { id: 'long-ping', code: 'lop', zh: '朗屏', en: 'Long Ping', coords: [22.4477, 114.0255], pos: [110, 140], label: 't' },
  { id: 'yuen-long', code: 'yul', zh: '元朗', en: 'Yuen Long', coords: [22.446, 114.0347], pos: [180, 140], label: 't' },
  { id: 'kam-sheung-road', code: 'ksr', zh: '錦上路', en: 'Kam Sheung Road', coords: [22.4346, 114.0634], pos: [260, 140], label: 't' },
  { id: 'tsuen-wan-west', code: 'tww', zh: '荃灣西', en: 'Tsuen Wan West', coords: [22.3684, 114.1094], pos: [400, 280], label: 'r' },
  {
    id: 'austin', code: 'aus', zh: '柯士甸', en: 'Austin', coords: [22.3045, 114.1665], pos: [560, 720], label: 'b',
    tip: '旺角東搭東鐵綫至紅磡轉屯馬綫 2 站即達。', nearby: '香港西九龍高鐵站，西九文化區，還有戲曲中心'
  },
  {
    id: 'east-tsim-sha-tsui', code: 'ets', zh: '尖東', en: 'East Tsim Sha Tsui', coords: [22.2953, 114.1749], pos: [700, 720], label: 'b',
    tip: '旺角東搭東鐵綫至紅磡轉屯馬綫 1 站即達，出站即星光大道與 K11 MUSEA！', nearby: '星光大道，K11 MUSEA，還有香港藝術館'
  },
  { id: 'to-kwa-wan', code: 'tkw', zh: '土瓜灣', en: 'To Kwa Wan', coords: [22.3171, 114.1878], pos: [880, 600], label: 'r' },
  { id: 'sung-wong-toi', code: 'suw', zh: '宋皇臺', en: 'Sung Wong Toi', coords: [22.3259, 114.1912], pos: [920, 560], label: 'r' },
  { id: 'kai-tak', code: 'kat', zh: '啟德', en: 'Kai Tak', coords: [22.3305, 114.1993], pos: [960, 520], label: 'r', nearby: '啟德體育園和 AIRSIDE' },
  { id: 'hin-keng', code: 'hik', zh: '顯徑', en: 'Hin Keng', coords: [22.3639, 114.1708], pos: [890, 180], label: 'l' },
  { id: 'che-kung-temple', code: 'ckt', zh: '車公廟', en: 'Che Kung Temple', coords: [22.3747, 114.1859], pos: [860, 20], label: 't', nearby: '沙田車公廟' },
  { id: 'sha-tin-wai', code: 'stw', zh: '沙田圍', en: 'Sha Tin Wai', coords: [22.377, 114.1949], pos: [930, 20], label: 't' },
  { id: 'city-one', code: 'cio', zh: '第一城', en: 'City One', coords: [22.383, 114.2038], pos: [1000, 20], label: 't' },
  { id: 'shek-mun', code: 'shm', zh: '石門', en: 'Shek Mun', coords: [22.3877, 114.2083], pos: [1070, 20], label: 't' },
  { id: 'tai-shui-hang', code: 'tsh', zh: '大水坑', en: 'Tai Shui Hang', coords: [22.4086, 114.2228], pos: [1140, 20], label: 't' },
  { id: 'heng-on', code: 'heo', zh: '恆安', en: 'Heng On', coords: [22.4177, 114.2257], pos: [1210, 20], label: 't' },
  { id: 'ma-on-shan', code: 'mos', zh: '馬鞍山', en: 'Ma On Shan', coords: [22.4249, 114.2318], pos: [1280, 20], label: 't' },
  {
    id: 'wu-kai-sha', code: 'wks', zh: '烏溪沙', en: 'Wu Kai Sha', coords: [22.429, 114.2437], pos: [1350, 20], label: 't',
    tip: '旺角東搭東鐵綫至大圍轉屯馬綫。', nearby: '烏溪沙海濱和馬鞍山公園'
  }
];

/** 帝京酒店所在、預設的出發站 */
export const MTR_BASE_STATION_ID = 'mong-kok-east';
