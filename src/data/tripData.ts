import type { ChecklistItem, Coords, ItineraryDay, MtrLine, MtrStation } from '../types/trip';

export const HOTEL_COORDS: Coords = [22.3239, 114.1727]; // 帝京酒店 (旺角東站)

export const TRIP_META = {
  title: '香江拾光・四日手帖',
  subtitle: 'HB703 啟程 × 帝京酒店連泊 × UO116 歸途',
  year: 2026,
  startDate: '2026-11-22T09:00:00+08:00',
  endDate: '2026-11-25T20:25:00+08:00',
  hotel: {
    name: '帝京酒店 Royal Plaza Hotel',
    address: '香港九龍旺角太子道西 193 號',
    station: '港鐵旺角東站 D 出口（直通 MOKO 新世紀廣場）',
    coords: HOTEL_COORDS,
    checkIn: '2026-11-22 15:00',
    checkOut: '2026-11-25 11:00'
  }
};

export const ITINERARY_DAYS: ItineraryDay[] = [
  {
    day: 1,
    date: '2026-11-22',
    dateLabel: 'NOV 22 SUN',
    chineseDate: '十一月廿二日・星期日',
    theme: '抵港與九龍夜色',
    subtitle: '從桃園 T1 飛越海峽，在旺角街巷與維港晚風裡落腳',
    stationTag: '旺角東 MONG KOK EAST',
    stationColor: '#5B9BD5',
    items: [
      {
        id: 'd1-1',
        start: '2026-11-22T09:00:00+08:00',
        end: '2026-11-22T11:35:00+08:00',
        timeLabel: '09:00 — 11:35',
        title: '桃園機場第一航廈報到',
        location: 'TPE Terminal 1',
        district: '桃園',
        districtColor: '#6B7280',
        coords: [25.0802, 121.2392],
        isHK: false,
        mtrId: null,
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_International_Airport.jpg?width=800',
        googleQuery: '桃園國際機場第一航廈',
        description: '辦理大灣區航空 HB703 登機與行李託運，確認護照、電子港簽與行動電源隨身攜帶。',
        tips: '建議 09:15 前抵達 T1 櫃檯，出關後可輕鬆喝杯咖啡候機。'
      },
      {
        id: 'd1-2',
        start: '2026-11-22T11:35:00+08:00',
        end: '2026-11-22T13:40:00+08:00',
        timeLabel: '11:35 — 13:40',
        title: 'HB703 飛往香港',
        location: 'TPE T1 → HKG',
        district: '赤鱲角',
        districtColor: '#1B4332',
        coords: [22.3080, 113.9185],
        isHK: true,
        mtrId: 'airport',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_International_Airport.jpg?width=800',
        googleQuery: '香港國際機場',
        description: '搭乘大灣區航空 HB703 跨越台灣海峽，約 2 小時 5 分鐘後降落赤鱲角國際機場。',
        tips: '降落前可從機窗遠眺大嶼山群峰與港珠澳大橋。'
      },
      {
        id: 'd1-3',
        start: '2026-11-22T13:40:00+08:00',
        end: '2026-11-22T15:30:00+08:00',
        timeLabel: '13:40 — 15:30',
        title: '入境香港・乘城巴進九龍',
        location: '香港國際機場 → 旺角',
        district: '機場',
        districtColor: '#007A78',
        coords: [22.3135, 113.9367],
        isHK: true,
        mtrId: 'airport',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_International_Airport.jpg?width=800',
        googleQuery: '香港機場地面運輸中心',
        description: '通關領行李並設定好手機八達通；搭乘城巴 A21 雙層巴士沿青馬大橋進城，看香港的第一眼風景。',
        tips: 'A21 上層前排視野極佳，直達旺角免扛行李轉車。'
      },
      {
        id: 'd1-4',
        start: '2026-11-22T15:30:00+08:00',
        end: '2026-11-22T16:30:00+08:00',
        timeLabel: '15:30 — 16:30',
        title: '帝京酒店卸下行李',
        location: '旺角東・帝京酒店',
        district: '旺角東',
        districtColor: '#5B9BD5',
        coords: [22.3239, 114.1727],
        isHK: true,
        mtrId: 'mong-kok-east',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mong_Kok_P1010168.JPG?width=800',
        googleQuery: '帝京酒店 Royal Plaza Hotel Hong Kong',
        description: '辦理三晚連住 Check-in，整理隨身小包，準備輕裝走進旺角的老街氣息。',
        tips: '酒店直通 MOKO 新世紀廣場與東鐵線，下樓即是生活圈。'
      },
      {
        id: 'd1-5',
        start: '2026-11-22T16:30:00+08:00',
        end: '2026-11-22T18:30:00+08:00',
        timeLabel: '16:30 — 18:30',
        title: '金魚街、女人街與菠蘿油',
        location: '旺角通菜街・金華冰廳',
        district: '旺角',
        districtColor: '#C83E37',
        coords: [22.3224, 114.1695],
        isHK: true,
        mtrId: 'mong-kok',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mong_Kok_P1010168.JPG?width=800',
        googleQuery: '金華冰廳 旺角',
        description: '散步看金魚街成排透明水袋閃爍的光影，轉進金華冰廳點一顆剛出爐的酥皮菠蘿油與凍奶茶。',
        tips: '傍晚天色轉暗時，旺角街角的招牌燈影最有老香港味道。',
        alternatives: [
          {
            id: 'd1-5-alt',
            label: '人太多免排備案',
            title: '朗豪坊・華嫂冰室 / 敏華冰廳',
            location: '旺角亞皆老街 8 號',
            coords: [22.3183, 114.1684],
            googleQuery: '朗豪坊 旺角',
            description: '若金華冰廳內用客滿，可轉往朗豪坊逛街吹冷氣，改吃敏華冰廳黯然銷魂飯或華嫂招牌菠蘿包。'
          }
        ]
      },
      {
        id: 'd1-6',
        start: '2026-11-22T18:30:00+08:00',
        end: '2026-11-22T21:00:00+08:00',
        timeLabel: '18:30 — 21:00',
        title: '星光大道・天星小輪夜渡',
        location: '尖沙咀海濱 → 維多利亞港',
        district: '尖沙咀',
        districtColor: '#C83E37',
        coords: [22.2932, 114.1724],
        isHK: true,
        mtrId: 'tsim-sha-tsui',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Star_Ferry_on_Victoria_Harbour_(02).jpg?width=800',
        googleQuery: '尖沙咀星光大道',
        description: '沿尖沙咀海濱散步，20:00 看「幻彩詠香江」，接著搭上百年墨綠色天星小輪，在海風中橫渡維港。',
        tips: '推薦選上層木質長椅靠窗位，聽引擎聲與海浪拍打碼頭。'
      },
      {
        id: 'd1-7',
        start: '2026-11-22T21:00:00+08:00',
        end: '2026-11-22T23:00:00+08:00',
        timeLabel: '21:00 — 23:00',
        title: '廟街炭火煲仔飯與甜品',
        location: '佐敦廟街・佳佳甜品',
        district: '佐敦',
        districtColor: '#C83E37',
        coords: [22.3055, 114.1702],
        isHK: true,
        mtrId: 'jordan',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Temple_Street_Night_Market_viewed_from_above_November_2016.jpg?width=800',
        googleQuery: '佳佳甜品 佐敦',
        description: '在廟街夜市吃一鍋焦香鍋巴的興記煲仔飯，再去佳佳甜品喝碗熱騰騰的生磨芝麻糊，返帝京歇息。',
        tips: '煲仔飯淋上甜豉油後蓋鍋悶一分鐘，鍋巴最脆。'
      }
    ]
  },
  {
    day: 2,
    date: '2026-11-23',
    dateLabel: 'NOV 23 MON',
    chineseDate: '十一月廿三日・星期一',
    theme: '港島百年電車與山海夜色',
    subtitle: '一盅兩件早茶開場，搭叮叮車慢讀中環石板街與太平山暮色',
    stationTag: '中環 CENTRAL',
    stationColor: '#004E98',
    items: [
      {
        id: 'd2-1',
        start: '2026-11-23T08:30:00+08:00',
        end: '2026-11-23T09:45:00+08:00',
        timeLabel: '08:30 — 09:45',
        title: '一盅兩件・早茶時光',
        location: '旺角倫敦大酒樓 或 太子一點心',
        district: '太子',
        districtColor: '#C83E37',
        coords: [22.3256, 114.1684],
        isHK: true,
        mtrId: 'prince-edward',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dim-sum-HK.JPG?width=800',
        googleQuery: '一點心 太子',
        description: '清晨在點心推車與茶香之間醒來，點籠蝦餃、燒賣與馬拉糕，感受最道地的九龍早晨。',
        tips: '倫敦大酒樓仍保留傳統阿姐推車叫賣點心的風景。',
        alternatives: [
          {
            id: 'd2-1-alt',
            label: '免等位大空間備案',
            title: '旺角倫敦大酒樓（推車早茶）',
            location: '旺角彌敦道 612 號',
            coords: [22.3173, 114.1701],
            googleQuery: '倫敦大酒樓 旺角',
            description: '一點心排隊人潮過多時，直接走去旺角彌敦道的倫敦大酒樓，座位極多幾乎免排隊，還能體驗阿姐推車文化。'
          }
        ]
      },
      {
        id: 'd2-2',
        start: '2026-11-23T09:45:00+08:00',
        end: '2026-11-23T12:30:00+08:00',
        timeLabel: '09:45 — 12:30',
        title: '大館古蹟與石板街散策',
        location: '中環大館・砵典乍街・半山扶梯',
        district: '中環',
        districtColor: '#004E98',
        coords: [22.2814, 114.1541],
        isHK: true,
        mtrId: 'central',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tai_Kwun_Police_Headquarters_Block_201806.jpg?width=800',
        googleQuery: '大館 Tai Kwun 中環',
        description: '過海來到中環，走進紅磚警察總部改建的「大館」看展，沿花崗岩石板街拾級而上，喝杯蘭芳園絲襪奶茶。',
        tips: '半山自動扶梯上午 10:00 後才轉為上行方向。'
      },
      {
        id: 'd2-3',
        start: '2026-11-23T12:30:00+08:00',
        end: '2026-11-23T14:15:00+08:00',
        timeLabel: '12:30 — 14:15',
        title: '中上環老字號午餐・酸種蛋撻',
        location: '威靈頓街・嘉咸街・Bakehouse',
        district: '上環',
        districtColor: '#004E98',
        coords: [22.2825, 114.1536],
        isHK: true,
        mtrId: 'sheung-wan',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dim_sum.jpg?width=800',
        googleQuery: 'Bakehouse Central 中環',
        description: '品嚐沾仔記鮮蝦雲吞麵或九記清湯腩，飯後外帶一盒剛出爐的 Bakehouse 酸種蛋撻邊走邊吃。',
        tips: '中環巷弄高低錯落，很適合放慢腳步拍街景底片。',
        alternatives: [
          {
            id: 'd2-3-alt',
            label: '快速翻桌備案',
            title: '沾仔記雲吞麵 + 勝香園番茄麵',
            location: '中環威靈頓街 98 號',
            coords: [22.2827, 114.1546],
            googleQuery: '沾仔記 威靈頓街 中環',
            description: '九記或 Bakehouse 排太長時，改吃鄰近的米其林推薦沾仔記（翻桌極快）或露天大排檔勝香園。'
          }
        ]
      },
      {
        id: 'd2-4',
        start: '2026-11-23T14:15:00+08:00',
        end: '2026-11-23T16:45:00+08:00',
        timeLabel: '14:15 — 16:45',
        title: '百年叮叮車橫越港島',
        location: '中環 → 灣仔藍屋 → 銅鑼灣',
        district: '灣仔',
        districtColor: '#004E98',
        coords: [22.2756, 114.1738],
        isHK: true,
        mtrId: 'wan-chai',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_tram_against_building.jpg?width=800',
        googleQuery: '灣仔利東街',
        description: '跳上雙層有軌電車「叮叮車」上層，聽著清脆鈴聲穿過高樓峽谷，中途可停灣仔藍屋與利東街。',
        tips: '叮叮車後門上車、前門下車刷八達通，慢得剛剛好。'
      },
      {
        id: 'd2-5',
        start: '2026-11-23T16:45:00+08:00',
        end: '2026-11-23T19:45:00+08:00',
        timeLabel: '16:45 — 19:45',
        title: '山頂纜車與盧吉道暮色',
        location: '太平山頂・凌霄閣 / 盧吉道',
        district: '山頂',
        districtColor: '#1B4332',
        coords: [22.2711, 114.1499],
        isHK: true,
        mtrId: 'admiralty',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Victoria_Peak,_Hong_Kong.jpg?width=800',
        googleQuery: '太平山頂凌霄閣',
        description: '搭第六代墨綠山頂纜車斜攀上山，步行至免費且清幽的盧吉道觀景台，靜看維港從粉橘暮色化為萬家燈火。',
        tips: '上山坐右側視野最佳，山頂入夜後微涼記得帶薄外套。',
        alternatives: [
          {
            id: 'd2-5-alt',
            label: '纜車人太多改搭巴士',
            title: '城巴 15 號雙層巴士上太平山頂',
            location: '中環交易廣場巴士總站 → 山頂',
            coords: [22.2837, 114.1580],
            googleQuery: '中環交易廣場巴士總站',
            description: '若山頂纜車排隊超過 45 分鐘，建議直接走去中環交易廣場搭 15 號雙層巴士上山，刷八達通免排隊且沿途山海景超美！'
          }
        ]
      },
      {
        id: 'd2-6',
        start: '2026-11-23T19:45:00+08:00',
        end: '2026-11-23T22:00:00+08:00',
        timeLabel: '19:45 — 22:00',
        title: 'Soho 微醺晚餐・歸返旺角',
        location: '中環蘇豪區 → 帝京酒店',
        district: '中環',
        districtColor: '#004E98',
        coords: [22.2810, 114.1558],
        isHK: true,
        mtrId: 'central',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_Tram_(32999512881).jpg?width=800',
        googleQuery: '蘭桂坊 中環',
        description: '下山後在嘉咸街、蘇豪區選間小館子或燒臘店吃晚餐，散步感受中環夜色後搭港鐵回帝京酒店。',
        tips: '若纜車排隊人多，可改搭 15 號雙層巴士蜿蜒下山。'
      }
    ]
  },
  {
    day: 3,
    date: '2026-11-24',
    dateLabel: 'NOV 24 TUE',
    chineseDate: '十一月廿四日・星期二',
    theme: '大嶼山海天與西九落日',
    subtitle: '搭水晶纜車飛越海灣、大澳棚屋慢旅，傍晚回到西九草坪看海',
    stationTag: '東涌 TUNG CHUNG',
    stationColor: '#D97706',
    items: [
      {
        id: 'd3-1',
        start: '2026-11-24T09:00:00+08:00',
        end: '2026-11-24T10:00:00+08:00',
        timeLabel: '09:00 — 10:00',
        title: '出發前往大嶼山東涌',
        location: '帝京酒店 → 港鐵東涌站',
        district: '東涌',
        districtColor: '#D97706',
        coords: [22.2892, 113.9410],
        isHK: true,
        mtrId: 'tung-chung',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ngong_Ping_360_Cable_Car_Ngong_Ping_Lantau_Island_Hong_Kong_-_panoramio.jpg?width=800',
        googleQuery: '港鐵東涌站',
        description: '早晨從旺角出發，經荔景轉乘東涌線前往離島門戶東涌站，準備展開山海一日遊。',
        tips: '本日行程亦可彈性改為「香港迪士尼樂園全日夢幻之旅」。'
      },
      {
        id: 'd3-2',
        start: '2026-11-24T10:00:00+08:00',
        end: '2026-11-24T12:15:00+08:00',
        timeLabel: '10:00 — 12:15',
        title: '昂坪 360 水晶纜車 & 天壇大佛',
        location: '昂坪市集・寶蓮禪寺',
        district: '昂坪',
        districtColor: '#D97706',
        coords: [22.2540, 113.9050],
        isHK: true,
        mtrId: 'tung-chung',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tian_Tan_Buddha,_Hong_Kong.jpg?width=800',
        googleQuery: '天壇大佛 昂坪',
        description: '乘透明車底纜車凌空越過東涌灣與大嶼山翠巒，遠眺機場飛機起降；抵達後漫步山林參拜天壇大佛。',
        tips: '建議事先線上購票換 QR Code，省去現場排隊購票時間。',
        alternatives: [
          {
            id: 'd3-2-alt',
            label: '雨天 / 樂園彈性備案',
            title: '香港迪士尼樂園（或東薈城 Outlet）',
            location: '大嶼山香港迪士尼樂園',
            coords: [22.3130, 114.0413],
            googleQuery: '香港迪士尼樂園',
            description: '若遇天候不佳、纜車停駛或想走夢幻路線，可於欣澳站轉乘迪士尼線展開全日樂園之旅，或留在東薈城室內逛街。'
          }
        ]
      },
      {
        id: 'd3-3',
        start: '2026-11-24T12:15:00+08:00',
        end: '2026-11-24T15:15:00+08:00',
        timeLabel: '12:15 — 15:15',
        title: '大澳水鄉棚屋慢散步',
        location: '大澳漁村・新基大橋',
        district: '大澳',
        districtColor: '#1B4332',
        coords: [22.2547, 113.8624],
        isHK: true,
        mtrId: 'tung-chung',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tai_O,_Hong_Kong_(2052014119).jpg?width=800',
        googleQuery: '大澳漁村 Tai O',
        description: '轉乘巴士進「東方威尼斯」大澳，走在木質水上棚屋巷弄，吃現烤炭火雞蛋仔，並搭小艇出海尋中華白海豚。',
        tips: '大澳豆腐花、沙翁與手作蝦醬是當地必嚐特色。'
      },
      {
        id: 'd3-4',
        start: '2026-11-24T15:15:00+08:00',
        end: '2026-11-24T18:30:00+08:00',
        timeLabel: '15:15 — 18:30',
        title: '西九文化區海濱日落',
        location: 'M+ 博物館・西九藝術公園',
        district: '九龍',
        districtColor: '#D97706',
        coords: [22.3012, 114.1597],
        isHK: true,
        mtrId: 'kowloon',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/M%2B_Museum_Hong_Kong.jpg?width=800',
        googleQuery: 'M+ 博物館 西九文化區',
        description: '返回九龍站步行至西九藝術公園草坪，在海邊點一杯咖啡，看著太陽緩緩沉入維港西側海平面。',
        tips: '傍晚 M+ 建築巨型立面會點亮當代影像藝術作品。'
      },
      {
        id: 'd3-5',
        start: '2026-11-24T18:30:00+08:00',
        end: '2026-11-24T22:00:00+08:00',
        timeLabel: '18:30 — 22:00',
        title: 'K11 MUSEA 晚餐與 MOKO 補貨',
        location: '尖沙咀 → 旺角帝京酒店',
        district: '尖沙咀',
        districtColor: '#C83E37',
        coords: [22.2943, 114.1743],
        isHK: true,
        mtrId: 'tsim-sha-tsui',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Star_Ferry._Victoria_Harbor._Hong_Kong..jpg?width=800',
        googleQuery: 'K11 MUSEA 尖沙咀',
        description: '在尖沙咀 K11 MUSEA 享用晚餐並欣賞建築美學，回旺角 MOKO 採買藥妝零食，回房整理行李。',
        tips: '睡前先把伴手禮裝箱，明天最後一天就能輕鬆出門。'
      }
    ]
  },
  {
    day: 4,
    date: '2026-11-25',
    dateLabel: 'NOV 25 WED',
    chineseDate: '十一月廿五日・星期三',
    theme: '手信採買與 UO116 歸途',
    subtitle: '退房寄放行李，搜羅曲奇與最後一碗港味，赴 T2 搭機回家',
    stationTag: '機場 T2 AIRPORT',
    stationColor: '#007A78',
    items: [
      {
        id: 'd4-1',
        start: '2026-11-25T09:00:00+08:00',
        end: '2026-11-25T10:00:00+08:00',
        timeLabel: '09:00 — 10:00',
        title: '帝京酒店退房・寄放行李',
        location: '帝京酒店大廳禮賓部',
        district: '旺角東',
        districtColor: '#5B9BD5',
        coords: [22.3239, 114.1727],
        isHK: true,
        mtrId: 'mong-kok-east',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mong_Kok_P1010168.JPG?width=800',
        googleQuery: '帝京酒店 Royal Plaza Hotel Hong Kong',
        description: '辦理 Check-out 退房並將大件行李寄放櫃檯，只帶輕便隨身包享受最後半日的香港時光。',
        tips: '記得保留行李領取牌，下午回來取件。'
      },
      {
        id: 'd4-2',
        start: '2026-11-25T10:00:00+08:00',
        end: '2026-11-25T12:00:00+08:00',
        timeLabel: '10:00 — 12:00',
        title: '香港手信最終採買',
        location: '珍妮曲奇・曲奇四重奏・Hashtag B',
        district: '尖沙咀',
        districtColor: '#C83E37',
        coords: [22.2977, 114.1725],
        isHK: true,
        mtrId: 'tsim-sha-tsui',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mong_Kok_P1010168.JPG?width=800',
        googleQuery: '珍妮曲奇聰明小熊 尖沙咀',
        description: '買齊小熊曲奇、蝴蝶酥與焦糖蛋撻，將香港的奶油與茶香打包帶回台灣分享給親友。',
        tips: '珍妮曲奇部分門市僅收現金或八達通，請預留零錢。',
        alternatives: [
          {
            id: 'd4-2-alt',
            label: '免排隊質感伴手禮',
            title: '曲奇四重奏 / 皇玥餅藝（尖沙咀店）',
            location: '尖沙咀海防道 / 加拿分道',
            coords: [22.2974, 114.1712],
            googleQuery: '皇玥 尖沙咀',
            description: '珍妮曲奇若售罄或大排長龍，可改買米其林星級團隊打造的皇玥蝴蝶酥或曲奇四重奏，包裝精緻且可刷卡。'
          }
        ]
      },
      {
        id: 'd4-3',
        start: '2026-11-25T12:00:00+08:00',
        end: '2026-11-25T14:00:00+08:00',
        timeLabel: '12:00 — 14:00',
        title: '告別香港的最後一頓港味',
        location: '澳洲牛奶公司 或 旺角燒臘',
        district: '佐敦',
        districtColor: '#C83E37',
        coords: [22.3046, 114.1704],
        isHK: true,
        mtrId: 'jordan',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dim-sum-HK.JPG?width=800',
        googleQuery: '澳洲牛奶公司 佐敦',
        description: '再吃一次滑嫩炒蛋多士與蛋白燉奶，或點一盤油亮燒鵝叉燒雙拼飯，為旅程畫下滿足味覺句點。',
        tips: '吃完可順道去惠康超市買大排檔三合一奶茶包。',
        alternatives: [
          {
            id: 'd4-3-alt',
            label: '舒適不併桌備案',
            title: '義順牛奶公司 / 華星冰室',
            location: '佐敦庇利金街 / 旺角西洋菜南街',
            coords: [22.3042, 114.1701],
            googleQuery: '義順牛奶公司 佐敦',
            description: '若澳洲牛奶公司排隊太長或不想趕時間併桌，可改至附近的義順牛奶公司吃雙皮燉奶與豬扒包。'
          }
        ]
      },
      {
        id: 'd4-4',
        start: '2026-11-25T14:00:00+08:00',
        end: '2026-11-25T15:40:00+08:00',
        timeLabel: '14:00 — 15:40',
        title: '回酒店取件・前往香港機場 T2',
        location: '帝京酒店 → HKG T2',
        district: '九龍站',
        districtColor: '#007A78',
        coords: [22.3048, 114.1615],
        isHK: true,
        mtrId: 'kowloon',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_International_Airport.jpg?width=800',
        googleQuery: '機場快線九龍站',
        description: '回帝京酒店領取行李，搭乘城巴 A21 或前往九龍站搭機場快線直奔赤鱲角機場二號客運大樓。',
        tips: '建議起飛前 2.5～3 小時抵達機場最從容。'
      },
      {
        id: 'd4-5',
        start: '2026-11-25T15:40:00+08:00',
        end: '2026-11-25T18:40:00+08:00',
        timeLabel: '15:40 — 18:40',
        title: 'UO116 報到託運・免稅巡禮',
        location: '香港國際機場 T2 登機區',
        district: '機場',
        districtColor: '#007A78',
        coords: [22.3152, 113.9369],
        isHK: true,
        mtrId: 'airport',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_International_Airport.jpg?width=800',
        googleQuery: '香港國際機場二號客運大樓',
        description: '辦理香港快運 UO116 報到與行李秤重，出境後把八達通餘額花在機場伴手禮或茶餐廳。',
        tips: '香港快運手提行李件數與重量檢查較嚴，先整理成一件最安心。'
      },
      {
        id: 'd4-6',
        start: '2026-11-25T18:40:00+08:00',
        end: '2026-11-25T20:25:00+08:00',
        timeLabel: '18:40 — 20:25',
        title: 'UO116 返抵桃園・旅程圓滿',
        location: 'HKG T2 → TPE',
        district: '桃園',
        districtColor: '#1B4332',
        coords: [25.0802, 121.2392],
        isHK: false,
        mtrId: null,
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_International_Airport.jpg?width=800',
        googleQuery: '桃園國際機場',
        description: '搭乘香港快運 UO116 返台，預計 20:25 降落桃園國際機場，結束四天三夜的香江漫遊。',
        tips: '帶著滿載底片與回憶的行李箱回家囉！'
      }
    ]
  }
];

