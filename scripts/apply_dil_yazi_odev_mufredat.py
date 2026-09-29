#!/usr/bin/env python3
"""Apply 096 schema + 540 writing-prompt seed. Does not drop existing dated overrides."""

from __future__ import annotations

import json
import os
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

import psycopg
from psycopg.rows import dict_row

ROOT = Path(__file__).resolve().parents[1]
MIGRATION = ROOT / "supabase/migrations/098_dil_yazi_odev_gun.sql"
SEED_DIR = ROOT / "supabase/seeds"
SQL_EDITOR = ROOT / "yazi_odevleri.sql"


def load_env() -> None:
    path = ROOT / ".env.local"
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        raw = line.strip()
        if not raw or raw.startswith("#") or "=" not in raw:
            continue
        key, value = raw.split("=", 1)
        value = value.strip().strip("'").strip('"')
        os.environ.setdefault(key.strip(), value)


def direct_dsn(url: str) -> str:
    parsed = urlparse(url)
    query = dict(parse_qsl(parsed.query, keep_blank_values=True))
    query.pop("pgbouncer", None)
    query["sslmode"] = "require"
    netloc = parsed.netloc
    if parsed.port == 6543 and "@" in netloc:
        userinfo, hostport = netloc.rsplit("@", 1)
        host_only = hostport.rsplit(":", 1)[0]
        netloc = f"{userinfo}@{host_only}:5432"
    new = parsed._replace(
        netloc=netloc,
        query=urlencode(query),
    )
    return urlunparse(new)


def statements(sql: str) -> list[str]:
    parts: list[str] = []
    buf: list[str] = []
    for line in sql.splitlines():
        stripped = line.strip()
        if stripped.startswith("--"):
            continue
        buf.append(line)
        if stripped.endswith(";"):
            chunk = "\n".join(buf).strip()
            if chunk:
                parts.append(chunk)
            buf = []
    tail = "\n".join(buf).strip()
    if tail:
        parts.append(tail)
    return parts


def main() -> None:
    load_env()
    raw = os.environ.get("DATABASE_URL")
    if not raw:
        raise SystemExit("DATABASE_URL yok")
    dsn = direct_dsn(raw)
    seed: dict = {}
    for path in sorted(SEED_DIR.glob("dil_yazi_odevleri_*.json")):
        seed.update(json.loads(path.read_text()))
    schema_sql = MIGRATION.read_text()

    rows: list[tuple[str, str, int, str, str]] = []
    for seviye, days in seed.items():
        for item in days:
            gun = int(item["gun"])
            overrides = item.get("tr_overrides") or {}
            for dil in ("ingilizce", "fransizca", "almanca"):
                prompt_tr = overrides.get(dil, item["tr"])
                rows.append((dil, seviye, gun, prompt_tr, item[dil]))

    if len(rows) != 540:
        raise SystemExit(f"Beklenen 540 satır, gelen {len(rows)} (seviyeler: {sorted(seed)})")

    def esc(s: str) -> str:
        return s.replace("'", "''")

    sql_lines = [
        "-- 540 yazı ödevi: İngilizce + Fransızca + Almanca, A1–C2, 30 gün/seviye.",
        "-- Anahtar: (dil, seviye, gun). Takvim tarihi yok; ilerleme dil_yazi_ilerleme.baslangic_tarihi ile sayılır.",
        "INSERT INTO dil_yazi_odevleri (dil, seviye, gun, prompt_tr, prompt_hedef) VALUES",
    ]
    sql_lines.append(
        ",\n".join(
            f"('{dil}', '{seviye}', {gun}, '{esc(tr)}', '{esc(hedef)}')"
            for dil, seviye, gun, tr, hedef in rows
        )
    )
    sql_lines.append("ON CONFLICT (dil, seviye, gun)")
    sql_lines.append(
        "DO UPDATE SET prompt_tr = EXCLUDED.prompt_tr, prompt_hedef = EXCLUDED.prompt_hedef;"
    )
    SQL_EDITOR.write_text("\n".join(sql_lines) + "\n")

    with psycopg.connect(dsn, row_factory=dict_row) as conn:
        for stmt in statements(schema_sql):
            conn.execute(stmt)
        with conn.cursor() as cur:
            cur.executemany(
                """
                INSERT INTO dil_yazi_odevleri (dil, seviye, gun, prompt_tr, prompt_hedef)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (dil, seviye, gun)
                DO UPDATE SET
                  prompt_tr = EXCLUDED.prompt_tr,
                  prompt_hedef = EXCLUDED.prompt_hedef
                """,
                rows,
            )
        conn.execute("NOTIFY pgrst, 'reload schema'")
        totals = conn.execute(
            """
            SELECT dil, seviye, count(*)::int AS n
            FROM dil_yazi_odevleri
            GROUP BY 1, 2
            ORDER BY 1, 2
            """
        ).fetchall()
        cols = conn.execute(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'dil_yazi_odevleri'
            ORDER BY ordinal_position
            """
        ).fetchall()
        conn.commit()

    print("columns", [c["column_name"] for c in cols])
    print(f"wrote {SQL_EDITOR.name} ({len(rows)} rows)")
    print(f"seeded {len(rows)} curriculum rows")
    for t in totals:
        print(f"  {t['dil']} {t['seviye']}: {t['n']}")


if __name__ == "__main__":
    main()
