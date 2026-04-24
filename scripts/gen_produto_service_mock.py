"""Gera src/services/produtoService.ts a partir de Produto.xls (até 25 produtos distintos)."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import xlrd

ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "src" / "services" / "produtoService.ts"
DEFAULT_XLS = Path.home() / "Downloads" / "Produto.xls"
MAX_PRODUTOS = 25


def codigos_ja_no_servico() -> set[int]:
    """Lê os CODPROD já mockados em produtoService.ts para não repetir na próxima leva."""
    if not OUT_PATH.is_file():
        return set()
    ts = OUT_PATH.read_text(encoding="utf-8")
    return {int(m.group(1)) for m in re.finditer(r"codProd:\s*(\d+)", ts)}


def esc(s: str | None) -> str:
    if s is None:
        return "null"
    return json.dumps(s, ensure_ascii=False)


def load_rows_from_xls(xls_path: Path) -> list[dict]:
    """Planilha inteira → únicos por código + descrição → até MAX não presentes no TS atual."""
    wb = xlrd.open_workbook(str(xls_path))
    sh = wb.sheet_by_index(0)
    rows_out: list[dict] = []
    for r in range(3, sh.nrows):
        def gv(c: int) -> object:
            return sh.cell_value(r, c)

        raw_cod = gv(4)
        if raw_cod == "":
            continue
        cod = int(raw_cod) if isinstance(raw_cod, float) and raw_cod == int(raw_cod) else int(float(raw_cod))
        if cod == 0:
            continue
        rows_out.append(
            {
                "cod": cod,
                "desc": str(gv(5)).strip(),
                "peso_bruto": float(gv(1)) if gv(1) != "" else 0.0,
                "peso_liq": float(gv(0)) if gv(0) != "" else 0.0,
                "un": str(gv(8)).strip() or "UN",
                "ativo": str(gv(9)).strip(),
                "grupo": str(gv(10)).strip(),
                "subgrupo": str(gv(11)).strip() or None,
                "ncm": str(gv(13)).strip() or None,
                "custo": gv(6),
                "fabricante": str(gv(25)).strip() or None,
            }
        )

    # 1) Distintos na planilha: primeira ocorrência por código, depois por descrição
    seen_cod_sheet: set[int] = set()
    seen_desc_sheet: set[str] = set()
    unicos_planilha: list[dict] = []
    for row in rows_out:
        if not row["desc"]:
            continue
        cod = row["cod"]
        if cod in seen_cod_sheet:
            continue
        dk = row["desc"].upper()
        if dk in seen_desc_sheet:
            continue
        seen_cod_sheet.add(cod)
        seen_desc_sheet.add(dk)
        unicos_planilha.append(row)

    excluir = codigos_ja_no_servico()

    # 2) Preferir produtos que ainda não estão no mock atual (ordem do arquivo)
    candidatos = [row for row in unicos_planilha if row["cod"] not in excluir]
    picked: list[dict] = []
    seen_pick_cod: set[int] = set()
    seen_pick_desc: set[str] = set()
    for row in candidatos:
        dk = row["desc"].upper()
        if row["cod"] in seen_pick_cod or dk in seen_pick_desc:
            continue
        seen_pick_cod.add(row["cod"])
        seen_pick_desc.add(dk)
        picked.append(row)
        if len(picked) >= MAX_PRODUTOS:
            break

    # 3) Se faltar (planilha pequena ou tudo já listado), completa com itens ainda não escolhidos
    if len(picked) < MAX_PRODUTOS:
        for row in unicos_planilha:
            if len(picked) >= MAX_PRODUTOS:
                break
            dk = row["desc"].upper()
            if row["cod"] in seen_pick_cod or dk in seen_pick_desc:
                continue
            seen_pick_cod.add(row["cod"])
            seen_pick_desc.add(dk)
            picked.append(row)

    return picked[:MAX_PRODUTOS]


def main() -> None:
    xls = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_XLS
    if not xls.is_file():
        print(f"Arquivo não encontrado: {xls}", file=sys.stderr)
        sys.exit(1)
    data = load_rows_from_xls(xls)
    blocks: list[str] = []
    for i, row in enumerate(data, 1):
        custo = row["custo"]
        if isinstance(custo, (int, float)) and 0 < custo < 1_000_000:
            base = float(custo)
        else:
            base = 12 + (int(row["cod"]) % 55) * 0.9 + min(float(row["peso_bruto"] or 0), 25) * 0.8
        psv = round(base * 1.15, 2)
        pmv = round(psv * 1.08, 2)
        puv = round(psv * 1.03, 2)
        pb = row["peso_bruto"]
        peso_js = "null" if not pb or pb == 0 else repr(float(pb))
        fab = row["fabricante"]
        marca_line = f"    marca: {esc(fab)},\n" if fab else ""
        ativo = "true" if str(row["ativo"]).lower() == "sim" else "false"
        sync = "true" if i % 4 != 0 else "false"
        est = 80 + (int(row["cod"]) % 400) * 2
        cod = int(row["cod"])
        sub = row["subgrupo"]
        sub_line = f"    subgrupo: {esc(sub)},\n" if sub else ""
        b = f"""  {{
    id: {i},
    nome: {esc(row['desc'])},
    grupo: {esc(row['grupo'])},
    un: {esc(row['un'])},
    codProd: {cod},
    referencia: {esc(row['ncm'] or '')},
{marca_line}    ativo: {ativo},
    pesoBruto: {peso_js},
{sub_line}    codigo: {esc(str(cod))},
    psv: {psv},
    pmv: {pmv},
    puv: {puv},
    estoque: {est},
    sincronizadoSankhya: {sync},
  }},"""
        blocks.append(b)

    head = """import type { Produto } from '@/types'