export const PACKING_CHECKLIST: ChecklistItem[] = [
  { id: 'doc-passport', label: '有效期限 6 個月以上護照', group: '01 / 證件票券' },
  { id: 'doc-visa', label: '香港電子港簽（預辦入境登記列印）或有效台胞證', group: '01 / 證件票券' },
  { id: 'doc-flight', label: 'HB703 / UO116 電子機票與帝京酒店訂房憑證', group: '01 / 證件票券' },
  { id: 'pay-octopus', label: '八達通（Apple Wallet 加卡或實體卡）＆ 港幣現金', group: '02 / 金流通訊' },
  { id: 'net-esim', label: '香港 eSIM / 漫遊方案開通確認', group: '02 / 金流通訊' },
  { id: 'gear-plug', label: '英規三腳轉接頭（HK 220V）與行動電源（務必隨身）', group: '03 / 電子日常' },
  { id: 'gear-shoes', label: '好走的步行鞋與薄外套（室內冷氣＆山頂夜風）', group: '03 / 電子日常' }
];

// 香港核心港鐵路線圖資料（SVG 座標系 0..920 x 0..480）
export const MTR_LINES: MtrLine[] = [
  {
    id: 'ael',
    name: '機場快線 Airport Express',
    color: '#007A78',
    points: [[70, 110], [210, 150], [420, 260], [420, 365]]
  },
  {
    id: 'tcl',
    name: '東涌線 Tung Chung Line',
    color: '#D97706',
    points: [[70, 220], [160, 220], [270, 130], [360, 180], [420, 260], [420, 365]]
  },
  {
    id: 'drl',
    name: '迪士尼線 Disneyland Resort Line',
    color: '#D85A9C',
    points: [[160, 220], [160, 295]]
  },
  {
    id: 'twl',
    name: '荃灣線 Tsuen Wan Line',
    color: '#C83E37',
    points: [[270, 130], [500, 115], [500, 155], [500, 195], [500, 235], [500, 275], [520, 365], [445, 365]]
  },
  {
    id: 'eal',
    name: '東鐵線 East Rail Line',
    color: '#5B9BD5',
    points: [[610, 80], [610, 155], [610, 265], [575, 330], [520, 365]]
  },
  {
    id: 'isl',
    name: '港島線 Island Line',
    color: '#004E98',
    points: [[345, 365], [445, 365], [520, 365], [620, 365], [730, 365]]
  }
];

