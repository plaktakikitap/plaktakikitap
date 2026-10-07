import type { VucutOlcum, VucutOlcumAlani } from "@/types/takip";

export const OLCUM_ALANLARI: {
  key: VucutOlcumAlani;
  label: string;
  birim: string;
  step: string;
  placeholder: string;
}[] = [
  { key: "kilo_kg", label: "Kilo", birim: "kg", step: "0.1", placeholder: "78.4" },
  { key: "boy_cm", label: "Boy", birim: "cm", step: "0.1", placeholder: "178" },
  { key: "yag_yuzde", label: "Yağ oranı", birim: "%", step: "0.1", placeholder: "18.2" },
  { key: "kas_yuzde", label: "Kas oranı", birim: "%", step: "0.1", placeholder: "42" },
  { key: "su_yuzde", label: "Su oranı", birim: "%", step: "0.1", placeholder: "55" },
  { key: "protein_yuzde", label: "Protein oranı", birim: "%", step: "0.1", placeholder: "18" },
  { key: "iskelet_kas_yuzde", label: "İskelet kası", birim: "%", step: "0.1", placeholder: "36" },
  { key: "kemik_kg", label: "Kemik kütlesi", birim: "kg", step: "0.1", placeholder: "3.2" },
  { key: "visseral_yag", label: "İç organ yağı", birim: "seviye", step: "1", placeholder: "8" },
  { key: "bmr_kcal", label: "Bazal metabolizma", birim: "kcal", step: "1", placeholder: "1700" },
  { key: "metabolik_yas", label: "Metabolik yaş", birim: "yaş", step: "1", placeholder: "28" },
  { key: "bel_cm", label: "Bel", birim: "cm", step: "0.1", placeholder: "84" },
  { key: "kalca_cm", label: "Kalça", birim: "cm", step: "0.1", placeholder: "98" },
  { key: "gogus_cm", label: "Göğüs", birim: "cm", step: "0.1", placeholder: "96" },
  { key: "boyun_cm", label: "Boyun", birim: "cm", step: "0.1", placeholder: "38" },
];

export const GRAFIK_ALANLARI: VucutOlcumAlani[] = [
  "kilo_kg",
  "yag_yuzde",
  "kas_yuzde",
  "su_yuzde",
  "bel_cm",
];

export type VucutFark = {
  key: VucutOlcumAlani;
  label: string;
  birim: string;
  delta: number;
};

export type VucutAnaliz = {
  son: VucutOlcum | null;
  onceki: VucutOlcum | null;
  farklar: VucutFark[];
  bmi: { deger: number; sinif: string } | null;
  belKalca: number | null;
  satirlar: string[];
  oneriler: string[];
  seri: { tarih: string; label: string; deger: number | null }[];
};

