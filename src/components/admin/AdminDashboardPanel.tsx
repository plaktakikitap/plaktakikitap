"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  BookOpen,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  PenLine,
  Smartphone,
  Utensils,
} from "lucide-react";
import type {
  DashboardIcerik,
  DashboardKitap,
  DashboardNot,
  DashboardTodo,
  DashboardYazi,
} from "@/types/admin-dashboard";

type Renk = "gold" | "green" | "red" | "blue";

const RENK: Record<Renk, string> = {
  gold: "text-[#b8934a]",
  green: "text-emerald-600",
  red: "text-red-600",
  blue: "text-sky-600",
};

function Widget({
  href,
  icon: Icon,
  baslik,
  children,
  renk = "gold",
}: {
  href: string;
  icon: LucideIcon;
  baslik: string;
  children: ReactNode;
  renk?: Renk;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-[#e8e0d4] bg-white/70 p-4 transition-all hover:border-[#b8934a]/40 hover:bg-white/90"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} className={RENK[renk]} />
          <span className="text-xs font-semibold uppercase tracking-wide text-[#6b6158]">
            {baslik}
          </span>
        </div>
        <ChevronRight
          size={14}
          className="text-[#e8e0d4] transition-colors group-hover:text-[#b8934a]"
        />
      </div>
      {children}
    </Link>
  );
}

function formatBitis(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

export default function AdminDashboardPanel({
  selam,
  tarih,
  bugunISO,
  acilTodos,
  bugunNotlar,
  okuyorumKitap,
  kitapYuzde,
  sporGunleri,
  bugunSpor,
  toplamKalori,
  yazilar,
  streak,
  icerikBugun,
  icerikGeciken,
}: {
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
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-[#1a1612]">{selam}</h1>
          {streak > 0 ? (
            <span className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600">
              <Flame size={14} className="fill-orange-600" />
              {streak} gün
            </span>
          ) : null}
        </div>
        <p className="text-sm capitalize text-[#6b6158]">{tarih}</p>
      </div>

      {acilTodos.length > 0 ? (
        <Widget
          href="/secretgate/yapilacaklar"
          icon={AlertCircle}
          baslik="Acil Yapılacaklar"
          renk="red"
        >
          <div className="space-y-2">
            {acilTodos.slice(0, 3).map((todo) => {
              const gecti = Boolean(
                todo.bitis_tarihi && todo.bitis_tarihi < bugunISO
              );
              return (
                <div key={todo.id} className="flex items-start gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[#1a1612]">{todo.baslik}</p>
                    {todo.bitis_tarihi ? (
                      <p
                        className={`text-xs ${
                          gecti ? "font-medium text-red-600" : "text-[#6b6158]"
                        }`}
                      >
                        {gecti ? "⚠ Geçti: " : ""}
                        {formatBitis(todo.bitis_tarihi)}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
            {acilTodos.length > 3 ? (
              <p className="text-xs text-[#6b6158]">+{acilTodos.length - 3} daha</p>
            ) : null}
          </div>
        </Widget>
      ) : null}

      {icerikBugun.length > 0 || icerikGeciken > 0 ? (
        <Widget href="/secretgate/icerik" icon={Smartphone} baslik="İçerik" renk="gold">
          <div className="space-y-1.5">
            {icerikBugun.slice(0, 4).map((i) => (
              <p key={i.id} className="truncate text-sm text-[#1a1612]">
                <span
                  className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: i.hesap_renk }}
                />
                {i.baslik}
                {i.hesap_ad ? (
                  <span className="ml-1 text-xs text-[#6b6158]">· {i.hesap_ad}</span>
                ) : null}
              </p>
            ))}
            {icerikBugun.length === 0 ? (
              <p className="text-sm text-[#6b6158]">Bugün planlanmış içerik yok</p>
            ) : null}
            {icerikGeciken > 0 ? (
              <p className="text-xs font-medium text-red-600">
                Geciken: {icerikGeciken} içerik
              </p>
            ) : null}
          </div>
        </Widget>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Widget href="/secretgate/okunacaklar" icon={BookOpen} baslik="Okuyorum" renk="gold">
          {okuyorumKitap ? (
            <div>
              <p className="line-clamp-2 text-sm font-semibold leading-tight text-[#1a1612]">
                {okuyorumKitap.baslik}
              </p>
              {okuyorumKitap.yazar ? (
                <p className="mt-0.5 text-xs text-[#6b6158]">{okuyorumKitap.yazar}</p>
              ) : null}
              {kitapYuzde !== null ? (
                <div className="mt-2">
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#e8e0d4]">
                    <div
                      className="h-full rounded-full bg-[#b8934a]"
                      style={{ width: `${kitapYuzde}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[#6b6158]">
                    %{kitapYuzde}
                    {okuyorumKitap.sayfa_toplam
                      ? ` · ${okuyorumKitap.sayfa_toplam}s`
                      : null}
                  </p>
                </div>
              ) : okuyorumKitap.sayfa_toplam ? (
                <p className="mt-2 text-xs text-[#6b6158]">
                  {okuyorumKitap.sayfa_toplam} sayfa
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-[#6b6158]">Şu an okunan kitap yok</p>
          )}
        </Widget>

        <Widget href="/secretgate/spor" icon={Dumbbell} baslik="Spor" renk="green">
          <div>
            <div className="text-2xl font-bold text-[#1a1612]">{sporGunleri}</div>
            <div className="text-xs text-[#6b6158]">bu ay antrenman</div>
            <div
              className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                bugunSpor
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-[#e8e0d4] text-[#6b6158]"
              }`}
            >
              {bugunSpor ? "✓ Bugün yapıldı" : "Bugün bekleniyor"}
            </div>
          </div>
        </Widget>

        <Widget href="/secretgate/beslenme" icon={Utensils} baslik="Beslenme" renk="blue">
          <div>
            <div className="text-2xl font-bold text-[#1a1612]">{toplamKalori}</div>
            <div className="text-xs text-[#6b6158]">bugünkü kalori</div>
          </div>
        </Widget>

        <Widget href="/secretgate/yazilarim" icon={PenLine} baslik="Yazılar" renk="gold">
          {yazilar.length > 0 ? (
            <div className="space-y-1.5">
              {yazilar.slice(0, 2).map((yazi) => (
                <div key={yazi.id} className="flex items-start gap-1.5">
                  <div
                    className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                      yazi.durum === "yayinda"
                        ? "bg-emerald-500"
                        : yazi.durum === "taslak"
                          ? "bg-amber-500"
                          : "bg-[#6b6158]"
                    }`}
                  />
                  <p className="line-clamp-1 text-xs text-[#1a1612]">{yazi.baslik}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6b6158]">Henüz yazı yok</p>
          )}
        </Widget>
      </div>

      {bugunNotlar.length > 0 ? (
        <Widget href="/secretgate/gunluk" icon={Clock} baslik="Bugünkü Notlar" renk="gold">
          <div className="space-y-2">
            {bugunNotlar.map((not) => (
              <p
                key={not.id}
                className="line-clamp-2 text-sm leading-relaxed text-[#1a1612]"
              >
                {not.icerik}
              </p>
            ))}
          </div>
        </Widget>
      ) : null}

      <div className="grid grid-cols-4 gap-2">
        {[
          { href: "/secretgate/diller/ingilizce/ogrenme", emoji: "🇬🇧", label: "İng" },
          { href: "/secretgate/diller/fransizca/ogrenme", emoji: "🇫🇷", label: "Fr" },
          { href: "/secretgate/diller/almanca/ogrenme", emoji: "🇩🇪", label: "Alm" },
          { href: "/secretgate/istatistikler", emoji: "📊", label: "İstat" },
        ].map(({ href, emoji, label }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 rounded-xl border border-[#e8e0d4] bg-white/60 p-3 transition-all hover:border-[#b8934a]/30 hover:bg-white/80"
          >
            <span className="text-xl">{emoji}</span>
            <span className="text-xs text-[#6b6158]">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