async function mockDelay(): Promise<void> {
  await new Promise((r) => setTimeout(r, 80))
}

/** Catálogo mock: até 25 produtos distintos (código + descrição) a partir de Produto.xls — sem repetir itens já listados no arquivo. */
const MOCK_PRODUTOS: Produto[] = [
"""

    tail = """
]

export interface ListarProdutosParams {
  busca?: string
}

export const produtoService = {
  async listar(_token: string, params: ListarProdutosParams = {}): Promise<Produto[]> {
    await mockDelay()
    let data = [...MOCK_PRODUTOS]

    if (params.busca) {
      const termo = params.busca.toLowerCase()
      data = data.filter(
        (p) =>
          p.nome?.toLowerCase().includes(termo) ||
          (p.codProd != null && String(p.codProd).includes(params.busca!)) ||
          p.grupo?.toLowerCase().includes(termo),
      )
    }
    return data
  },

  async sincronizar(_token: string): Promise<{ sucesso: boolean; mensagem: string; total?: number; inseridos?: number; atualizados?: number }> {
    await mockDelay()
    const total = MOCK_PRODUTOS.length
    const pendentes = MOCK_PRODUTOS.filter((p) => !p.sincronizadoSankhya)
    for (const p of MOCK_PRODUTOS) {
      p.sincronizadoSankhya = true
    }

    const mensagem =
      pendentes.length > 0
        ? `Catálogo sincronizado com o Sankhya.\\n\\n${pendentes.length} produto(s) receberam confirmação do ERP; os demais já estavam alinhados. Total de ${total} itens na lista.`
        : `Catálogo conferido.\\n\\nTodos os ${total} produto(s) já estavam sincronizados com o Sankhya — nada pendente.`

    return {
      sucesso: true,
      mensagem,
      total,
      inseridos: pendentes.length,
      atualizados: total,
    }
  },
}
"""
    content = head + "\n".join(blocks) + tail
    OUT_PATH.write_text(content, encoding="utf-8")
    print(f"Wrote {OUT_PATH} ({len(data)} produtos)")


if __name__ == "__main__":
    main()