function formatTarih(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function gunFarki(a: string, b: string) {
  const ms = new Date(a + "T00:00:00").getTime() - new Date(b + "T00:00:00").getTime();
  return Math.round(ms / 86400000);
}

function boyBul(sirali: VucutOlcum[], tercih: VucutOlcum | null) {
  if (tercih?.boy_cm) return tercih.boy_cm;
  return sirali.find((row) => row.boy_cm != null)?.boy_cm ?? null;
}

function bmiSinif(bmi: number) {
  if (bmi < 18.5) return "düşük";
  if (bmi < 25) return "olağan aralık";
  if (bmi < 30) return "fazla kilolu aralık";
  return "obezite aralığı";
}

function fmt(n: number, birim: string) {
  const abs = Math.abs(n);
  const text = Number.isInteger(n) ? String(n) : abs >= 10 ? n.toFixed(1) : n.toFixed(1);
  const sign = n > 0 ? "+" : "";
  return `${sign}${text} ${birim}`;
}

function onerilerUret(input: {
  son: VucutOlcum | null;
  onceki: VucutOlcum | null;
  bmi: VucutAnaliz["bmi"];
  belKalca: number | null;
}): string[] {
  const { son, onceki, bmi, belKalca } = input;
  const oneriler: string[] = [];
  const ekle = (metin: string) => {
    if (oneriler.length < 5 && !oneriler.includes(metin)) oneriler.push(metin);
  };

  if (!son) {
    return [
      "İlk kaydı sabah, aynı tartıda al. Boy, yağ, kas, bel ve kalçayı da yaz; öneri ancak o zaman netleşir.",
    ];
  }

  const gun = onceki ? gunFarki(son.tarih, onceki.tarih) : 0;
  const kiloDelta =
    son.kilo_kg != null && onceki?.kilo_kg != null ? son.kilo_kg - onceki.kilo_kg : null;
  const hafta = kiloDelta != null && gun > 0 ? (kiloDelta / gun) * 7 : null;
  const yagDelta =
    son.yag_yuzde != null && onceki?.yag_yuzde != null
      ? son.yag_yuzde - onceki.yag_yuzde
      : null;
  const kasDelta =
    son.kas_yuzde != null && onceki?.kas_yuzde != null
      ? son.kas_yuzde - onceki.kas_yuzde
      : null;

  if (hafta != null && hafta <= -1) {
    ekle(
      "Kilo kaybı haftada 1 kg’ı geçmiş. Açığı büyütme; öğünlerde protein tut, kuvvet antrenmanını bırakma."
    );
  } else if (hafta != null && hafta >= 1) {
    ekle(
      "Kilo artışı hızlı. Önce uyku, adım ve akşam öğününü düzelt; tartıyı her gün kovalama."
    );
  }

  if (yagDelta != null && kasDelta != null && yagDelta < -0.2 && kasDelta >= -0.2) {
    ekle("Yağ inerken kas duruyor. Kaloriyi daha da kesme; bu düzeni ve kuvveti koru.");
  } else if (yagDelta != null && kasDelta != null && yagDelta > 0.3 && kasDelta < -0.3) {
    ekle(
      "Yağ artmış, kas düşmüş. Haftada 2–3 direnç antrenmanı ekle; sadece öğünü kısmak kası da götürür."
    );
  } else if (kiloDelta != null && kiloDelta < -0.3 && yagDelta != null && yagDelta >= -0.2) {
    ekle(
      "Kilo inmiş, yağ oranı inmemiş. Sonraki ölçümü aynı saatte, aç karnına al; fark su olabilir."
    );
  }

  if (bmi && bmi.deger < 18.5) {
    ekle("BKİ düşük tarafta. Kilo hedefi koyma; öğünü kaçırma ve kuvvet çalış.");
  } else if (bmi && bmi.deger >= 30) {
    ekle(
      "BKİ yüksek tarafta. Haftada yaklaşık 0,5 kg yeter. Bel ölçüsü, tartıdan daha net takip olur."
    );
  } else if (bmi && bmi.deger >= 25) {
    ekle(
      "BKİ fazla kilolu aralıkta. Günlük adımı artır, geç saatte şekeri azalt, beli iki haftada bir yaz."
    );
  }

  if (son.visseral_yag != null && son.visseral_yag >= 15) {
    ekle(
      "İç organ yağı yüksek bantta. Her gün yürü, akşam öğününü erken kapa. Bu bant inmezse bir hekime danış."
    );
  } else if (son.visseral_yag != null && son.visseral_yag >= 10) {
    ekle(
      "İç organ yağı orta bantta. Haftada birkaç tempolu yürüyüş ve daha erken akşam öğünü bu bandı genelde indirir."
    );
  }

  if (belKalca != null && belKalca >= 0.9) {
    ekle(
      "Bel, kalçaya göre geniş. Göbek egzersizi ölçüyü değiştirmez; yürüyüş ve öğün saati bel çevresini daha çok etkiler."
    );
  }

  if (son.su_yuzde != null && son.su_yuzde < 45) {
    ekle("Su oranı düşük okunuyor. Günü yayarak su iç; ölçümü idrar sonrası, antrenmandan önce al.");
  } else if (son.su_yuzde != null && son.su_yuzde > 65) {
    ekle("Su oranı yüksek okunuyor. Çoğu zaman son öğün veya tuzdur; ertesi sabah aynı tartıda doğrula.");
  }

  if (son.bmr_kcal != null) {
    ekle(
      `Bazal metabolizma ${son.bmr_kcal} kcal. Günlük yemeği uzun süre bunun altında tutma; açık küçük kalsın.`
    );
  }

  const eksik = [
    son.yag_yuzde == null ? "yağ" : null,
    son.kas_yuzde == null ? "kas" : null,
    son.bel_cm == null ? "bel" : null,
  ].filter((item): item is string => item != null);
  if (eksik.length > 0) {
    ekle(`Sonraki ölçüme ${eksik.join(", ")} ekle. Kilo tek başına yağ mı su mu ayırt etmez.`);
  }

  if (!onceki) {
    ekle("Aynı koşullarda 7–14 gün sonra tekrar ölç. Karşılaştırma ve tempo ancak ikinci kayıtta başlar.");
  } else if (oneriler.length < 3) {
    ekle("Ölçümü haftada bir, aynı saatte tekrarla. Her gün tartılmak gürültü üretir.");
  }

  return oneriler;
}

export function vucutAnalizEt(
  kayitlar: VucutOlcum[],
  grafik: VucutOlcumAlani = "kilo_kg"
): VucutAnaliz {
  const artan = [...kayitlar].sort((a, b) => a.tarih.localeCompare(b.tarih));
  const son = artan.at(-1) ?? null;
  const onceki = artan.length > 1 ? artan[artan.length - 2] : null;
  const alan = OLCUM_ALANLARI.find((item) => item.key === grafik) ?? OLCUM_ALANLARI[0];

  const farklar: VucutFark[] = [];
  if (son && onceki) {
    for (const field of OLCUM_ALANLARI) {
      const a = son[field.key];
      const b = onceki[field.key];
      if (a == null || b == null) continue;
      const delta = Math.round((a - b) * 10) / 10;
      if (delta === 0) continue;
      farklar.push({
        key: field.key,
        label: field.label,
        birim: field.birim,
        delta,
      });
    }
  }

  const boy = boyBul([...artan].reverse(), son);
  let bmi: VucutAnaliz["bmi"] = null;
  if (son?.kilo_kg && boy) {
    const metre = boy / 100;
    const deger = Math.round((son.kilo_kg / (metre * metre)) * 10) / 10;
    bmi = { deger, sinif: bmiSinif(deger) };
  }

  const belKalca =
    son?.bel_cm && son.kalca_cm
      ? Math.round((son.bel_cm / son.kalca_cm) * 100) / 100
      : null;

  const satirlar: string[] = [];
  if (!son) {
    satirlar.push("İlk ölçüyü kaydedince karşılaştırma ve grafik burada birikir.");
  } else if (!onceki) {
    satirlar.push("Bir sonraki ölçümde farklar ve tempo görünecek.");
  } else {
    const gun = gunFarki(son.tarih, onceki.tarih);
    if (son.kilo_kg != null && onceki.kilo_kg != null && gun > 0) {
      const dk = son.kilo_kg - onceki.kilo_kg;
      const hafta = (dk / gun) * 7;
      satirlar.push(
        `Son ${gun} günde kilo ${fmt(Math.round(dk * 10) / 10, "kg")}. Bu tempo haftada yaklaşık ${fmt(Math.round(hafta * 10) / 10, "kg")}.`
      );
      if (Math.abs(hafta) >= 1) {
        satirlar.push(
          "Haftada 1 kg ve üzeri değişim hızlıdır; tartı saati, su ve öğün bunu şişirebilir."
        );
      }
    }
    if (son.yag_yuzde != null && onceki.yag_yuzde != null && son.kas_yuzde != null && onceki.kas_yuzde != null) {
      const yag = son.yag_yuzde - onceki.yag_yuzde;
      const kas = son.kas_yuzde - onceki.kas_yuzde;
      if (yag < -0.2 && kas >= -0.2) {
        satirlar.push("Yağ oranı gerilerken kas oranı korunmuş veya artmış.");
      } else if (yag > 0.3 && kas < -0.3) {
        satirlar.push("Yağ oranı artmış, kas oranı azalmış.");
      }
    }
    const otuz = artan.filter((row) => gunFarki(son.tarih, row.tarih) >= 28).at(-1);
    if (otuz && otuz.kilo_kg != null && son.kilo_kg != null && otuz.id !== son.id) {
      const dk = Math.round((son.kilo_kg - otuz.kilo_kg) * 10) / 10;
      satirlar.push(
        `${formatTarih(otuz.tarih)} ölçümüne göre kilo ${fmt(dk, "kg")} (${gunFarki(son.tarih, otuz.tarih)} gün).`
      );
    }
  }

  if (bmi) {
    satirlar.push(`BKİ ${bmi.deger} — ${bmi.sinif}. Boy ve kilodan hesaplanır, yağ dağılımını göstermez.`);
  }
  if (son?.su_yuzde != null && (son.su_yuzde < 45 || son.su_yuzde > 65)) {
    satirlar.push(
      `Su oranı %${son.su_yuzde}. Çoğu yetişkin tartısında bu değer kabaca %45–65 okunur.`
    );
  }
  if (son?.visseral_yag != null) {
    const v = son.visseral_yag;
    const band = v < 10 ? "düşük bant" : v < 15 ? "orta bant" : "yüksek bant";
    satirlar.push(`İç organ yağı ${v} — tartı skalasında ${band}.`);
  }
  if (belKalca != null) {
    satirlar.push(`Bel/kalça oranı ${belKalca}. Oran düşüyorsa bel, kalçaya göre inceliyor.`);
  }

  const oneriler = onerilerUret({ son, onceki, bmi, belKalca });

  const seri = artan
    .filter((row) => row[alan.key] != null)
    .map((row) => ({
      tarih: row.tarih,
      label: new Date(row.tarih + "T00:00:00").toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
      }),
      deger: row[alan.key],
    }));

  return { son, onceki, farklar, bmi, belKalca, satirlar, oneriler, seri };
}
