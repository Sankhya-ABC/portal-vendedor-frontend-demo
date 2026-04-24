"""Gera o array MOCK_CLIENTES em src/services/clienteService.ts a partir de Parceiro.xls."""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime
from pathlib import Path

import xlrd

ROOT = Path(__file__).resolve().parents[1]
SERVICE_PATH = ROOT / "src" / "services" / "clienteService.ts"
DEFAULT_XLS = Path.home() / "Downloads" / "Parceiro.xls"
MIN_CLIENTES = 15
DATA_START_ROW = 3
HEADER_ROW = 2


def esc(s: str | None) -> str:
    if s is None:
        return "null"
    return json.dumps(s, ensure_ascii=False)


def cell_str(sh: xlrd.sheet.Sheet, r: int, c: int) -> str:
    v = sh.cell_value(r, c)
    if v == "":
        return ""
    if isinstance(v, float) and v == int(v):
        # CEP / IE numéricos na planilha
        if c == 15:  # CEP
            return f"{int(v):08d}"
        return str(int(v))
    return str(v).strip()


def only_digits(s: str) -> str:
    return re.sub(r"\D", "", s)


def parse_criado_em(book: xlrd.book.Book, sh: xlrd.sheet.Sheet, r: int, c: int) -> str:
    v = sh.cell_value(r, c)
    if isinstance(v, (int, float)) and v:
        try:
            t = xlrd.xldate_as_tuple(v, book.datemode)
            dt = datetime(t[0], t[1], t[2])
            return dt.strftime("%Y-%m-%dT12:00:00.000Z")
        except xlrd.XLDateError:
            pass
    return "2026-01-15T12:00:00.000Z"


def map_status(ativo_raw: str) -> str:
    t = ativo_raw.strip().lower()
    if "sim" in t or t == "s":
        return "Ativo"
    if "no" in t or t == "n":  # Não / Nao
        return "Inativo"
    return "Ativo"


def endereco_resumo(sh: xlrd.sheet.Sheet, r: int) -> str | None:
    logr = cell_str(sh, r, 17)
    num = cell_str(sh, r, 18)
    bairro = cell_str(sh, r, 21)
    cidade_uf = cell_str(sh, r, 34)
    parts = []
    if logr or num:
        parts.append(" ".join(x for x in [logr, num] if x).strip())
    if bairro:
        parts.append(bairro)
    if cidade_uf:
        parts.append(cidade_uf)
    s = " — ".join(parts) if parts else None
    return s or None


def load_clientes(xls_path: Path) -> list[dict]:
    wb = xlrd.open_workbook(str(xls_path))
    sh = wb.sheet_by_index(0)
    out: list[dict] = []
    seen_cod: set[int] = set()

    for r in range(DATA_START_ROW, sh.nrows):
        raw_cod = sh.cell_value(r, 3)
        if raw_cod == "":
            continue
        cod_parc = int(raw_cod) if isinstance(raw_cod, float) else int(raw_cod)
        if cod_parc <= 0 or cod_parc in seen_cod:
            continue

        nome = cell_str(sh, r, 5) or cell_str(sh, r, 9)
        if not nome:
            continue

        cnpj_raw = cell_str(sh, r, 11)
        digits = only_digits(cnpj_raw)
        if len(digits) not in (11, 14):
            continue

        seen_cod.add(cod_parc)
        email = cell_str(sh, r, 28)
        tel = cell_str(sh, r, 25)
        cep = cell_str(sh, r, 15) or None
        if cep == "":
            cep = None

        limite_raw = sh.cell_value(r, 2)
        limite: float | None
        if limite_raw == "":
            limite = None
        else:
            limite = float(limite_raw)

        out.append(
            {
                "codParc": cod_parc,
                "nome": nome,
                "cgcCpf": digits,
                "email": email or None,
                "telefone": tel or None,
                "cep": cep,
                "status": map_status(cell_str(sh, r, 13)),
                "criadoEm": parse_criado_em(wb, sh, r, 4),
                "nomeContato": cell_str(sh, r, 8) or None,
                "enderecoResumo": endereco_resumo(sh, r),
                "limiteCredito": int(limite) if limite is not None and limite == int(limite) else limite,
            }
        )
        if len(out) >= max(MIN_CLIENTES, 20):
            break

    return out


def inject_mock_clientes(ts: str, inner: str) -> str:
    m = re.search(r"const MOCK_CLIENTES: Cliente\[\] = \[", ts)
    if not m:
        raise SystemExit("Marcador MOCK_CLIENTES não encontrado em clienteService.ts")
    open_bracket = m.end() - 1  # índice do '['
    depth = 0
    i = open_bracket
    while i < len(ts):
        if ts[i] == "[":
            depth += 1
        elif ts[i] == "]":
            depth -= 1
            if depth == 0:
                # Mantém '[' e ']' do array; substitui só o conteúdo interno
                return ts[: open_bracket + 1] + inner + ts[i:]
        i += 1
    raise SystemExit("Fechamento do array MOCK_CLIENTES não encontrado")


def main() -> None:
    xls = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_XLS
    if not xls.is_file():
        raise SystemExit(f"Arquivo não encontrado: {xls}")

    rows = load_clientes(xls)
    if len(rows) < MIN_CLIENTES:
        raise SystemExit(f"Poucos clientes válidos na planilha: {len(rows)} (mínimo {MIN_CLIENTES})")

    lines: list[str] = []
    for idx, row in enumerate(rows, start=1):
        lim = row["limiteCredito"]
        lim_js = "null" if lim is None else str(int(lim)) if isinstance(lim, int) else str(lim)
        nc = esc(row["nomeContato"]) if row["nomeContato"] else "null"
        er = esc(row["enderecoResumo"]) if row["enderecoResumo"] else "null"
        lines.append("  {\n")
        lines.append(f"    id: {idx},\n")
        lines.append(f"    codParc: {row['codParc']},\n")
        lines.append(f"    nome: {esc(row['nome'])},\n")
        lines.append(f"    cgcCpf: {esc(row['cgcCpf'])},\n")
        lines.append(f"    email: {esc(row['email'])},\n")
        lines.append(f"    telefone: {esc(row['telefone'])},\n")
        lines.append(f"    cep: {esc(row['cep'])},\n")
        lines.append(f"    status: {esc(row['status'])},\n")
        lines.append("    sincronizadoSankhya: true,\n")
        lines.append(f"    criadoEm: {esc(row['criadoEm'])},\n")
        lines.append(f"    nomeContato: {nc},\n")
        lines.append(f"    enderecoResumo: {er},\n")
        lines.append("    ultimaVenda: null,\n")
        lines.append(f"    limiteCredito: {lim_js},\n")
        lines.append("  },\n")
    inner = "\n" + "".join(lines)

    src = SERVICE_PATH.read_text(encoding="utf-8")
    new_src = inject_mock_clientes(src, inner)
    new_src = re.sub(
        r"let mockClienteIdSeq = MOCK_CLIENTES\.length",
        f"let mockClienteIdSeq = {len(rows)}",
        new_src,
        count=1,
    )
    SERVICE_PATH.write_text(new_src, encoding="utf-8")
    print(f"Wrote {SERVICE_PATH} ({len(rows)} clientes de {xls})")


if __name__ == "__main__":
    main()
