/**
 * 出發前須知（首頁輪播用）
 * 規定類資訊請以官方公告為準，每則附上官方連結方便出發前再次確認。
 */

export interface PreDepartureNote {
  id: string;
  /** 港鐵綫色，作為馬賽克磚點綴 */
  color: string;
  title: string;
  body: string;
  /** 需要特別注意的一句（紅字） */
  alert?: string;
  link?: { label: string; url: string };
  /** 對應行前清單的項目 id，可在手帖勾選 */
  checklistId?: string;
}

export const PRE_DEPARTURE_NOTES: PreDepartureNote[] = [
  {
    id: 'entry',
    color: '#ED1D24',
    title: '入境：台灣居民網上預辦入境登記',
    body: '免費線上申請，核准後列印或存手機；入境時連同台灣護照出示。',
    alert: '出發前務必完成，並確認姓名與護照號碼無誤',
    link: { label: '香港入境事務處', url: 'https://www.immd.gov.hk/hkt/services/visas/pre-arrival_registration_for_taiwan_residents.html' },
    checklistId: 'doc-visa'
  },
  {
    id: 'passport',
    color: '#00AB4E',
    title: '護照與機票',
    body: '護照效期建議 6 個月以上；HB703 和 UO116 電子機票，連同帝京酒店訂房與機場接送確認信，都存在手機離線也能看的地方。',
    checklistId: 'doc-passport'
  },
  {
    id: 'octopus',
    color: '#007DC5',
    title: '交通：不用八達通，直接感應信用卡',
    body: '這趟全程不辦八達通。港鐵閘口、天星小輪閘機、叮叮車和城巴都能直接感應 Visa 或 Mastercard 信用卡，也可以用綁好卡的 Apple Pay。每人各用一張卡或一支手機進出，不能三個人共用同一張卡。',
    alert: '出發前確認每人的卡都有感應付款功能，並開通海外交易',
    link: { label: '港鐵感應式付款說明', url: 'https://www.mtr.com.hk/ch/customer/main/contactless_payment.html' },
    checklistId: 'pay-octopus'
  },
  {
    id: 'cash',
    color: '#923011',
    title: '現金：港幣準備一些',
    body: '茶餐廳和老字號店家，還有街邊小吃和珍妮曲奇，很多只收現金。三人合計準備 HK$2,500 到 3,000，每人約 HK$850 到 1,000，其餘刷卡。換鈔請換 HK$100 和 HK$500 面額，很多店家不收 HK$1,000 大鈔。',
    alert: '各店付款方式見行程頁的付款標籤；祥興記生煎包反而不收現金，要刷卡'
  },
  {
    id: 'esim',
    color: '#53B7E8',
    title: '網路：eSIM 或漫遊',
    body: '香港可正常使用 Google 和 LINE，IG 也沒問題。出發前先安裝並測試 eSIM，落地後再開啟數據漫遊。',
    checklistId: 'net-esim'
  },
  {
    id: 'plug',
    color: '#7D499D',
    title: '電壓 220V 與英式三腳插座',
    body: '手機和行動電源的充電器多為國際電壓，帶英規轉接頭即可；吹風機等電器請確認是否支援 220V。',
    checklistId: 'gear-plug'
  },
  {
    id: 'airport',
    color: '#F7943E',
    title: '機場：報到時間與行李',
    body: '去程 11/22 09:00 從家出發，約 09:35 到桃園 T1；回程 UO116 建議 15:40 前到香港機場 T2 報到。廉航手提行李重量檢查嚴格。',
    alert: '香港快運手提行李限重請以航空公司官網為準',
    link: { label: '香港快運官網行李規定', url: 'https://www.hkexpress.com/zh-hk/' }
  },
  {
    id: 'apps',
    color: '#00888A',
    title: '實用 App 與緊急聯絡',
    body: '推薦下載 MTR Mobile 和我的天文台，再加上 Google Maps 或 Citymapper。緊急求助撥 999；出國前可登錄外交部「出國登錄」。',
    link: { label: '外交部 出國登錄', url: 'https://www.boca.gov.tw/sp-abre-main-1.html' }
  }
];

/** 機場接送（第一天）— 預約資訊待填 */
export const AIRPORT_TRANSFER = {
  title: '機場接送 → 帝京酒店',
  date: '11/22 週日約 14:40 出發',
  note: '入境並提領行李後，依預約資訊到集合點；車程約 45 分鐘直達旺角東帝京酒店。',
  /** 業者、聯絡電話、集合點等預約後填入 */
  provider: '',
  contact: '',
  meetingPoint: ''
};