export const MTR_STATIONS: MtrStation[] = [
  {
    id: 'airport',
    name: '機場 Airport',
    x: 70,
    y: 110,
    coords: [22.3161, 113.9367],
    lines: ['機場快線'],
    color: '#007A78',
    fromHotel: '旺角東搭東鐵線至紅磡轉屯馬線到柯士甸（步行至九龍站），或直接搭城巴 A21 直達（約 55 分鐘）。',
    nearby: 'HB703 抵達 / UO116 回程 T2'
  },
  {
    id: 'tung-chung',
    name: '東涌 Tung Chung',
    x: 70,
    y: 220,
    coords: [22.2892, 113.9410],
    lines: ['東涌線'],
    color: '#D97706',
    fromHotel: '步行至旺角站搭荃灣線 → 荔景站轉東涌線 → 終點站東涌（約 38 分鐘）。',
    nearby: '昂坪 360 纜車站、東薈城、大澳巴士總站'
  },
  {
    id: 'sunny-bay',
    name: '欣澳 Sunny Bay',
    x: 160,
    y: 220,
    coords: [22.3316, 114.0289],
    lines: ['東涌線', '迪士尼線'],
    color: '#D97706',
    fromHotel: '旺角站荃灣線 → 荔景轉東涌線至欣澳（約 28 分鐘）。',
    nearby: '轉乘迪士尼線往香港迪士尼樂園'
  },
  {
    id: 'disneyland',
    name: '迪士尼 Disneyland',
    x: 160,
    y: 295,
    coords: [22.3156, 114.0451],
    lines: ['迪士尼線'],
    color: '#D85A9C',
    fromHotel: '欣澳站換乘可愛米奇車窗的迪士尼線（約 35 分鐘）。',
    nearby: '香港迪士尼樂園（Day 3 彈性替換選項）'
  },
  {
    id: 'tsing-yi',
    name: '青衣 Tsing Yi',
    x: 210,
    y: 150,
    coords: [22.3585, 114.1072],
    lines: ['機場快線', '東涌線'],
    color: '#007A78',
    fromHotel: '東涌線轉乘樞紐，也是機場快線首站。',
    nearby: '青馬大橋海景區域'
  },
  {
    id: 'lai-king',
    name: '荔景 Lai King',
    x: 270,
    y: 130,
    coords: [22.3484, 114.1261],
    lines: ['荃灣線', '東涌線'],
    color: '#C83E37',
    fromHotel: '旺角站搭荃灣線 4 站即達，對面月台無縫轉乘東涌線！',
    nearby: '前往東涌 / 迪士尼重要轉車站'
  },
  {
    id: 'kowloon',
    name: '九龍 Kowloon',
    x: 420,
    y: 260,
    coords: [22.3048, 114.1615],
    lines: ['機場快線', '東涌線'],
    color: '#007A78',
    fromHotel: '旺角站 → 荔景轉東涌線至九龍，或搭的士約 10 分鐘直達。',
    nearby: '西九文化區 M+ 博物館、圓方商場、機場快線市區預辦登機'
  },
  {
    id: 'prince-edward',
    name: '太子 Prince Edward',
    x: 500,
    y: 115,
    coords: [22.3245, 114.1683],
    lines: ['荃灣線', '觀塘線'],
    color: '#C83E37',
    fromHotel: '從帝京酒店步行約 7 分鐘即達。',
    nearby: '一點心米其林港點、金魚街北段'
  },
  {
    id: 'mong-kok',
    name: '旺角 Mong Kok',
    x: 500,
    y: 155,
    coords: [22.3193, 114.1694],
    lines: ['荃灣線', '觀塘線'],
    color: '#C83E37',
    fromHotel: '從帝京酒店穿過新世紀廣場天橋步行約 8 分鐘即達。',
    nearby: '金華冰廳、女人街、朗豪坊'
  },
  {
    id: 'mong-kok-east',
    name: '旺角東 Mong Kok East',
    x: 610,
    y: 155,
    coords: [22.3222, 114.1727],
    lines: ['東鐵線'],
    color: '#5B9BD5',
    isBase: true,
    fromHotel: '【住宿基地】帝京酒店直通 D 出口！搭東鐵線 2 站直達會展、3 站直達金鐘（過海超快）。',
    nearby: '帝京酒店 Royal Plaza Hotel、MOKO 新世紀廣場'
  },
  {
    id: 'yau-ma-tei',
    name: '油麻地 Yau Ma Tei',
    x: 500,
    y: 195,
    coords: [22.3130, 114.1707],
    lines: ['荃灣線', '觀塘線'],
    color: '#C83E37',
    fromHotel: '旺角站搭荃灣線 1 站即達。',
    nearby: '廟街夜市北段、果欄'
  },
  {
    id: 'jordan',
    name: '佐敦 Jordan',
    x: 500,
    y: 235,
    coords: [22.3049, 114.1717],
    lines: ['荃灣線'],
    color: '#C83E37',
    fromHotel: '旺角站搭荃灣線 2 站即達（約 5 分鐘）。',
    nearby: '廟街興記煲仔飯、佳佳甜品、澳洲牛奶公司'
  },
  {
    id: 'tsim-sha-tsui',
    name: '尖沙咀 Tsim Sha Tsui',
    x: 500,
    y: 275,
    coords: [22.2976, 114.1722],
    lines: ['荃灣線'],
    color: '#C83E37',
    fromHotel: '旺角站搭荃灣線 3 站即達（約 7 分鐘）。',
    nearby: '星光大道、天星小輪碼頭、K11 MUSEA、珍妮曲奇'
  },
  {
    id: 'hung-hom',
    name: '紅磡 Hung Hom',
    x: 610,
    y: 265,
    coords: [22.3033, 114.1816],
    lines: ['東鐵線', '屯馬線'],
    color: '#5B9BD5',
    fromHotel: '旺角東站搭東鐵線 1 站即達（約 4 分鐘）。',
    nearby: '過海往港島前最後一站'
  },
  {
    id: 'sheung-wan',
    name: '上環 Sheung Wan',
    x: 345,
    y: 365,
    coords: [22.2866, 114.1514],
    lines: ['港島線'],
    color: '#004E98',
    fromHotel: '旺角東搭東鐵線至金鐘 → 轉港島線 2 站即達。',
    nearby: '九記牛腩、文武廟、西港城'
  },
  {
    id: 'hong-kong',
    name: '香港 Hong Kong',
    x: 420,
    y: 365,
    coords: [22.2848, 114.1581],
    lines: ['機場快線', '東涌線'],
    color: '#007A78',
    fromHotel: '與中環站地下通道相連。',
    nearby: 'IFC 國際金融中心、中環碼頭（天星小輪）'
  },
  {
    id: 'central',
    name: '中環 Central',
    x: 445,
    y: 365,
    coords: [22.2819, 114.1581],
    lines: ['荃灣線', '港島線'],
    color: '#004E98',
    fromHotel: '旺角站搭荃灣線直達（約 13 分鐘），或旺角東搭東鐵線至金鐘轉 1 站。',
    nearby: '大館、石板街、半山扶梯、蘭芳園、Bakehouse'
  },
  {
    id: 'admiralty',
    name: '金鐘 Admiralty',
    x: 520,
    y: 365,
    coords: [22.2790, 114.1646],
    lines: ['東鐵線', '荃灣線', '港島線'],
    color: '#004E98',
    fromHotel: '旺角東站搭東鐵線過海 3 站直達金鐘（約 11 分鐘），不用轉車超省時！',
    nearby: '步行約 10 分鐘可達山頂纜車總站、香港公園'
  },
  {
    id: 'exhibition',
    name: '會展 Exhibition Centre',
    x: 575,
    y: 330,
    coords: [22.2817, 114.1753],
    lines: ['東鐵線'],
    color: '#5B9BD5',
    fromHotel: '旺角東搭東鐵線 2 站直達（約 9 分鐘）。',
    nearby: '灣仔北、香港會議展覽中心'
  },
  {
    id: 'wan-chai',
    name: '灣仔 Wan Chai',
    x: 620,
    y: 365,
    coords: [22.2775, 114.1731],
    lines: ['港島線'],
    color: '#004E98',
    fromHotel: '旺角東至金鐘轉港島線 1 站即達。',
    nearby: '利東街、藍屋建築群、叮叮車沿線'
  },
  {
    id: 'causeway-bay',
    name: '銅鑼灣 Causeway Bay',
    x: 730,
    y: 365,
    coords: [22.2804, 114.1852],
    lines: ['港島線'],
    color: '#004E98',
    fromHotel: '旺角東至金鐘轉港島線 2 站即達（或從中環搭叮叮車慢遊過來）。',
    nearby: '希慎廣場、時代廣場、鵝頸橋'
  }
];
