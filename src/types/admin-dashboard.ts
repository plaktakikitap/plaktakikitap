export type DashboardTodo = {
  id: string;
  baslik: string;
  bitis_tarihi: string | null;
  oncelik: string;
};

export type DashboardNot = {
  id: string;
  icerik: string;
};

export type DashboardKitap = {
  id: string;
  baslik: string;
  yazar: string | null;
  sayfa_toplam: number | null;
  yuzde: number | null;
};

export type DashboardYazi = {
  id: string;
  baslik: string;
  durum: string;
  updated_at: string;
};

export type DashboardIcerik = {
  id: string;
  baslik: string;
  hesap_ad: string;
  hesap_renk: string;
};

export type MorningDashboard = {
  selam: string;
  tarih: string;
  bugunISO: string;
  acilTodos: DashboardTodo[];
  bugunNotlar: DashboardNot[];
  okuyorumKitap: DashboardKitap | null;
  kitapYuzde: number | null;
  sporGunleri: number;
  bugunSpor: boolean;
  toplamKalori: number;
  yazilar: DashboardYazi[];
  streak: number;
  icerikBugun: DashboardIcerik[];
  icerikGeciken: number;
};
