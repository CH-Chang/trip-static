import type { ChecklistItem, Coords, ItineraryDay } from '../types/trip';

export const HOTEL_COORDS: Coords = [22.3239, 114.1727]; // 帝京酒店 (旺角東站)

export const TRIP_META = {
  title: '香江拾光四日手帖',
  subtitle: 'HB703 啟程，連住帝京酒店，再搭 UO116 歸途',
  year: 2026,
  startDate: '2026-11-22T09:00:00+08:00',
  endDate: '2026-11-25T20:25:00+08:00',
  hotel: {
    name: '帝京酒店 Royal Plaza Hotel',
    address: '香港九龍旺角太子道西 193 號',
    station: '港鐵旺角東站 D 出口，直通 MOKO 新世紀廣場',
    coords: HOTEL_COORDS,
    checkIn: '2026-11-22 15:00',
    checkOut: '2026-11-25 11:00'
  }
};

export const ITINERARY_DAYS: ItineraryDay[] = [
  // ─────────────────────────── DAY 1 ───────────────────────────
  {
    day: 1,
    date: '2026-11-22',
    dateLabel: 'NOV 22 SUN',
    chineseDate: '十一月廿二日 星期日',
    theme: '抵港與旺角街巷',
    subtitle: '專車直送帝京落腳，一顆菠蘿油開場，走過金魚街和女人街，在廟街炭火煲仔飯裡收尾',
    stationTag: '旺角東 MONG KOK EAST',
    stationColor: '#5B9BD5',
    items: [
      {
        id: 'd1-1',
        start: '2026-11-22T09:45:00+08:00',
        end: '2026-11-22T11:35:00+08:00',
        timeLabel: '09:45 — 11:35',
        title: '自駕停富士捷再赴第一航廈報到',
        location: 'TPE Terminal 1',
        district: '桃園',
        districtColor: '#6B7280',
        coords: [25.0802, 121.2392],
        isHK: false,
        mtrId: null,
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Terminal_1_and_Control_Tower%2C_Taiwan_Taoyuan_International_Airport_20230708.jpg?width=800',
        googleQuery: '桃園國際機場第一航廈',
        description: '09:00 從家裡開車出發，把車停在富士捷機場停車場，搭停車場接駁車到第一航廈，辦理大灣區航空 HB703 登機與行李託運。',
        tips: '停好車先拍下車位號碼和停車憑證；接駁車班次，以及 11/25 20:25 抵達時的回程接送方式，出發前都先向富士捷確認。建議 09:35 前抵達 T1 櫃檯。',
        transit: [
          { mode: 'car', label: '從家自駕 → 富士捷機場停車場', minutes: 35, note: '約 30–40 分鐘，週日上午記得預留塞車時間' },
          { mode: 'shuttle', label: '富士捷接駁車 → 桃園機場第一航廈', minutes: 10, note: '接駁方式與費用依業者規定' }
        ]
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
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Greater_Bay_Airlines_B-KJC_run_HB704%28Hong_Kong_International_Airport_to_Taiwan_Taipei_Taoyuan_International_Airport%29_31-05-2025.jpg?width=800',
        googleQuery: '香港國際機場',
        description: '搭乘大灣區航空 HB703 跨越台灣海峽，約 2 小時 5 分鐘後降落赤鱲角國際機場。',
        tips: '降落前可從機窗遠眺大嶼山群峰與港珠澳大橋。',
        transit: [
          { mode: 'walk', label: '通過出境證照查驗後前往登機門', minutes: 25, note: '登機門通常起飛前 30 分鐘開始登機' }
        ]
      },
      {
        id: 'd1-3',
        start: '2026-11-22T13:40:00+08:00',
        end: '2026-11-22T14:40:00+08:00',
        timeLabel: '13:40 — 14:40',
        title: '入境香港與接送司機會合',
        location: '香港國際機場一號客運大樓 入境大堂',
        district: '機場',
        districtColor: '#007A78',
        coords: [22.3135, 113.9367],
        isHK: true,
        mtrId: 'airport',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_International_Airport_Terminal_1_Arrival_Hall_03-06-2024%283%29.jpg?width=800',
        googleQuery: '香港國際機場 入境大堂',
        description: '從滑行下機到入境查驗，再提領行李，約需 45–60 分鐘；在入境大堂與預約好的機場接送司機會合，順手確認手機八達通餘額與網路。',
        tips: '下機後先傳訊息給接送司機告知航班已落地；入境大堂的 A 出口和 B 出口都有便利店，可先買瓶水，順便領些港幣零錢。',
        transit: [
          { mode: 'flight', code: 'HB703', label: 'HB703 桃園 T1 → 香港', minutes: 125, fare: '已購機票' }
        ]
      },
      {
        id: 'd1-4',
        start: '2026-11-22T15:25:00+08:00',
        end: '2026-11-22T16:05:00+08:00',
        timeLabel: '15:25 — 16:05',
        title: '帝京酒店 Check-in',
        location: '旺角東太子道西 193 號帝京酒店',
        district: '旺角東',
        districtColor: '#5B9BD5',
        coords: [22.3239, 114.1727],
        isHK: true,
        mtrId: 'mong-kok-east',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Royal_Plaza_Hotel%2C_Hong_Kong.JPG?width=800',
        googleQuery: '帝京酒店 Royal Plaza Hotel Hong Kong',
        description: '專車一路沿北大嶼山公路駛上青馬大橋，再經西九龍走廊進入九龍，直抵帝京酒店門口。辦好三晚連住的入住手續，放下行李，換雙好走的鞋。',
        tips: '酒店直通港鐵旺角東站 D 出口與 MOKO 新世紀廣場，下樓即是生活圈；房卡記得收好，三天進出都靠它。',
        payment: { methods: ['credit', 'cash'], note: '入住時通常需以信用卡預授權押金' },
        transit: [
          { mode: 'taxi', label: '機場接送專車 機場 → 青馬大橋 → 帝京酒店', minutes: 45, fare: '機場接送已預付', note: '週日午後車流一般順暢；坐右側可看青馬大橋與葵涌貨櫃碼頭' }
        ]
      },
      {
        id: 'd1-5',
        photoSpot: {
          hashtags: ['金華冰廳', '菠蘿油'],
          keyword: '金華冰廳 菠蘿油',
          tip: '菠蘿油切開的那一刻拍側面，冰涼的厚牛油夾在熱麵包裡最誘人；坐卡座靠窗用自然光拍最好看。'
        },
        start: '2026-11-22T16:20:00+08:00',
        end: '2026-11-22T17:10:00+08:00',
        timeLabel: '16:20 — 17:10',
        title: '在金華冰廳咬下第一口菠蘿油',
        location: '太子弼街 45–47 號 金華冰廳',
        district: '太子',
        districtColor: '#C83E37',
        coords: [22.3226, 114.1706],
        isHK: true,
        mtrId: 'prince-edward',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pineapple_bun_and_milk_tea.jpg?width=800',
        googleQuery: '金華冰廳 太子 弼街',
        description: '在老冰室的卡座坐下，點一顆外皮酥脆又夾著厚切冰涼牛油的菠蘿油，配一杯港式凍奶茶——這是抵港後最對味的第一餐下午茶。',
        tips: '下午三四點後人潮較緩，等位約 10–15 分鐘；內用每人需點一杯飲品，不想等也可外帶邊走邊吃。',
        payment: { methods: ['cash', 'octopus', 'alipay', 'wechat'], note: '網誌資料指出不收信用卡，但未能經店方確認，建議備現金；營業時間約 06:30–21:00' },
        transit: [
          { mode: 'walk', label: '帝京酒店 → 太子道西 → 花園街 → 弼街', minutes: 12, note: '經 MOKO 出口往西走，過花園街即到' }
        ],
        alternatives: [
          {
            id: 'd1-5-alt',
            label: '排隊太長備案',
            title: '旺角西洋菜南街華星冰室',
            location: '旺角西洋菜南街 107 號',
            coords: [22.3187, 114.1702],
            googleQuery: '華星冰室 旺角',
            description: '金華冰廳客滿時，往南走 8 分鐘到華星冰室，同樣有菠蘿油和炒蛋多士，還有奶茶。付款方式未能確認，建議備現金。',
            payment: { methods: ['cash'], note: '付款方式未能確認，建議備現金' },
            transit: [{ mode: 'walk', label: '帝京酒店 → 西洋菜南街 107 號', minutes: 12 }],
            nextTransit: [{ mode: 'walk', label: '西洋菜南街 → 通菜街北段金魚街', minutes: 10 }]
          }
        ]
      },
      {
        id: 'd1-6',
        photoSpot: {
          hashtags: ['金魚街', '花墟', '雀鳥花園'],
          keyword: '旺角金魚街 拍照',
          tip: '金魚街整排掛著的金魚袋最上鏡，傍晚店家開燈後的透光感最好；拍店內之前記得先問老闆。'
        },
        start: '2026-11-22T17:15:00+08:00',
        end: '2026-11-22T18:30:00+08:00',
        timeLabel: '17:15 — 18:30',
        title: '從金魚街走到花墟與雀鳥花園的暮色散步',
        location: '通菜街北段 → 花墟道 → 園圃街雀鳥花園',
        district: '太子',
        districtColor: '#C83E37',
        coords: [22.3249, 114.1718],
        isHK: true,
        mtrId: 'prince-edward',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/HK_MK_%E6%97%BA%E8%A7%92_Mongkok_%E5%BC%BC%E8%A1%97_Bute_Street_aquarium_shop_%E9%80%9A%E8%8F%9C%E8%A1%97_Tung_Choi_Street_plastic_bags_goldenfish_market_September_2021_SS2_05.jpg?width=800',
        googleQuery: '旺角金魚街 通菜街',
        description: '一出冰室就是金魚街，成排透明水袋在燈下閃著光；往北走進花墟道，花香混著傍晚的涼風，再拐進雀鳥花園聽鳥籠裡此起彼落的啼聲。天色漸暗時，街燈一盞盞亮起。',
        tips: '雀鳥花園約 07:00–20:00 開放，免費入場；拍水族店請先詢問店家。走完雀鳥花園其實就在帝京酒店旁，累了可先回房小歇。',
        payment: { methods: ['cash', 'octopus', 'alipay'], note: '街區免費散步；花店和水族店的小額消費以現金為主' },
        transit: [
          { mode: 'walk', label: '金華冰廳出門即是通菜街金魚街', minutes: 2 }
        ]
      },
      {
        id: 'd1-7',
        photoSpot: {
          hashtags: ['女人街', '旺角'],
          keyword: '旺角女人街 夜景',
          tip: '站在通菜街中段往前拍，帆布攤位一路延伸到盡頭，頭頂還有交錯的霓虹招牌。'
        },
        start: '2026-11-22T18:45:00+08:00',
        end: '2026-11-22T19:20:00+08:00',
        timeLabel: '18:45 — 19:20',
        title: '女人街與旺角霓虹',
        location: '亞皆老街至登打士街之間的通菜街，再轉進西洋菜南街',
        district: '旺角',
        districtColor: '#C83E37',
        coords: [22.3187, 114.1712],
        isHK: true,
        mtrId: 'mong-kok',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mong_Kok_Road_and_Tung_Choi_Street_%28Hong_Kong%29.jpg?width=800',
        googleQuery: '女人街 通菜街 旺角',
        description: '沿通菜街南行，一攤接一攤的帆布棚下擺滿手機殼和 T 恤，還有各式紀念品；轉到西洋菜南街，週日晚的人潮與頭頂交錯的招牌，是電影裡那個不夜的旺角。',
        tips: '攤販價格可小議價；人潮擁擠，包包請背在身前。',
        payment: { methods: ['cash', 'alipay', 'payme'], note: '攤販以現金為主，少數接受支付寶或 PayMe' },
        transit: [
          { mode: 'walk', label: '雀鳥花園 → 花園街 → 通菜街南段', minutes: 15 }
        ]
      },
      {
        id: 'd1-7b',
        start: '2026-11-22T19:20:00+08:00',
        end: '2026-11-22T19:50:00+08:00',
        timeLabel: '19:20 — 19:50',
        title: '上旺角行人天橋拍霓虹車流',
        location: '亞皆老街行人天橋，連接旺角東站與朗豪坊一帶',
        district: '旺角',
        districtColor: '#C83E37',
        coords: [22.3196, 114.1707],
        isHK: true,
        mtrId: 'mong-kok',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mong_Kok_Road_and_Tung_Choi_Street_%28Hong_Kong%29.jpg?width=800',
        googleQuery: '旺角行人天橋 亞皆老街',
        description: '從女人街走上亞皆老街的行人天橋，腳下是川流不息的雙層巴士和紅色的士，四周是層層疊疊的霓虹招牌與朗豪坊的玻璃外牆，這是許多人鏡頭裡最有香港味道的一個畫面。',
        tips: '天剛黑的 19:00 過後燈光最漂亮；天橋是行人通道，拍照時記得靠邊站，不要擋到人潮。',
        payment: { methods: [], note: '天橋免費，不需要付款' },
        photoSpot: {
          hashtags: ['旺角天橋', 'mongkok'],
          keyword: '旺角天橋 拍照',
          hot: true,
          tip: '經典構圖是站在天橋中段，用長曝光或連拍把底下的巴士車流拍成光軌；人像可以背對車流，讓霓虹招牌當背景。手機開夜景模式，手肘靠在欄杆上就能穩住。'
        },
        transit: [{ mode: 'walk', label: '通菜街 → 亞皆老街 → 走上行人天橋', minutes: 5 }]
      },
      {
        id: 'd1-8',
        photoSpot: {
          hashtags: ['廟街', 'templestreet', '興記煲仔飯'],
          keyword: '廟街夜市 拍照',
          tip: '廟街牌樓是經典的入口照；煲仔飯上桌掀蓋冒煙的瞬間最有氣氛。'
        },
        start: '2026-11-22T20:00:00+08:00',
        end: '2026-11-22T21:45:00+08:00',
        timeLabel: '20:00 — 21:45',
        title: '逛廟街夜市吃興記炭火煲仔飯',
        location: '油麻地廟街 興記菜館',
        district: '油麻地',
        districtColor: '#C83E37',
        coords: [22.3110, 114.1706],
        isHK: true,
        mtrId: 'yau-ma-tei',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mercado_en_Temple_St.%2C_Hong_Kong%2C_2013-08-11%2C_DD_01.JPG?width=800',
        googleQuery: '興記菜館 廟街 煲仔飯',
        description: '在廟街口的興記坐上路邊小凳，等一鍋炭火慢煲的臘味滑雞煲仔飯，鍋底焦香的飯焦是重頭戲；飯後沿著廟街夜市燈籠一路逛到天后廟前。',
        tips: '煲仔飯約需 20–25 分鐘現煲，入座先點；淋上甜豉油後蓋鍋悶一分鐘，鍋巴最脆。週日晚等位約 20–30 分鐘。',
        payment: { methods: ['cash'], note: '多方遊記資料都指出只收現金，請備港幣；晚市約 17:30 起營業' },
        transit: [
          { mode: 'walk', label: '走下天橋到港鐵旺角站 E2 出口', minutes: 5 },
          { mode: 'mtr', mtr: ['mong-kok', 'yau-ma-tei'], label: '旺角 → 油麻地', fare: '八達通 HK$4.9' },
          { mode: 'walk', label: 'C 出口沿文明里走到廟街', minutes: 5 }
        ],
        transitBack: [
          { mode: 'walk', label: '廟街 → 港鐵油麻地站', minutes: 6 },
          { mode: 'mtr', mtr: ['yau-ma-tei', 'mong-kok'], label: '油麻地 → 旺角', fare: '八達通 HK$4.9' },
          { mode: 'walk', label: '旺角站 → 旺角道行人天橋 → 帝京酒店', minutes: 12, note: '太累可在廟街口直接搭的士回酒店，約 10 分鐘，車資 HK$40 上下' }
        ],
        alternatives: [
          {
            id: 'd1-8-alt',
            label: '不想等位備案',
            title: '廟街大排檔配佳佳甜品',
            location: '佐敦白加士街 113 至 115 號地舖',
            coords: [22.3058, 114.1705],
            googleQuery: '佳佳甜品 佐敦',
            description: '興記排太久時，改在廟街其他大排檔吃小炒，再步行到佳佳甜品喝一碗生磨芝麻糊收尾。佳佳在 2025 年 9 月從寧波街搬到白加士街，中午 12 點開到凌晨 1 點，每人至少點一碗；兩處都建議備現金。',
            mtrId: 'jordan',
            transit: [
              { mode: 'walk', label: '走下天橋到港鐵旺角站', minutes: 5 },
              { mode: 'mtr', mtr: ['mong-kok', 'jordan'], label: '旺角 → 佐敦', fare: '八達通 HK$4.9' },
              { mode: 'walk', label: '佐敦站 → 白加士街', minutes: 5 }
            ],
            transitBack: [
              { mode: 'walk', label: '白加士街 → 港鐵佐敦站', minutes: 5 },
              { mode: 'mtr', mtr: ['jordan', 'mong-kok'], label: '佐敦 → 旺角', fare: '八達通 HK$4.9' },
              { mode: 'walk', label: '旺角站 → 帝京酒店', minutes: 10 }
            ]
          }
        ]
      }
    ]
  },

  // ─────────────────────────── DAY 2 ───────────────────────────
  {
    day: 2,
    date: '2026-11-23',
    dateLabel: 'NOV 23 MON',
    chineseDate: '十一月廿三日 星期一',
    theme: '港島百年電車與山頂暮色',
    subtitle: '絲襪奶茶配蛋撻開場，叮叮車去灣仔吃燒鵝，山頂看日落，再坐上維港摩天輪看夜景',
    stationTag: '中環 CENTRAL',
    stationColor: '#004E98',
    items: [
      {
        id: 'd2-1',
        group: { id: 'central-escalator', title: '中環半山扶手電梯散步圈', subtitle: '三個點都在扶手電梯沿線，彼此走路 3 到 5 分鐘' },
        photoSpot: {
          hashtags: ['蘭芳園', '絲襪奶茶'],
          keyword: '蘭芳園 絲襪奶茶 中環',
          tip: '拿起絲襪奶茶對著鐵皮檔口和招牌拍，背景是結志街的街市攤位。'
        },
        start: '2026-11-23T10:05:00+08:00',
        end: '2026-11-23T10:15:00+08:00',
        timeLabel: '10:05 — 10:15',
        title: '在蘭芳園外帶一杯絲襪奶茶',
        location: '中環結志街 2 號',
        district: '中環',
        districtColor: '#004E98',
        coords: [22.2829, 114.1545],
        isHK: true,
        mtrId: 'central',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lan_Fong_Yuen_at_Gage_St_(20190308150832).jpg?width=800',
        googleQuery: '蘭芳園 中環 結志街',
        description: '搭扶手電梯往上，第一個下車的結志街就是蘭芳園。在鐵皮檔口外帶一杯用布袋反覆撞茶的絲襪奶茶，茶香濃、口感滑，拿著邊走邊喝，往上就是大館。',
        tips: '外帶不用等位，跟店員說要一杯熱或凍的絲襪奶茶就好；蘭芳園週日公休，週一照常營業。',
        payment: { methods: ['cash', 'octopus'], note: '未能確認是否收信用卡，建議備現金' },
        transit: [
          { mode: 'walk', label: '帝京酒店直通港鐵旺角東站', minutes: 3 },
          { mode: 'mtr', mtr: ['mong-kok-east', 'central'], label: '旺角東 → 中環，東鐵綫過海至金鐘轉車', fare: '八達通 HK$12.9', note: '東鐵綫頭等車廂另收費，請搭普通車廂' },
          { mode: 'walk', label: 'D2 出口 → 皇后大道中 → 扶手電梯起點', minutes: 6 },
          {
            mode: 'escalator',
            label: '半山扶手電梯 皇后大道中 → 結志街',
            minutes: 3,
            note: '10:00 起改為往上行，09:25 出門剛好趕上，全程不用爬樓梯',
            photoSpot: { hashtags: ['半山扶手電梯', 'midlevelsescalator', '中環'], keyword: '中環半山扶手電梯 拍照', tip: '站在扶手電梯上往下拍，一整排有頂蓋的電梯斜斜穿過老街和唐樓，很有電影感；經過擺花街和士丹頓街時往兩旁拍，招牌和小店交錯。' },
            photoImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Central-Mid-levels_escalator.jpg?width=800'
          }
        ]
      },
      {
        id: 'd2-1b',
        group: { id: 'central-escalator', title: '中環半山扶手電梯散步圈', subtitle: '三個點都在扶手電梯沿線，彼此走路 3 到 5 分鐘' },
        photoSpot: {
          hashtags: ['大館', 'taikwun'],
          keyword: '大館 拍照 打卡',
          tip: '監獄操場的紅磚牆和白色迴廊最上鏡，站在檢閱廣場中央往警察總部大樓拍，對稱構圖很好看。'
        },
        start: '2026-11-23T10:20:00+08:00',
        end: '2026-11-23T11:20:00+08:00',
        timeLabel: '10:20 — 11:20',
        title: '走進紅磚警署改建的大館',
        location: '中環荷李活道 10 號',
        district: '中環',
        districtColor: '#004E98',
        coords: [22.2816, 114.1547],
        isHK: true,
        mtrId: 'central',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tai_Kwun_Police_Headquarters_Block_201806.jpg?width=800',
        googleQuery: '大館 Tai Kwun 中環',
        description: '舊中區警署、中央裁判司署和域多利監獄改建成的古蹟藝術園區。穿過檢閱廣場的大樹，走進紅磚警察總部大樓和監獄長廊，一邊喝奶茶一邊慢慢逛。',
        tips: '園區免費入場；JC Contemporary 等展館週一可能休館，但戶外廣場和歷史建築都能逛。',
        payment: { methods: ['cash', 'octopus', 'credit'], note: '免費入場，園區咖啡店與小店多可刷卡' },
        transit: [
          {
            mode: 'escalator',
            label: '半山扶手電梯 結志街 → 荷李活道',
            minutes: 2,
            note: '在荷李活道出口下電梯，往東走 2 分鐘就是大館正門',
            photoSpot: { hashtags: ['半山扶手電梯', 'midlevelsescalator', '中環'], keyword: '中環半山扶手電梯 拍照', tip: '站在扶手電梯上往下拍，一整排有頂蓋的電梯斜斜穿過老街和唐樓，很有電影感；經過擺花街和士丹頓街時往兩旁拍，招牌和小店交錯。' },
            photoImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Central-Mid-levels_escalator.jpg?width=800'
          },
          { mode: 'walk', label: '荷李活道往東 → 大館正門', minutes: 2 }
        ]
      },
      {
        id: 'd2-1c',
        group: { id: 'central-escalator', title: '中環半山扶手電梯散步圈', subtitle: '三個點都在扶手電梯沿線，彼此走路 3 到 5 分鐘' },
        photoSpot: {
          hashtags: ['bakehouse', '香港蛋撻'],
          keyword: 'Bakehouse 蛋撻 中環',
          tip: '酸種蛋撻咬一口拍剖面，看外層酥皮的層次；拿著紙袋站在士丹頓街的斜坡上拍也很有 SoHo 的味道。'
        },
        start: '2026-11-23T11:25:00+08:00',
        end: '2026-11-23T11:40:00+08:00',
        timeLabel: '11:25 — 11:40',
        title: '在 Bakehouse 中環店帶走酸種蛋撻',
        location: '中環士丹頓街 5 號嘉彩閣地舖',
        district: '中環',
        districtColor: '#004E98',
        coords: [22.2819, 114.1533],
        isHK: true,
        mtrId: 'central',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/HK_Central_%E4%B8%AD%E7%92%B0_SoHo_%E8%98%87%E8%B1%AA_Staunton_Street_%E5%A3%AB%E4%B8%B9%E9%A0%93%E8%A1%97_Bakehouse_Bakery_food_display_March_2021_SS2_03.jpg?width=800',
        googleQuery: 'Bakehouse 中環 士丹頓街',
        description: '逛完大館回到扶手電梯，再往上一段到 SoHo 的士丹頓街。Bakehouse 的招牌酸種蛋撻外層酥脆帶一點微酸，蛋漿滑嫩不膩，趁熱吃最好。',
        tips: '中環店只做外帶，每天 08:00 到 21:00，酸種蛋撻一個約 HK$12.5，邊烤邊賣、賣完為止，人多時要先拿號碼牌，也可以先預約再取貨。',
        payment: { methods: ['credit', 'octopus', 'cash'], note: '一般可刷卡或用八達通，出發前再確認' },
        transit: [
          { mode: 'walk', label: '大館 → 荷李活道 → 回到扶手電梯', minutes: 3 },
          {
            mode: 'escalator',
            label: '半山扶手電梯 荷李活道 → 士丹頓街',
            minutes: 2,
            note: '士丹頓街在荷李活道的上一層，下電梯往西走 1 分鐘',
            photoSpot: { hashtags: ['半山扶手電梯', 'midlevelsescalator', '中環'], keyword: '中環半山扶手電梯 拍照', tip: '站在扶手電梯上往下拍，一整排有頂蓋的電梯斜斜穿過老街和唐樓，很有電影感；經過擺花街和士丹頓街時往兩旁拍，招牌和小店交錯。' },
            photoImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Central-Mid-levels_escalator.jpg?width=800'
          }
        ]
      },
      {
        id: 'd2-2',
        photoSpot: {
          hashtags: ['PMQ', '元創方', '文武廟'],
          keyword: 'PMQ 元創方 文武廟 拍照',
          tip: '在 PMQ 中庭往上拍，可以拍到一層層的走廊；文武廟裡懸掛的塔香在光線下很有氣氛，拍照請保持安靜。'
        },
        start: '2026-11-23T11:45:00+08:00',
        end: '2026-11-23T12:45:00+08:00',
        timeLabel: '11:45 — 12:45',
        title: '從 PMQ 沿荷李活道走到文武廟',
        location: '元創方 PMQ → 荷李活道古董街 → 文武廟',
        district: '中環',
        districtColor: '#004E98',
        coords: [22.2836, 114.1517],
        isHK: true,
        mtrId: 'sheung-wan',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tai_Kwun_Police_Headquarters_Block_201806.jpg?width=800',
        googleQuery: '元創方 PMQ 中環',
        description: '從士丹頓街走進已婚警察宿舍改建的 PMQ，逛一層層的本地設計小店；搭園區的升降機下到荷李活道那層，再沿著古董街往西，走到香火繚繞的文武廟。',
        tips: 'PMQ 有升降機連接士丹頓街和荷李活道兩層，不用走樓梯；文武廟免費入場，廟內請保持安靜。',
        payment: { methods: ['cash', 'octopus', 'credit'], note: 'PMQ 和文武廟都免費入場；設計小店多可刷卡' },
        transit: [{ mode: 'walk', label: 'Bakehouse → 士丹頓街往西 → PMQ 士丹頓街入口', minutes: 4, note: '一路是平路' }]
      },
      {
        id: 'd2-3',
        photoSpot: {
          hashtags: ['甘牌燒鵝', '香港燒鵝'],
          keyword: '甘牌燒鵝',
          tip: '燒鵝髀飯上桌先拍俯視全景，再拍燒鵝皮油亮的特寫。'
        },
        start: '2026-11-23T13:30:00+08:00',
        end: '2026-11-23T14:30:00+08:00',
        timeLabel: '13:30 — 14:30',
        title: '搭叮叮車到灣仔吃甘牌燒鵝',
        location: '灣仔軒尼詩道 226 號 甘牌燒鵝',
        district: '灣仔',
        districtColor: '#004E98',
        coords: [22.2774, 114.1747],
        isHK: true,
        mtrId: 'wan-chai',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Wan_Chai_Kam%27s_Roast_Goose_24-08-2023.jpg?width=800',
        googleQuery: "甘牌燒鵝 Kam's Roast Goose 灣仔",
        description: '跳上雙層叮叮車上層前排，聽著噹噹聲穿過德輔道中與金鐘的高樓峽谷到灣仔。午餐是米芝蓮星級的甘牌燒鵝：皮脆油香的燒鵝髀飯，配上叉燒和瀨粉，再蘸一點酸梅醬。',
        tips: '先到櫃台登記取號，13:30 過後午市人潮漸退，通常比中午好排；燒鵝髀限量，賣完就改點燒鵝飯。如果人龍太長或燒鵝賣完，走 3 分鐘到三角街的竺扶大班燒味，就是很好的備案。',
        payment: { methods: ['cash', 'octopus'], note: '未能確認是否收信用卡或電子支付，建議備現金，兩人約 HK$250–350；每日 11:30–21:30 營業' },
        transit: [
          { mode: 'walk', label: '文武廟 → 沿荷李活道往西 → 走水坑口街斜坡下到上環德輔道中電車站', minutes: 12, note: '走斜坡路，不用爬樓梯街的階梯' },
          { mode: 'tram', label: '叮叮車東行 上環 → 灣仔，往東開的車幾乎都會經過灣仔', minutes: 30, fare: 'HK$3.3，可用八達通或現金但不設找贖', note: '後門上車，前門下車時拍八達通；上層前排視野最好' },
          { mode: 'walk', label: '在軒尼詩道盧押道站下車 → 甘牌燒鵝', minutes: 3 }
        ],
        alternatives: [
          {
            id: 'd2-3-alt2',
            label: '竺扶大班燒味',
            title: '在竺扶大班燒味吃黯然銷魂飯',
            location: '灣仔三角街 2 至 3 號華仁閣地下 3 號舖',
            coords: [22.2765, 114.1738],
            googleQuery: '竺扶大班燒味 灣仔 三角街',
            description: '藏在灣仔街市旁的燒味店，從甘牌燒鵝走過去大約 3 分鐘。招牌是叉燒配煎蛋的黯然銷魂飯，一份約 HK$60，燒鵝和燒肉也很受歡迎。午市常要排隊併桌，但翻桌很快，取號後耐心等叫號就好。網路資料寫每天 9:30 到 20:30 營業，付款方式查不到，建議備現金，出發前再確認一次。'
          },
          {
            id: 'd2-3-alt',
            label: '再興燒臘',
            title: '再興燒臘飯店',
            location: '灣仔軒尼詩道 265–267 號',
            coords: [22.2780, 114.1755],
            googleQuery: '再興燒臘 灣仔',
            description: '同一條街上的老字號再興燒臘，以蜜汁叉燒聞名，翻桌較快；付款方式未能確認，建議備現金。'
          }
        ]
      },
      {
        id: 'd2-4',
        photoSpot: {
          hashtags: ['藍屋', '利東街', '灣仔'],
          keyword: '灣仔藍屋 拍照',
          tip: '藍屋正面用直幅拍，把整棟天藍色唐樓和木窗拍滿；利東街適合拍騎樓長廊的透視感。'
        },
        start: '2026-11-23T14:40:00+08:00',
        end: '2026-11-23T15:30:00+08:00',
        timeLabel: '14:40 — 15:30',
        title: '漫步灣仔老街的藍屋與利東街',
        flexible: '午餐延誤或排隊太久就直接跳過，吃完燒鵝搭港鐵到金鐘去排山頂纜車，不會影響看日落',
        location: '太原街玩具街 → 利東街 → 石水渠街藍屋',
        district: '灣仔',
        districtColor: '#004E98',
        coords: [22.2734, 114.1730],
        isHK: true,
        mtrId: 'wan-chai',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Wan_Chai_Blue_House.JPG?width=800',
        googleQuery: '藍屋 灣仔 石水渠街',
        description: '飯後散步消化，先看太原街的懷舊玩具攤，再走過歐風騎樓的利東街，最後停在一抹天藍的唐樓「藍屋」前——那是灣仔留下最溫柔的舊時光。',
        tips: '藍屋仍有居民居住，拍照請保持安靜；石水渠街是緩坡路，沒有階梯，慢慢走就好。早上中環的 Bakehouse 如果賣完，大王東街 14 號的 Bakehouse 灣仔店就在利東街旁邊，可以順路補買，營業時間出發前再確認。',
        payment: { methods: ['cash', 'octopus', 'credit'], note: '散步免費；利東街商店多可刷卡，太原街小攤以現金為主' },
        transit: [
          { mode: 'walk', label: '甘牌燒鵝 → 太原街 → 利東街 → 皇后大道東 → 藍屋', minutes: 10 }
        ]
      },
      {
        id: 'd2-5',
        photoSpot: {
          hashtags: ['盧吉道', '太平山頂', 'victoriapeak'],
          keyword: '盧吉道 夜景 拍照',
          tip: '日落前後半小時最美，用夜景模式拍維港天際線；手機靠在欄杆上就能穩住。',
          hot: true
        },
        start: '2026-11-23T16:30:00+08:00',
        end: '2026-11-23T18:30:00+08:00',
        timeLabel: '16:30 — 18:30',
        title: '搭山頂纜車看盧吉道日落夜景',
        ticketHint: '山頂纜車票',
        location: '花園道纜車總站 → 山頂廣場 → 盧吉道觀景台',
        district: '山頂',
        districtColor: '#1B4332',
        coords: [22.2711, 114.1499],
        isHK: true,
        mtrId: 'admiralty',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Night_View_from_Lugard_Road_Victoria_Peak_Hong_Kong_-_panoramio_%285%29.jpg?width=800',
        googleQuery: '盧吉道觀景台 太平山頂',
        description: '第六代山頂纜車沿陡坡斜攀而上，城市在窗外傾斜。抵達後沿盧吉道林蔭小徑走到觀景台，從日落前的金色光線，看著太陽沉向西邊的海面，再等到維港兩岸一片燈海亮起，一次看盡日與夜。',
        tips: '車票不指定時段，到花園道總站排隊就能上車。建議 15:50 左右到總站，平日下午通常排 20 到 45 分鐘，上山後還有時間走到盧吉道看日落前的金色光線，當天的日落時間看卡片上的標記。彈性做法：看完日落，等城市燈光亮起就馬上下山，趕在大批人潮之前排纜車。上山坐右側視野最佳；山頂入夜偏涼，帶件薄外套。',
        payment: { methods: ['credit', 'octopus', 'cash'], note: '纜車票已預訂；凌霄閣摩天台 428 若未含在票券內需另外購買；山頂商場餐廳可刷卡' },
        transit: [
          { mode: 'walk', label: '藍屋 → 港鐵灣仔站', minutes: 8 },
          { mode: 'mtr', mtr: ['wan-chai', 'admiralty'], label: '灣仔 → 金鐘', fare: '八達通 HK$4.9' },
          { mode: 'walk', label: 'C1 出口 → 太古廣場 → 香港公園 → 花園道纜車總站', minutes: 15 },
          { mode: 'peak', label: '山頂纜車 花園道 → 山頂', minutes: 8, fare: '已購買不指定時段的車票，依 2026 年資料平日成人來回約 HK$88', note: '持票直接到花園道總站排隊入閘，不用預約時段' }
        ],
        alternatives: [
          {
            id: 'd2-5-alt',
            label: '纜車停駛或錯過時段備案',
            title: '城巴 15 號雙層巴士上山頂',
            location: '中環交易廣場巴士總站 → 山頂',
            coords: [22.2837, 114.1580],
            googleQuery: '中環交易廣場巴士總站 15 號',
            description: '若纜車臨時停駛或排隊過長，到中環交易廣場搭城巴 15 號上山，車程約 40 分鐘，八達通約 HK$12，坐上層左側沿途山海景極美。',
            transit: [
              { mode: 'mtr', mtr: ['wan-chai', 'central'], label: '灣仔 → 中環', fare: '八達通 HK$4.9' },
              { mode: 'walk', label: '中環站 → 交易廣場巴士總站', minutes: 6 },
              { mode: 'bus', code: '15', label: '城巴 15 號 交易廣場 → 山頂', minutes: 40, fare: '八達通約 HK$12', note: '坐上層左側，沿途山海景最好' }
            ]
          }
        ]
      },
      {
        id: 'd2-6',
        photoSpot: {
          hashtags: ['正斗', '雲吞麵'],
          keyword: '正斗 雲吞麵',
          tip: '雲吞麵先拍俯視，再夾起一顆雲吞拍半透明的麵皮。'
        },
        start: '2026-11-23T19:20:00+08:00',
        end: '2026-11-23T20:20:00+08:00',
        timeLabel: '19:20 — 20:20',
        title: '在正斗吃鮮蝦雲吞麵當晚餐',
        location: '中環國際金融中心商場 3 樓 正斗粥麵專家',
        district: '中環',
        districtColor: '#004E98',
        coords: [22.2856, 114.1587],
        isHK: true,
        mtrId: 'central',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Wonton_noodles_at_Mak_An_Kee%2C_Chung_Kee_%2820180913105025%29.jpg?width=800',
        googleQuery: '正斗粥麵專家 IFC 中環',
        description: '下山後走到 IFC，在米芝蓮推介的正斗吃一碗竹昇麵配鮮蝦雲吞，再來一份及第粥或炸兩，暖胃又不撐，剛好留肚子給摩天輪後的夜色。',
        tips: '晚市約等 10 到 20 分鐘；IFC 商場有洗手間和冷氣，適合下山後休息整理。彈性做法：如果 19:30 以後才回到中環，先去摩天輪趕最後登車，坐完再回 IFC 吃正斗。',
        payment: { methods: ['credit', 'octopus', 'cash'], note: '商場連鎖餐廳一般可刷卡，惟未能逐項確認' },
        transit: [
          { mode: 'peak', label: '山頂纜車下山 → 花園道', minutes: 8, fare: '已含於來回票', note: '日落後一起下山的人很多，排隊常要 30 到 60 分鐘。彈性做法：排隊超過 30 分鐘，就到山頂廣場巴士總站改搭城巴 15 號到中環交易廣場，約 40 分鐘，八達通約 HK$12；趕時間可以搭的士，約 15 到 20 分鐘' },
          { mode: 'walk', label: '花園道 → 遮打花園 → 交易廣場 → IFC 商場', minutes: 15 }
        ],
        alternatives: [
          {
            id: 'd2-6-alt',
            label: '想吃老店備案',
            title: '麥奀雲吞麵世家',
            location: '中環威靈頓街 77 號',
            coords: [22.2829, 114.1555],
            googleQuery: '麥奀雲吞麵世家 中環',
            description: '想吃更傳統的小碗雲吞麵，可改到威靈頓街麥奀，再步行約 15 分鐘到摩天輪；付款方式未能確認，建議備現金。',
            transit: [
              { mode: 'peak', label: '山頂纜車下山 → 花園道', minutes: 8, fare: '已含於來回票' },
              { mode: 'walk', label: '花園道 → 皇后大道中 → 威靈頓街', minutes: 12 }
            ],
            nextTransit: [{ mode: 'walk', label: '威靈頓街 → 中環站 → 中環碼頭行人天橋 → 摩天輪', minutes: 15 }]
          }
        ]
      },
      {
        id: 'd2-7',
        photoSpot: {
          hashtags: ['香港摩天輪', 'hongkongobservationwheel', '中環海濱'],
          keyword: '香港摩天輪 夜景',
          tip: '在中環海濱長廊往上拍仰角，把整個輪圈和燈光拍進去；車廂裡可以拍維港夜景的倒影。',
          hot: true
        },
        start: '2026-11-23T20:30:00+08:00',
        end: '2026-11-23T21:15:00+08:00',
        timeLabel: '20:30 — 21:15',
        title: '坐香港摩天輪看維港夜色',
        location: '中環 9 號碼頭旁的中環海濱香港摩天輪',
        district: '中環',
        districtColor: '#004E98',
        coords: [22.2855, 114.1617],
        isHK: true,
        mtrId: 'central',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_Observation_wheel_%28Ank_Kumar%29_06.jpg?width=800',
        googleQuery: '香港摩天輪 Hong Kong Observation Wheel',
        description: '坐進 60 米高的車廂緩緩升起，對岸尖沙咀與港島天際線的燈火在玻璃上流動，轉三圈約 15–20 分鐘；下來後在中環海濱長廊吹吹海風。',
        tips: '週一至週四平日營業 12:00 到 22:00，最後登車約 21:30，請勿拖太晚；成人票約 HK$20，排隊通常 10 到 20 分鐘。下山比預期晚的話，就把摩天輪移到正斗之前。',
        payment: { methods: ['octopus', 'cash', 'credit'], note: '成人約 HK$20；售票處付款方式未能確認，備八達通或現金最保險' },
        transit: [
          { mode: 'walk', label: 'IFC 商場 → 中環碼頭行人天橋 → 摩天輪', minutes: 8 }
        ],
        transitBack: [
          { mode: 'walk', label: '摩天輪 → 沿中環海濱走到中環 7 號碼頭', minutes: 5 },
          {
            mode: 'ferry',
            label: '天星小輪 中環 → 尖沙咀',
            minutes: 12,
            fare: '平日上層 HK$5，可刷八達通或感應式 Visa、Mastercard 信用卡；加價到 HK$6.5 的申請尚未確認是否通過',
            note: '約 9 分鐘一班，坐上層靠窗看維港兩岸夜景；船程約 9 分鐘，加上候船時間',
            photoSpot: {
              hashtags: ['天星小輪', 'starferry', '維港夜景'],
              keyword: '天星小輪 夜景 拍照',
              tip: '坐上層靠窗或站在船尾，回頭拍港島的天際線和剛坐完的摩天輪；靠岸前拍尖沙咀鐘樓也很好看。'
            },
            photoImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_Skyline_viewed_from_Victoria_Peak.jpg?width=800'
          },
          { mode: 'walk', label: '尖沙咀天星碼頭 → 梳士巴利道地下通道 → 港鐵尖東站', minutes: 10 },
          { mode: 'mtr', mtr: ['east-tsim-sha-tsui', 'mong-kok-east'], label: '尖東 → 旺角東，在紅磡轉東鐵綫後直通酒店', fare: '八達通約 HK$6' }
        ]
      }
    ]
  },

  // ─────────────────────────── DAY 3 ───────────────────────────
  {
    day: 3,
    date: '2026-11-24',
    dateLabel: 'NOV 24 TUE',
    chineseDate: '十一月廿四日 星期二',
    theme: '推車點心與九龍手信，再看西九落日',
    subtitle: '阿姐推車叫賣的早茶開場，到尖沙咀吃生煎包，排珍妮曲奇再啃個雞蛋仔，西九海邊看日落，最後在超市補貨收尾',
    stationTag: '尖沙咀 / 西九 WEST KOWLOON',
    stationColor: '#D97706',
    items: [
      {
        id: 'd3-1',
        photoSpot: {
          hashtags: ['倫敦大酒樓', '推車點心'],
          keyword: '倫敦大酒樓 推車點心',
          tip: '拍阿姐推著點心車經過的瞬間最有味道，也可以拍一桌滿滿的蒸籠。'
        },
        start: '2026-11-24T08:30:00+08:00',
        end: '2026-11-24T10:00:00+08:00',
        timeLabel: '08:30 — 10:00',
        title: '倫敦大酒樓的推車點心早茶',
        location: '旺角彌敦道 612–618 號 好望角大廈 倫敦大酒樓',
        district: '旺角',
        districtColor: '#C83E37',
        coords: [22.3173, 114.1701],
        isHK: true,
        mtrId: 'mong-kok',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/A_Dim_Sum_Cart_at_Crown_Chinese_Restaurant_in_Cheung_Chau.jpg?width=800',
        googleQuery: '倫敦大酒樓 旺角',
        description: '偌大的老派酒樓裡，阿姐推著冒煙的點心車在桌間穿梭叫賣，從蝦餃燒賣到叉燒包，再到鳳爪和腸粉，看到喜歡的就舉手拿一籠，蓋碗茶一沖，就是最地道的「一盅兩件」。',
        tips: '三樓取籌候位，二樓多為搭枱；像椰皇燉奶這類點心需自行到點心亭領取。點心按籃計價，填寫點心紙或請阿姐蓋印。早上 07:30 開門，08:30 到通常還有位子，越晚人越多。',
        payment: { methods: ['credit', 'cash', 'octopus'], note: '已確認可刷信用卡，兩人約 HK$200 到 280' },
        transit: [
          { mode: 'walk', label: '帝京酒店 → 旺角道行人天橋 → 彌敦道', minutes: 15, note: '亦可搭港鐵旺角東 → 旺角，但轉車反而較久' }
        ],
        alternatives: [
          {
            id: 'd3-1-alt',
            label: '蓮香樓尖沙咀店',
            title: '到蓮香樓尖沙咀分店吃推車點心',
            location: '尖沙咀金巴利道 25 號長利商業大廈 1 至 2 樓',
            coords: [22.3004, 114.1729],
            googleQuery: '蓮香樓 尖沙咀 金巴利道',
            description: '1927 年開業的百年老字號蓮香樓，在尖沙咀開的 24 小時分店，一樣有阿姐推著點心車在桌間叫賣。點心大約 HK$20 到 50，招牌是蓮蓉包、燒賣和腸粉，還有鵪鶉蛋燒賣這種少見的傳統款式。早上 11 點前是特價早茶，比較便宜；繁忙時要拼桌。從酒店搭港鐵到尖沙咀就到，吃完走到鐘樓約 10 分鐘，出門時間不用改。付款方式未能確認，建議備現金。',
            mtrId: 'tsim-sha-tsui',
            payment: { methods: ['cash'], note: '付款方式未能確認，建議備現金' },
            photoSpot: { hashtags: ['蓮香樓', '推車點心'], keyword: '蓮香樓 推車點心', tip: '拍阿姐推著點心車經過的瞬間最有味道，蓋碗茶和整桌蒸籠一起入鏡。' },
            transit: [
              { mode: 'walk', label: '帝京酒店 → 港鐵旺角站', minutes: 8 },
              { mode: 'mtr', mtr: ['mong-kok', 'tsim-sha-tsui'], label: '旺角 → 尖沙咀', fare: '八達通 HK$5.9' },
              { mode: 'walk', label: '尖沙咀站 → 金巴利道 25 號', minutes: 5 }
            ],
            nextTransit: [{ mode: 'walk', label: '金巴利道 → 彌敦道 → 梳士巴利道 → 尖沙咀鐘樓', minutes: 12 }]
          },
          {
            id: 'd3-1-alt2',
            label: '襟江酒家',
            title: '到旺角襟江酒家吃推車點心',
            location: '旺角家樂坊',
            coords: [22.3183, 114.1704],
            googleQuery: '襟江酒家 旺角 家樂坊',
            description: '蓮香樓後人開的懷舊酒樓，有推車點心，從 HK$25 起，離帝京酒店很近。詳細地址與營業時間未能確認，出發前請用 Google 地圖查一次。',
            mtrId: 'mong-kok',
            payment: { methods: ['cash'], note: '付款方式未能確認，建議備現金' },
            transit: [{ mode: 'walk', label: '帝京酒店 → 旺角家樂坊', minutes: 10 }]
          }
        ]
      },
      {
        id: 'd3-2',
        photoSpot: {
          hashtags: ['尖沙咀鐘樓', '星光大道', 'avenueofstars'],
          keyword: '尖沙咀鐘樓 星光大道 拍照',
          tip: '鐘樓配上身後的維港和港島天際線是經典構圖；星光大道上的李小龍銅像前通常要排一下隊。',
          hot: true
        },
        start: '2026-11-24T10:25:00+08:00',
        end: '2026-11-24T12:00:00+08:00',
        timeLabel: '10:25 — 12:00',
        title: '尖沙咀海濱的鐘樓與星光大道',
        location: '尖沙咀鐘樓 → 星光大道 → 1881 Heritage',
        district: '尖沙咀',
        districtColor: '#C83E37',
        coords: [22.2936, 114.1694],
        isHK: true,
        mtrId: 'tsim-sha-tsui',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Former_Kowloon-Canton_Railway_Clock_Tower%2C_Tsim_Sha_Tsui_%28Hong_Kong%29.jpg?width=800',
        googleQuery: '尖沙咀鐘樓',
        description: '從九廣鐵路舊鐘樓出發，沿海濱長廊走到星光大道，白天的維港湛藍開闊，正對昨晚去過的中環摩天輪；回程繞進前水警總部改建的 1881 Heritage 看殖民時期建築。',
        tips: '上午光線順光拍港島天際線最好看；海濱有不少座椅，可坐下吹海風。曬了可以沿星光大道往東走進 K11 MUSEA，上 7 樓頂樓花園乘涼看維港。',
        payment: { methods: ['cash', 'octopus', 'credit'], note: '海濱步道上的鐘樓和星光大道都免費參觀；1881 商場店家可刷卡' },
        transit: [
          { mode: 'walk', label: '倫敦大酒樓 → 港鐵旺角站 E2 出口', minutes: 3 },
          { mode: 'mtr', mtr: ['mong-kok', 'tsim-sha-tsui'], label: '旺角 → 尖沙咀，荃灣綫直達', fare: '八達通 HK$5.9' },
          { mode: 'walk', label: 'E 出口 → 梳士巴利道 → 鐘樓', minutes: 12 }
        ],
        alternatives: [
          {
            id: 'd3-2-alt',
            label: '怕曬改去 K11 頂樓花園',
            title: '走星光大道到 K11 MUSEA 頂樓花園',
            location: '尖沙咀梳士巴利道 18 號 K11 MUSEA 7 樓 Bohemian Garden',
            coords: [22.2945, 114.1747],
            googleQuery: 'K11 MUSEA Bohemian Garden',
            description: '在鐘樓拍完照，沿星光大道往東走，太陽太曬就從海濱的發光走廊直接走進 K11 MUSEA 吹冷氣。搭電梯上 7 樓的 Bohemian Garden 頂樓花園看維港，6 樓還有一個看得到海濱的雕塑公園，逛累了再走去吃生煎包。',
            tips: '頂樓花園每天 10:00 到 22:00 開放；網路上查不到是否收入場費，到現場看告示。商場裡不少餐廳和咖啡廳也看得到維港。',
            mtrId: 'east-tsim-sha-tsui',
            payment: { methods: ['credit', 'octopus', 'cash'], note: '商場店家普遍可刷卡' },
            photoSpot: {
              hashtags: ['K11MUSEA', '星光大道', '維港'],
              keyword: 'K11 MUSEA 頂樓花園 維港',
              tip: '在 7 樓花園往維港方向拍，港島天際線就在眼前；中庭的 Gold Ball 玻璃球從下往上拍也很有氣勢。'
            },
            transit: [
              { mode: 'walk', label: '倫敦大酒樓 → 港鐵旺角站 E2 出口', minutes: 3 },
              { mode: 'mtr', mtr: ['mong-kok', 'tsim-sha-tsui'], label: '旺角 → 尖沙咀，荃灣綫直達', fare: '八達通 HK$5.9' },
              { mode: 'walk', label: 'E 出口 → 梳士巴利道 → 鐘樓 → 星光大道往東 → K11 MUSEA', minutes: 20, note: '沿路就是鐘樓和星光大道，邊走邊拍' }
            ],
            nextTransit: [{ mode: 'walk', label: 'K11 MUSEA → 梳士巴利道 → 彌敦道 → 樂道', minutes: 12 }]
          }
        ]
      },
      {
        id: 'd3-3',
        photoSpot: {
          hashtags: ['祥興記', '生煎包'],
          keyword: '祥興記 生煎包',
          tip: '咬開生煎包拍湯汁流出來的瞬間，小心很燙。'
        },
        start: '2026-11-24T12:10:00+08:00',
        end: '2026-11-24T12:50:00+08:00',
        timeLabel: '12:10 — 12:50',
        title: '祥興記的米芝蓮生煎包',
        location: '尖沙咀樂道 48 號地下 祥興記上海生煎包',
        district: '尖沙咀',
        districtColor: '#C83E37',
        coords: [22.2965, 114.1718],
        isHK: true,
        mtrId: 'tsim-sha-tsui',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sheng_jian_bao_-_Cheung_Hing_Kee%2C_Hong_Kong_%282024%29.jpg?width=800',
        googleQuery: '祥興記上海生煎包 尖沙咀 樂道',
        description: '米芝蓮必比登推介的生煎包：底部煎得金黃脆口，撒滿芝麻與蔥花，一咬下去湯汁飽滿。站在店外小桌趁熱吃，配一碗酸辣湯剛剛好。',
        tips: '⚠ 湯汁極燙，先咬小口吸湯再吃；店內不設座位，只能站著吃。尖沙咀店週一至週五 09:00–19:00，週六營業至 18:00，週日休息，所以排在週二。',
        payment: { methods: ['octopus', 'cash'], note: '各分店付款方式不一，有食客指灣仔店只收八達通，尖沙咀店則未能確認，八達通先儲足餘額' },
        transit: [
          { mode: 'walk', label: '1881 Heritage → 廣東道 → 北京道 → 樂道', minutes: 8 }
        ]
      },
      {
        id: 'd3-4',
        photoSpot: {
          hashtags: ['珍妮曲奇', 'jennybakery'],
          keyword: '珍妮曲奇 小熊',
          tip: '小熊鐵罐拍正面最可愛，可以把排隊的人龍一起拍進去當背景。'
        },
        start: '2026-11-24T12:55:00+08:00',
        end: '2026-11-24T14:00:00+08:00',
        timeLabel: '12:55 — 14:00',
        title: '排隊買珍妮曲奇小熊伴手禮',
        location: '尖沙咀彌敦道 54–64 號 美麗都大廈 地下 珍妮曲奇',
        district: '尖沙咀',
        districtColor: '#C83E37',
        coords: [22.2972, 114.1726],
        isHK: true,
        mtrId: 'tsim-sha-tsui',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/HK_%E4%B8%AD%E7%92%B0_Central_%E6%B0%B8%E5%92%8C%E8%A1%97_Wing_Wo_Street_shop_%E7%8F%8D%E5%A6%AE%E6%9B%B2%E5%A5%87_Jenny_Bakery_n_visitors_long_queue_March_2026_N13P_01.jpg?width=800',
        googleQuery: '珍妮曲奇聰明小熊 尖沙咀 美麗都大廈',
        description: '香港最有名的伴手禮之一：小熊鐵罐裝的四味奶油曲奇與八味果仁曲奇，酥鬆到入口即化。排隊是必經儀式，買好後順手放進背包，晚上回酒店再分裝。',
        tips: '平日中午通常需排 30–60 分鐘，本段已預留排隊時間；每人限購數量依現場公告。鐵罐不耐壓，建議手提上機。營業約 10:00–19:00。',
        payment: { methods: ['cash'], note: '普遍反映只收現金，但未能於官方確認，請備足港幣；限購與價格以現場為準' },
        transit: [
          { mode: 'walk', label: '樂道 → 彌敦道 → 美麗都大廈', minutes: 5 }
        ],
        alternatives: [
          {
            id: 'd3-4-alt',
            label: '曲奇四重奏',
            title: '改買曲奇四重奏的曲奇禮盒',
            location: '尖沙咀加拿分道 16 號金輝大廈地下 F 舖',
            coords: [22.2978, 114.1733],
            googleQuery: '曲奇四重奏 尖沙咀 加拿分道',
            description: '前港姐冠軍創立的曲奇品牌，全港大約 15 家分店，招牌是牛油曲奇和蝴蝶酥，鐵罐禮盒包裝精緻，很適合當伴手禮。尖沙咀店就在加拿分道，跟 Hashtag B 和媽咪雞蛋仔在同一條街，珍妮曲奇人龍太長時改來這裡，排隊通常短很多。旺角也有分店，晚上回酒店附近也能補買。',
            tips: '付款方式未能確認，建議備現金和八達通；分店地址出發前用 Google 地圖再確認。',
            mtrId: 'tsim-sha-tsui',
            payment: { methods: ['cash', 'octopus'], note: '付款方式未能確認，建議備現金和八達通' },
            photoSpot: { hashtags: ['曲奇四重奏', 'cookiesquartet'], keyword: '曲奇四重奏 禮盒', tip: '鐵罐禮盒拍正面最好看，四種口味排一排拍俯視。' },
            transit: [{ mode: 'walk', label: '祥興記 → 樂道 → 加拿分道 16 號', minutes: 6 }],
            nextTransit: [{ mode: 'walk', label: '加拿分道 16 號 → Hashtag B', minutes: 4 }]
          }
        ]
      },
      {
        id: 'd3-4b',
        start: '2026-11-24T14:05:00+08:00',
        end: '2026-11-24T14:25:00+08:00',
        timeLabel: '14:05 — 14:25',
        title: '到 Hashtag B 帶走開心果蛋撻',
        location: '尖沙咀夏蕙樓地下 C 號舖，近尖東站 B2 出口',
        district: '尖沙咀',
        districtColor: '#00A0E9',
        coords: [22.2996, 114.1737],
        isHK: true,
        mtrId: 'east-tsim-sha-tsui',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_Dan_tat.jpg?width=800',
        googleQuery: 'Hashtag B 尖沙咀',
        description: '小紅書上爆紅的手工烘焙店，跟 Bakehouse 並列香港兩大排隊蛋撻。招牌是牛油香很重的酥皮蛋撻，開心果口味常常很快賣完，拿破崙焦糖千層塔也很受歡迎。買好直接帶走，跟珍妮曲奇一起當今天的伴手禮。',
        tips: '尖沙咀店每天約 08:00 開到晚上；開心果蛋撻很搶手，賣完就改買原味或千層塔。網路上的地址有寫加拿芬道也有寫 Hau Fook Road，出發前請用 Google 地圖再確認。',
        payment: { methods: ['credit', 'octopus', 'cash'], note: '付款方式未能確認，建議備現金和八達通' },
        photoSpot: {
          hashtags: ['hashtagb', '香港蛋撻'],
          keyword: 'Hashtag B 開心果蛋撻',
          tip: '開心果蛋撻剝開拍綠色的內餡，和原味蛋撻並排拍俯視最好看。'
        },
        transit: [{ mode: 'walk', label: '美麗都大廈 → 加拿芬道 → Hashtag B', minutes: 6 }]
      },
      {
        id: 'd3-5',
        photoSpot: {
          hashtags: ['媽咪雞蛋仔', 'mammypancake', '雞蛋仔'],
          keyword: '媽咪雞蛋仔 尖沙咀',
          tip: '雞蛋仔剛出爐時對著光拍，一整片金黃色最漂亮；拿起來折一半拍側面，看得到外脆內軟的層次。'
        },
        start: '2026-11-24T14:30:00+08:00',
        end: '2026-11-24T14:50:00+08:00',
        timeLabel: '14:30 — 14:50',
        title: '媽咪雞蛋仔的現烤雞蛋仔',
        location: '尖沙咀加拿芬道 8 至 12 號地下',
        district: '尖沙咀',
        districtColor: '#C83E37',
        coords: [22.2975, 114.1731],
        isHK: true,
        mtrId: 'tsim-sha-tsui',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Egg_Waffle_on_Hong_Kong_Traditional_Egg_Waffle_Hawker_Cart_%28Model%29.jpg?width=800',
        googleQuery: '媽咪雞蛋仔 尖沙咀 加拿芬道',
        description: '從黃埔街起家的人氣雞蛋仔，尖沙咀分店曾連續三年入選米芝蓮街頭小食。招牌原味外脆內軟、蛋香很濃，也有朱古力、抹茶這類口味。跟珍妮曲奇和 Hashtag B 都在同一區，買完一路吃到西九。',
        tips: '現點現烤，等幾分鐘就好，剛出爐最好吃，放涼會變軟。分店很多，晚上回酒店前想再吃一份，旺角也有分店，地址出發前用 Google 地圖確認。',
        payment: { methods: ['cash', 'octopus'], note: '付款方式未能確認，建議備零錢或八達通' },
        transit: [{ mode: 'walk', label: 'Hashtag B → 加拿芬道 8 至 12 號', minutes: 5 }],
        alternatives: [
          {
            id: 'd3-5-alt',
            label: '尖東米芝蓮那家',
            title: '到媽咪雞蛋仔尖沙咀東分店',
            location: '尖沙咀東科學館道 14 號新文華中心地下 16 號舖',
            coords: [22.2995, 114.1765],
            googleQuery: '媽咪雞蛋仔 新文華中心',
            description: '媽咪雞蛋仔連續三年入選米芝蓮街頭小食的分店，在尖沙咀東的新文華中心。比加拿芬道店多走幾分鐘，想朝聖米芝蓮那家就選這裡。',
            mtrId: 'east-tsim-sha-tsui',
            payment: { methods: ['cash', 'octopus'], note: '付款方式未能確認，建議備零錢或八達通' },
            transit: [{ mode: 'walk', label: 'Hashtag B → 麼地道 → 科學館道 14 號', minutes: 8 }],
            nextTransit: [
              { mode: 'walk', label: '新文華中心 → 港鐵尖東站', minutes: 5 },
              { mode: 'mtr', mtr: ['east-tsim-sha-tsui', 'austin'], label: '尖東 → 柯士甸', fare: '八達通約 HK$5' },
              { mode: 'walk', label: '柯士甸站 → 西九藝術公園 → M+', minutes: 15 }
            ]
          },
          {
            id: 'd3-5-alt2',
            label: '利強記北角雞蛋仔',
            title: '利強記北角雞蛋仔',
            location: '尖沙咀彌敦道 178 號地下',
            coords: [22.3009, 114.1721],
            googleQuery: '利強記北角雞蛋仔 尖沙咀 彌敦道',
            description: '另一家曾獲米芝蓮街頭小食推介的老字號雞蛋仔，在彌敦道往佐敦方向，外脆內軟、蛋香十足。',
            mtrId: 'jordan',
            payment: { methods: ['cash', 'octopus'], note: '未能確認付款方式，建議備零錢' },
            transit: [{ mode: 'walk', label: 'Hashtag B → 金巴利道 → 彌敦道 178 號', minutes: 8 }],
            nextTransit: [{ mode: 'walk', label: '利強記 → 柯士甸道 → 柯士甸道西 → 西九文化區', minutes: 25, note: '走不動可搭的士，約 8 分鐘，車資 HK$35 上下' }]
          }
        ]
      },
      {
        id: 'd3-6',
        photoSpot: {
          hashtags: ['香港藝術館', 'hkmoa', '維港日落'],
          keyword: '香港藝術館 海景 日落',
          tip: '在臨海的落地玻璃窗前，把展廳和窗外的維港一起拍進去；閉館後走到外面的海濱長廊，拍港島天際線一棟棟亮燈。',
          hot: true
        },
        start: '2026-11-24T15:00:00+08:00',
        end: '2026-11-24T18:00:00+08:00',
        timeLabel: '15:00 — 18:00',
        title: '在香港藝術館看展，吹著冷氣看維港日落',
        location: '尖沙咀梳士巴利道 10 號',
        district: '尖沙咀',
        districtColor: '#C83E37',
        coords: [22.2935, 114.172],
        isHK: true,
        mtrId: 'east-tsim-sha-tsui',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_Museum_of_Art_201911.jpg?width=800',
        googleQuery: '香港藝術館 尖沙咀',
        description: '就在鐘樓旁邊的香港藝術館，2019 年翻新後換上一整面臨海的落地玻璃。常設展免費，可以慢慢看中國書畫、外銷畫和香港藝術家的作品。接近閉館時走到臨海的窗邊，吹著冷氣看太陽沉向維港西邊；閉館後再到外面的海濱長廊，等港島天際線一棟棟亮燈。',
        tips: '常設展免費，專題展另外收費，大約 HK$20 到 50。星期四休館，星期二照常開放；平日一般開到 18:00，但這次沒有查到官方的星期二時間，出發前請到官網確認。當天的日落時間看卡片上的標記。',
        payment: { methods: ['octopus', 'credit', 'cash'], note: '常設展免費；專題展和館內咖啡店的付款方式以現場為準' },
        transit: [{ mode: 'walk', label: '加拿芬道 → 梳士巴利道 → 香港藝術館', minutes: 10 }],
        alternatives: [
          {
            id: 'd3-6-alt',
            label: '改去 M+ 與西九日落',
            title: '西九文化區的 M+ 與藝術公園日落',
            location: 'M+ 博物館與西九藝術公園海濱長廊',
            coords: [22.3017, 114.1599],
            googleQuery: 'M+ 博物館 西九文化區',
            description: '想看當代藝術就改去西九的 M+，大樓本身就是很好拍的建築；傍晚到藝術公園的海邊草坪看日落，夕陽會沉在青馬大橋那一側。',
            tips: 'M+ 星期一休館，星期二照常開放；部分展廳免費。海邊風大，帶件外套。',
            image: 'https://commons.wikimedia.org/wiki/Special:FilePath/HK_YTM_%E8%A5%BF%E4%B9%9D%E9%BE%8D%E6%96%87%E5%8C%96%E5%8D%80_West_Kowloon_Cultural_District_M%2B_Plus_Museum_%E5%A4%A9%E5%8F%B0%E8%8A%B1%E5%9C%92_roof_garden_view_WKCD_Art_Park_July_2022_Px3_HKPM_Hong_Kong_Palace_Museum_sunset.jpg?width=800',
            mtrId: 'austin',
            payment: { methods: ['credit', 'octopus'], note: '大樓與部分展廳免費；付費展覽可刷卡或八達通' },
            photoSpot: {
              hashtags: ['mplusmuseum', '西九文化區', '西九藝術公園'],
              keyword: 'M+ 西九 日落 拍照',
              tip: '從藝術公園草坪往 M+ 方向拍，大樓立面和維港日落同框；黃昏坐在海邊階梯可以拍剪影。'
            },
            transit: [{ mode: 'walk', label: '加拿芬道 → 廣東道 → 柯士甸道西 → 西九文化區', minutes: 25, note: '帶著曲奇走不動時，可搭的士，約 8 分鐘，車資 HK$35 上下' }],
            nextTransit: [{ mode: 'walk', label: 'M+ → 藝術公園 → 柯士甸道西 → 佐敦道 → 白加士街', minutes: 25, note: '也可搭的士，約 8 分鐘，車資 HK$35 上下' }]
          }
        ]
      },
      {
        id: 'd3-7',
        photoSpot: {
          hashtags: ['澳洲牛奶公司', '炒蛋多士'],
          keyword: '澳洲牛奶公司',
          tip: '炒蛋多士和燉奶擺在一起拍俯視，動作要快，這裡翻桌很快。'
        },
        start: '2026-11-24T18:25:00+08:00',
        end: '2026-11-24T19:25:00+08:00',
        timeLabel: '18:25 — 19:25',
        title: '澳洲牛奶公司的炒蛋多士與燉奶',
        location: '佐敦白加士街 47–49 號 澳洲牛奶公司',
        district: '佐敦',
        districtColor: '#C83E37',
        coords: [22.3046, 114.1704],
        isHK: true,
        mtrId: 'jordan',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Australia_Dairy_Company_Hong_Kong.jpg?width=800',
        googleQuery: '澳洲牛奶公司 佐敦',
        description: '傳說中「快狠準」的茶餐廳：坐下三十秒點餐，三分鐘上桌。滑嫩炒蛋多士配火腿通粉，再來一碗凍或熱的蛋白燉奶，在節奏飛快的氛圍裡體驗最香港的晚餐。',
        tips: '一律搭枱，吃完盡快離座是這裡的默契；週四公休，週二照常營業。',
        payment: { methods: ['cash'], note: '多數遊記描述只收現金，請備港幣' },
        transit: [
          { mode: 'walk', label: '香港藝術館 → 梳士巴利道 → 港鐵尖沙咀站', minutes: 8 },
          { mode: 'mtr', mtr: ['tsim-sha-tsui', 'jordan'], label: '尖沙咀 → 佐敦', fare: '八達通 HK$4.9' },
          { mode: 'walk', label: '佐敦站 → 白加士街', minutes: 4 }
        ],
        alternatives: [
          {
            id: 'd3-7-alt',
            label: '排隊太長備案',
            title: '佐敦義順牛奶公司',
            location: '佐敦彌敦道 513 號',
            coords: [22.3049, 114.1716],
            googleQuery: '義順牛奶公司 佐敦',
            description: '澳洲牛奶公司排太長時，改到附近的義順吃雙皮燉奶與豬扒包；建議備現金。'
          }
        ]
      },
      {
        id: 'd3-8',
        photoSpot: {
          hashtags: ['惠康', '復古超市', '旺角'],
          keyword: '惠康 復古 主題店 旺角 山東街',
          tip: '走下樓梯時牆上貼滿懷舊照片，從樓梯口往下拍最有味道；店裡的復古招牌和貨架也很好拍。'
        },
        start: '2026-11-24T19:45:00+08:00',
        end: '2026-11-24T20:35:00+08:00',
        timeLabel: '19:45 — 20:35',
        title: '逛惠康復古主題店補貨零食手信',
        location: '旺角山東街 47 至 51 號中僑商業大廈',
        district: '旺角',
        districtColor: '#C83E37',
        coords: [22.3176, 114.1696],
        isHK: true,
        mtrId: 'mong-kok',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/HK_MK_%E6%97%BA%E8%A7%92_Mongkok_%E4%B8%8A%E6%B5%B7%E8%A1%97_444_Shanghai_Street_Dundas_Street_%E5%90%8C%E7%8F%8D%E5%95%86%E6%A5%AD%E4%B8%AD%E5%BF%83_Tung_Chun_Commercial_Centre_basement_shop_%E6%83%A0%E5%BA%B7%E8%B6%85%E5%B8%82_Wellcome_Supermarket_canned_food_September_2022_Px3.jpg?width=800',
        googleQuery: '惠康 山東街 中僑商業大廈',
        description: '惠康把旺角這家分店改成懷舊香港主題，沿著貼滿老照片的樓梯走下去，像走進舊時的街坊超市。慢慢挑維他檸檬茶、出前一丁限定口味、嘉頓餅乾、李錦記醬料和三合一奶茶，用最日常的價格把香港味道帶回家。',
        tips: '液體醬料請放託運行李；超市營業時間以門市為準，出發前用 Google 地圖確認。逛完走回酒店樓下的 MOKO，還可以再補買。',
        payment: { methods: ['credit', 'octopus', 'alipay', 'wechat', 'payme', 'applepay', 'cash'], note: '大型連鎖超市，付款最方便' },
        transit: [
          { mode: 'walk', label: '白加士街 → 港鐵佐敦站', minutes: 3 },
          { mode: 'mtr', mtr: ['jordan', 'mong-kok'], label: '佐敦 → 旺角', fare: '八達通 HK$4.9' },
          { mode: 'walk', label: '旺角站 → 山東街 47 號', minutes: 5 }
        ]
      },
      {
        id: 'd3-9',
        start: '2026-11-24T20:45:00+08:00',
        end: '2026-11-24T21:30:00+08:00',
        timeLabel: '20:45 — 21:30',
        title: '在酒店樓下的 MOKO 新世紀廣場收尾',
        location: '旺角太子道西 193 號 MOKO 新世紀廣場',
        district: '旺角',
        districtColor: '#C83E37',
        coords: [22.3237, 114.1729],
        isHK: true,
        mtrId: 'mong-kok-east',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/MOKO-Grand_Century_Place_201903_(brighter).jpg?width=800',
        googleQuery: 'MOKO 新世紀廣場 旺角',
        description: '帝京酒店就在新世紀廣場樓上，最後在商場裡慢慢逛：萬寧和莎莎補買藥妝，MUJI 看看生活小物。逛完直接從商場上樓回房間，不用提著大包小包走在路上，把伴手禮和曲奇裝箱，明天一早就要退房。',
        tips: '舊資料寫 3 樓美食廣場旁有一田超市，不確定現在還在不在，可以到商場的樓層指南確認；各店營業時間大多到 21:00 到 22:00。',
        payment: { methods: ['credit', 'octopus', 'cash'], note: '商場店家普遍可刷卡' },
        transit: [{ mode: 'walk', label: '山東街 → 亞皆老街 → 旺角道行人天橋 → MOKO', minutes: 12, note: '提著大包小包時，可以搭的士，約 HK$30 到 40' }],
        transitBack: [{ mode: 'walk', label: 'MOKO 商場 → 直接上樓回帝京酒店', minutes: 2 }]
      }
    ]
  },

  // ─────────────────────────── DAY 4 內容維持原樣，僅補交通與付款 ───────────────────────────
  {
    day: 4,
    date: '2026-11-25',
    dateLabel: 'NOV 25 WED',
    chineseDate: '十一月廿五日 星期三',
    theme: '昂坪 360 與東薈城，再搭 UO116 歸途',
    subtitle: '退房直奔東涌寄放行李，搭水晶纜車，再逛東薈城買 Bakehouse 蛋撻，從容赴機場回家',
    stationTag: '東涌 → 機場 T2',
    stationColor: '#D97706',
    items: [
      {
        id: 'd4-1',
        start: '2026-11-25T09:00:00+08:00',
        end: '2026-11-25T10:15:00+08:00',
        timeLabel: '09:00 — 10:15',
        title: '帝京酒店退房後赴東涌寄放行李',
        location: '帝京酒店 → 東涌站 → 東薈城置物櫃',
        district: '東涌',
        districtColor: '#D97706',
        coords: [22.2892, 113.9410],
        isHK: true,
        mtrId: 'tung-chung',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ngong_Ping_360_Cable_Car_Ngong_Ping_Lantau_Island_Hong_Kong_-_panoramio.jpg?width=800',
        googleQuery: '東薈城名店倉 行李寄存',
        description: '辦理 Check-out 退房後，直接帶著行李從旺角站搭港鐵荃灣線，到荔景轉東涌線前往東涌，將大件行李寄放在東薈城名店倉 B2 或 B3 的智慧置物櫃，或是昂坪 360 纜車站寄存處。',
        tips: '東薈城 B2 和 B3 的置物櫃 08:00 開放，建議早點到較容易有大型行李櫃位；若客滿也可至昂坪 360 東涌站或鄰近 KJ Lockers 寄放。',
        transit: [
          { mode: 'walk', label: '帶行李經旺角道行人天橋步行至港鐵旺角站', minutes: 12, note: '行李多可搭的士到旺角站，約 HK$30' },
          { mode: 'mtr', mtr: ['mong-kok', 'tung-chung'], label: '旺角 → 東涌，在荔景同月台轉東涌綫', fare: '八達通 HK$18.7', note: '若從旺角東站出發需經九龍塘轉車，車資 HK$22.1 且較繞' },
          { mode: 'walk', label: 'C 出口 → 東薈城名店倉置物櫃', minutes: 5 }
        ]
      },
      {
        id: 'd4-2',
        photoSpot: {
          hashtags: ['天壇大佛', '昂坪360', 'ngongping360'],
          keyword: '昂坪360 水晶纜車 天壇大佛',
          tip: '在水晶車廂往下拍透明車底和山海；到了昂坪，站在大佛階梯下往上拍仰角最壯觀。',
          hot: true
        },
        start: '2026-11-25T10:15:00+08:00',
        end: '2026-11-25T12:45:00+08:00',
        timeLabel: '10:15 — 12:45',
        title: '搭昂坪 360 水晶纜車看天壇大佛',
        ticketHint: '昂坪 360 纜車票',
        location: '昂坪纜車站 → 昂坪市集 → 寶蓮禪寺',
        district: '昂坪',
        districtColor: '#D97706',
        coords: [22.2540, 113.9050],
        isHK: true,
        mtrId: 'tung-chung',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tian_Tan_Buddha,_Hong_Kong.jpg?width=800',
        googleQuery: '昂坪360東涌纜車站',
        description: '乘透明車底水晶纜車凌空越過東涌灣與大嶼山翠巒，遠眺機場飛機起降；抵達後漫步昂坪市集，參拜天壇大佛，約 12:15 搭纜車返回東涌。',
        tips: '建議事先線上購票換 QR Code，省去現場排隊時間，並留意纜車回程時段以利銜接午餐與逛街。',
        payment: { methods: ['credit', 'octopus', 'alipay', 'wechat', 'applepay'], note: '建議在官網或旅遊平台預購；現場售票處可刷卡，但付款細項未逐一確認' },
        transit: [
          { mode: 'walk', label: '東薈城 → 達東路 → 昂坪 360 東涌纜車站', minutes: 5 },
          { mode: 'cable', label: '昂坪 360 東涌 → 昂坪', minutes: 25, fare: '官方原價來回標準車廂 HK$295，水晶車廂約 HK$365，線上常有折扣', note: '單程約 25 分鐘；強風時可能暫停' }
        ],
        alternatives: [
          {
            id: 'd4-2-alt',
            label: '天候不佳備案',
            title: '東薈城名店倉全天慢逛或大澳巴士快閃',
            location: '東涌東薈城名店倉',
            coords: [22.2896, 113.9408],
            googleQuery: '東薈城名店倉 Citygate Outlets',
            description: '若遇強風或天候不佳導致昂坪 360 纜車停駛，可改為悠閒逛東薈城名店倉，吃個早午餐再買 Bakehouse 蛋撻，下午提早至機場休息。'
          }
        ]
      },
      {
        id: 'd4-3',
        photoSpot: {
          hashtags: ['bakehouse', '東薈城'],
          keyword: 'Bakehouse 蛋撻',
          tip: '酸種蛋撻拍剖面看層次，打開整盒拍俯視也很好看。'
        },
        start: '2026-11-25T12:45:00+08:00',
        end: '2026-11-25T15:05:00+08:00',
        timeLabel: '12:45 — 15:05',
        title: '逛東薈城名店倉買 Bakehouse 蛋撻',
        location: '東薈城名店倉 Citygate Outlets 地下 G19 Bakehouse',
        district: '東涌',
        districtColor: '#D97706',
        coords: [22.2896, 113.9408],
        isHK: true,
        mtrId: 'tung-chung',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/HK_Central_%E4%B8%AD%E7%92%B0_SoHo_%E8%98%87%E8%B1%AA_Staunton_Street_%E5%A3%AB%E4%B8%B9%E9%A0%93%E8%A1%97_Bakehouse_Bakery_food_display_March_2021_SS2_03.jpg?width=800',
        googleQuery: 'Bakehouse Citygate Outlets 東薈城',
        description: '下山後直接進東涌站旁的「東薈城名店倉」逛 Outlet 百貨與享用午餐，再到地下 G19 號舖的 Bakehouse 買招牌酸種蛋撻 Sourdough Egg Tart 和可頌，現吃或手提帶回台灣！',
        tips: '東薈城 Bakehouse 位於 G19 舖，營業時間 08:00–21:00，僅供外帶，建議順手買一盒上機前吃或當伴手禮；蛋撻屬烘焙食品，手提登機最能保持酥脆。',
        payment: { methods: ['credit', 'octopus', 'cash'], note: 'Outlet 商店普遍可刷卡；Bakehouse 付款方式未逐一確認' },
        transit: [
          { mode: 'cable', label: '昂坪 360 回程 昂坪 → 東涌', minutes: 25, fare: '已含於來回票' },
          { mode: 'walk', label: '纜車站 → 東薈城名店倉', minutes: 5 }
        ],
        alternatives: [
          {
            id: 'd4-3-alt',
            label: '午餐美食備案',
            title: '東薈城美食廣場或港式茶餐廳',
            location: '東薈城名店倉 2F 和 7F 餐飲區',
            coords: [22.2896, 113.9408],
            googleQuery: '東薈城名店倉 餐廳',
            description: '商場內集結多間港式茶餐廳，也有點心與異國料理，逛完 Outlet 順道吃飽再出發去機場。'
          }
        ]
      },
      {
        id: 'd4-4',
        start: '2026-11-25T15:05:00+08:00',
        end: '2026-11-25T15:40:00+08:00',
        timeLabel: '15:05 — 15:40',
        title: '取回行李搭城巴 S1 赴機場 T2',
        location: '東涌巴士總站 → 香港國際機場 T2',
        district: '機場',
        districtColor: '#007A78',
        coords: [22.3135, 113.9367],
        isHK: true,
        mtrId: 'airport',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_International_Airport.jpg?width=800',
        googleQuery: '東涌站巴士總站 城巴 S1',
        description: '至置物櫃取回行李後，於東薈城旁的東涌站巴士總站搭乘城巴 S1 或的士，僅需約 10–15 分鐘即可直達香港國際機場二號客運大樓。',
        tips: '東涌離機場極近，不用再折返九龍拿行李，搭 S1 刷八達通快速又省錢！',
        transit: [
          { mode: 'walk', label: '置物櫃取回行李 → 東涌站巴士總站', minutes: 8 },
          { mode: 'bus', code: 'S1', label: '城巴 S1 東涌站 → 機場', minutes: 15, fare: '八達通約 HK$3.7', note: '班次密集，約 5–10 分鐘一班；大件行李放下層行李架' }
        ]
      },
      {
        id: 'd4-5',
        start: '2026-11-25T15:40:00+08:00',
        end: '2026-11-25T18:40:00+08:00',
        timeLabel: '15:40 — 18:40',
        title: 'UO116 報到託運再逛免稅店',
        location: '香港國際機場 T2 登機區',
        district: '機場',
        districtColor: '#007A78',
        coords: [22.3152, 113.9369],
        isHK: true,
        mtrId: 'airport',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_International_Airport.jpg?width=800',
        googleQuery: '香港國際機場二號客運大樓',
        description: '辦理香港快運 UO116 報到與行李秤重，出境後把八達通餘額花在機場伴手禮或茶餐廳。',
        tips: '香港快運手提行李件數與重量檢查較嚴，先整理成一件最安心，記得替 Bakehouse 蛋撻盒預留手提空間。',
        payment: { methods: ['credit', 'octopus', 'alipay', 'wechat', 'applepay', 'cash'], note: '機場商店餐廳付款最方便，八達通餘額可在此花完' },
        transit: [
          { mode: 'walk', label: 'S1 下車處 → T2 香港快運報到櫃位', minutes: 8 }
        ]
      },
      {
        id: 'd4-6',
        start: '2026-11-25T18:40:00+08:00',
        end: '2026-11-25T20:25:00+08:00',
        timeLabel: '18:40 — 20:25',
        title: '搭 UO116 返抵桃園，旅程圓滿',
        location: 'HKG T2 → TPE',
        district: '桃園',
        districtColor: '#1B4332',
        coords: [25.0802, 121.2392],
        isHK: false,
        mtrId: null,
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_International_Airport.jpg?width=800',
        googleQuery: '桃園國際機場',
        description: '搭乘香港快運 UO116 返台，預計 20:25 降落桃園國際機場，結束四天三夜的香江漫遊。',
        tips: '落地後聯絡富士捷接駁車回停車場取車，再開車回家。帶著滿載底片與回憶的行李箱回家囉！',
        transit: [
          { mode: 'walk', label: '出境後前往登機門', minutes: 20, note: 'T2 出境後需搭旅客捷運至登機區，預留時間' },
          { mode: 'flight', code: 'UO116', label: 'UO116 香港 → 桃園', minutes: 105, fare: '已購機票' }
        ]
      }
    ]
  }
];

export const PACKING_CHECKLIST: ChecklistItem[] = [
  { id: 'doc-passport', label: '有效期限 6 個月以上護照', group: '01 / 證件票券' },
  { id: 'doc-visa', label: '列印好的香港電子港簽預辦入境登記，或有效台胞證', group: '01 / 證件票券' },
  { id: 'doc-flight', label: 'HB703 和 UO116 電子機票，以及帝京酒店訂房憑證', group: '01 / 證件票券' },
  { id: 'pay-octopus', label: '加進 Apple Wallet 或實體卡的八達通，以及港幣現金', group: '02 / 金流通訊' },
  { id: 'net-esim', label: '確認香港 eSIM 或漫遊方案已開通', group: '02 / 金流通訊' },
  { id: 'gear-plug', label: '香港 220V 適用的英規三腳轉接頭，以及務必隨身的行動電源', group: '03 / 電子日常' },
  { id: 'gear-shoes', label: '好走的步行鞋，再帶件薄外套擋室內冷氣和山頂夜風', group: '03 / 電子日常' }
];
