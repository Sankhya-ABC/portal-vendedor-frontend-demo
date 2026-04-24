import { normalizarEnderecosSankhya } from '@/pages/vendas/clienteDisplay'
import type { Cliente, ClienteConsultaCNPJForm, ClienteRequest } from '@/types'

async function mockDelay(): Promise<void> {
  await new Promise((r) => setTimeout(r, 80))
}

const MOCK_CLIENTES_BASE: Cliente[] = [
  {
    id: 1,
    codParc: 4,
    nome: "GAMA REPRESENTACOES LTDA",
    cgcCpf: "53759031000197",
    email: null,
    telefone: "(055) 112958-0013",
    cep: "03738190",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-09-27T12:00:00.000Z",
    nomeContato: "AURORA VAREJO",
    enderecoResumo: "PATRICIA 28 — VILA BELO HORIZONTE — Sao Paulo - SP",
    enderecoPadraoSankhya: "PATRICIA 28 — VILA BELO HORIZONTE — Sao Paulo - SP",
    enderecoFilialSankhya: "CD Galpão Sul — Av. das Nações Unidas, 10000 — Bloco B — São Paulo/SP",
    ultimaVenda: null,
    limiteCredito: 2000,
  },
  {
    id: 2,
    codParc: 5,
    nome: "CRISTIANE DE FATIMA FERNANDES SERRA",
    cgcCpf: "26027716000176",
    email: null,
    telefone: "(055) 114722-2022",
    cep: "08737240",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-09-27T12:00:00.000Z",
    nomeContato: "<SEM VENDEDOR>",
    enderecoResumo: "PEDRO RAMOS JULIO 245 — VILA SANTANA — Mogi das Cruzes - SP",
    ultimaVenda: null,
    limiteCredito: 2000,
  },
  {
    id: 3,
    codParc: 6,
    nome: "VANUSA SILVA",
    cgcCpf: "33831475000189",
    email: null,
    telefone: "(055) 119844-5497",
    cep: "04849060",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-09-27T12:00:00.000Z",
    nomeContato: "AURORA VAREJO",
    enderecoResumo: "BELMIRO HESSEL 342 — PARQUE RESIDENCIAL COCAIA — Sao Paulo - SP",
    ultimaVenda: null,
    limiteCredito: 2000,
  },
  {
    id: 4,
    codParc: 7,
    nome: "JD REPRESENTACAO COMERCIAL LTDA",
    cgcCpf: "33076671000195",
    email: null,
    telefone: "(055) 1199794-1235",
    cep: "08572280",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-09-27T12:00:00.000Z",
    nomeContato: "AURORA VAREJO",
    enderecoResumo: "PETRÓPOLIS 325 — VILA SAO ROBERTO — Itaquaquecetuba - SP",
    ultimaVenda: null,
    limiteCredito: 2000,
  },
  {
    id: 5,
    codParc: 9,
    nome: "GOUVEIA REPRESENTACOES EIRELI",
    cgcCpf: "05378274000132",
    email: null,
    telefone: "(055) 1199943-6602",
    cep: "08563220",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-09-27T12:00:00.000Z",
    nomeContato: "AURORA VAREJO",
    enderecoResumo: "OURINHOS 143 — JARDIM ESTELA — Poa - SP",
    ultimaVenda: null,
    limiteCredito: 2000,
  },
  {
    id: 6,
    codParc: 11,
    nome: "PIMENTA REPRESENTACOES",
    cgcCpf: "34073848000162",
    email: null,
    telefone: "(055) 114693-2197",
    cep: "08671415",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-09-27T12:00:00.000Z",
    nomeContato: "<SEM VENDEDOR>",
    enderecoResumo: "MITSUGO MATSUO 260 — JARDIM QUARESMEIRA II — Suzano - SP",
    ultimaVenda: null,
    limiteCredito: 2000,
  },
  {
    id: 7,
    codParc: 12,
    nome: "LUIZ PEREIRA DE MEDEIROS 56474873868",
    cgcCpf: "34178522000108",
    email: null,
    telefone: "(055) 1198161-2212",
    cep: "08275420",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-09-27T12:00:00.000Z",
    nomeContato: "AURORA VAREJO",
    enderecoResumo: "JOAO RIBEIRO DO VALE 246 — JARDIM NOSSA SENHORA DO CARMO — Sao Paulo - SP",
    ultimaVenda: null,
    limiteCredito: 2000,
  },
  {
    id: 8,
    codParc: 13,
    nome: "RENATO CORREA 18176825808",
    cgcCpf: "33987557000117",
    email: null,
    telefone: "(055) 1199162-7776",
    cep: "08275120",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-09-27T12:00:00.000Z",
    nomeContato: "<SEM VENDEDOR>",
    enderecoResumo: "ESTEVAO DIAS VERGARA 374A — JARDIM NOSSA SENHORA DO CARMO — Sao Paulo - SP",
    ultimaVenda: null,
    limiteCredito: 2000,
  },
  {
    id: 9,
    codParc: 14,
    nome: "CLAUDINEI APARECIDO PEREIRA 16606878888",
    cgcCpf: "28361692000112",
    email: null,
    telefone: "(055) 112303-7535",
    cep: "07242150",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-09-27T12:00:00.000Z",
    nomeContato: "<SEM VENDEDOR>",
    enderecoResumo: "SAO JOSE DA LAJE 1421 — CIDADE PARQUE ALVORADA — Guarulhos - SP",
    ultimaVenda: null,
    limiteCredito: 2000,
  },
  {
    id: 10,
    codParc: 15,
    nome: "DOMINGOS FRANCISCO DE SOUSA 00978526350",
    cgcCpf: "30771362000147",
    email: null,
    telefone: "(055) 1195845-3098",
    cep: "08525000",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-09-27T12:00:00.000Z",
    nomeContato: "AURORA VAREJO",
    enderecoResumo: "LUIZ ANTONIO DE PAIVA 157 — JARDIM IPANEMA — Ferraz de Vasconcelos - SP",
    ultimaVenda: null,
    limiteCredito: 2000,
  },
  {
    id: 11,
    codParc: 16,
    nome: "EHF REPRESENTACOES LTDA",
    cgcCpf: "03551463000130",
    email: null,
    telefone: "(055) 0198584-3108",
    cep: "09861420",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-09-27T12:00:00.000Z",
    nomeContato: "<SEM VENDEDOR>",
    enderecoResumo: "PERU 13 — JD. SANTO IGNACIO — SAO BERNARDO CAMPO   - SP",
    ultimaVenda: null,
    limiteCredito: 2000,
  },
  {
    id: 12,
    codParc: 17,
    nome: "SILVIA REGINA CONSTANTINO",
    cgcCpf: "30381663000164",
    email: null,
    telefone: "(055) 1198292-4731",
    cep: "03447000",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-09-27T12:00:00.000Z",
    nomeContato: "<SEM VENDEDOR>",
    enderecoResumo: "DOUTOR JACI BARBOSA 233 — VILA CARRAO — Sao Paulo - SP",
    ultimaVenda: null,
    limiteCredito: 2000,
  },
  {
    id: 13,
    codParc: 18,
    nome: "CAMILA PENHALBEL - ALCIDES PAULO",
    cgcCpf: "34029671000105",
    email: null,
    telefone: "(055) 1198668-7120",
    cep: "02259140",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-09-27T12:00:00.000Z",
    nomeContato: "<SEM VENDEDOR>",
    enderecoResumo: "UBAPORANGA 178 — VILA CONSTANCA — Sao Paulo - SP",
    ultimaVenda: null,
    limiteCredito: 2000,
  },
  {
    id: 14,
    codParc: 28,
    nome: "INDUSTRIA DE FRALDAS GBI LTDA",
    cgcCpf: "33697943000174",
    email: null,
    telefone: null,
    cep: "08655000",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-10-02T12:00:00.000Z",
    nomeContato: "AURORA VAREJO",
    enderecoResumo: "ÍNDIO TIBIRIÇÁ 4456 — VILA SOL NASCENTE — Suzano - SP",
    ultimaVenda: null,
    limiteCredito: 2000,
  },
  {
    id: 15,
    codParc: 30,
    nome: "DISTRIBUIDORA DE FRALDAS GBD LTDA",
    cgcCpf: "33703969000188",
    email: null,
    telefone: null,
    cep: "08587000",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-10-02T12:00:00.000Z",
    nomeContato: "AURORA VAREJO",
    enderecoResumo: "DOS ÍNDIOS 1550 — JARDIM AMANDA CAIUBI — Itaquaquecetuba - SP",
    ultimaVenda: null,
    limiteCredito: 2000,
  },
  {
    id: 16,
    codParc: 31,
    nome: "M. J. SOUZA NETO - FERNANDO SUL",
    cgcCpf: "30272415000185",
    email: null,
    telefone: "(055) 514042-3560",
    cep: "95575000",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-10-02T12:00:00.000Z",
    nomeContato: "<SEM VENDEDOR>",
    enderecoResumo: "MORRO DO CHAPEU 60 — MORRO DO CHAPEU — TRES FORQUILHAS      - RS",
    ultimaVenda: null,
    limiteCredito: 2000,
  },
  {
    id: 17,
    codParc: 33,
    nome: "MAXSERVICE LTDA",
    cgcCpf: "20331580000107",
    email: null,
    telefone: null,
    cep: "08970000",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-10-02T12:00:00.000Z",
    nomeContato: "AURORA VAREJO",
    enderecoResumo: "XV DE NOVEMBRO 646 — CENTRO — Salesopolis - SP",
    ultimaVenda: null,
    limiteCredito: 2000,
  },
  {
    id: 18,
    codParc: 61,
    nome: "EVA VILMA DIAS PEREIRA 05080771500",
    cgcCpf: "24609035000190",
    email: null,
    telefone: "(011) 96436-7746",
    cep: "08673170",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-10-24T12:00:00.000Z",
    nomeContato: "EDUARDO UNIÃO",
    enderecoResumo: "MEYER JOSEPH NIGRI 181 — CIDADE CRUZEIRO DO SUL — Suzano - SP",
    ultimaVenda: null,
    limiteCredito: 2000,
  },
  {
    id: 19,
    codParc: 62,
    nome: "FECHADO",
    cgcCpf: "15836532000211",
    email: null,
    telefone: null,
    cep: "04857040",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-10-24T12:00:00.000Z",
    nomeContato: "AURORA VAREJO",
    enderecoResumo: "HENRIQUE MUZZIO 450 — JARDIM VARGINHA — Sao Paulo - SP",
    ultimaVenda: null,
    limiteCredito: 2000,
  },
  {
    id: 20,
    codParc: 63,
    nome: "FARMA LESTE GUAIANASES LTDA",
    cgcCpf: "52457660000108",
    email: "xml.poupefacil1@gmail.com",
    telefone: "(011) 2552-8452",
    cep: "08451000",
    status: "Ativo",
    sincronizadoSankhya: true,
    criadoEm: "2019-10-24T12:00:00.000Z",
    nomeContato: "INÁCIO GOUVEIA",
    enderecoResumo: "DO LAGEADO VELHO 434 — GUAIANAZES — Sao Paulo - SP",
    ultimaVenda: null,
    limiteCredito: 5000,
  },
]

const MOCK_CLIENTES: Cliente[] = MOCK_CLIENTES_BASE.map(normalizarEnderecosSankhya)

/** Mapeia payload genérico de consulta por CNPJ para o formulário. */
function mapResponseToForm(res: unknown): ClienteConsultaCNPJForm {
  const r = res as Record<string, unknown>
  return {
    razaoSocial: (r.razaoSocial ?? r.razao_social ?? r.nome ?? '') as string,
    fantasia: (r.fantasia ?? r.nomeFantasia ?? r.nome_fantasia ?? '') as string,
    nomeContato: (r.nomeContato ?? r.nome_contato ?? r.contato ?? '') as string,
    email: (r.email ?? '') as string,
    telefoneComercial: (r.telefoneComercial ?? r.telefone ?? r.telefone_comercial ?? '') as string,
    celular: (r.celular ?? r.telefoneCelular ?? r.telefone_celular ?? '') as string,
    cep: (r.cep ?? '') as string,
    endereco: (r.endereco ?? r.logradouro ?? '') as string,
    numero: (r.numero ?? r.numeroEnd ?? '') as string,
    complemento: (r.complemento ?? '') as string,
    bairro: (r.bairro ?? r.district ?? '') as string,
    cidade: (r.cidade ?? r.city ?? r.municipality ?? r.municipio ?? '') as string,
    estado: (r.estado ?? r.uf ?? r.state ?? '') as string,
    segmento: (r.segmento ?? '') as string,
    ie: (r.ie ?? '') as string,
  }
}

const MOCK_CNPJ_RESPONSE = {
  razaoSocial: 'Sabor & Grãos Distribuidora LTDA',
  fantasia: 'Super Pan Brasil',
  nomeContato: 'Patrícia Souza',
  email: 'contato@saboregraos.com.br',
  telefone: '4130223344',
  celular: '41999991111',
  cep: '80530000',
  endereco: 'Rua das Flores',
  numero: '500',
  complemento: 'Sala 2',
  bairro: 'Batel',
  cidade: 'Curitiba',
  estado: 'PR',
  segmento: 'Varejo alimentar',
  ie: '1234567890',
}

export interface ListarClientesParams {
  busca?: string
  status?: string
}

let mockClienteIdSeq = 20

export const clienteService = {
  async listar(_token: string, params: ListarClientesParams = {}): Promise<Cliente[]> {
    await mockDelay()
    let data = [...MOCK_CLIENTES]

    if (params.busca) {
      const termo = params.busca.toLowerCase()
      data = data.filter(
        (c) =>
          c.nome?.toLowerCase().includes(termo) ||
          c.cgcCpf?.includes(params.busca!) ||
          c.email?.toLowerCase().includes(termo),
      )
    }
    if (params.status) {
      const st = params.status.toLowerCase()
      data = data.filter((c) => c.status?.toLowerCase() === st)
    }
    return data
  },

  /**
   * Consulta dados por CNPJ no backend (parceiros/buscar-por-cpf-cnpj) e retorna objeto para o formulário.
   * CNPJ pode ser com ou sem máscara; é enviado apenas dígitos no path.
   */
  async consultarPorCnpj(_token: string, cnpj: string): Promise<ClienteConsultaCNPJForm> {
    const apenasDigitos = cnpj.replace(/\D/g, '')
    if (!apenasDigitos) throw new Error('Informe o CNPJ')
    await mockDelay()
    return mapResponseToForm({ ...MOCK_CNPJ_RESPONSE })
  },

  async cadastrar(_token: string, request: ClienteRequest): Promise<{ sucesso: boolean; mensagem: string; codParc?: number; sincronizadoSankhya?: boolean; avisoSankhya?: string }> {
    await mockDelay()
    mockClienteIdSeq += 1
    const codParc = 200000 + mockClienteIdSeq
    MOCK_CLIENTES.push(
      normalizarEnderecosSankhya({
        id: mockClienteIdSeq,
        codParc,
        nome: request.cliente.razaoSocial,
        cgcCpf: request.cliente.cnpjCpf.replace(/\D/g, ''),
        email: request.cliente.email || null,
        telefone: request.cliente.telefone || null,
        cep: request.endereco.cep || null,
        status: 'Ativo',
        sincronizadoSankhya: true,
        criadoEm: new Date().toISOString(),
        nomeContato: request.cliente.nomeContato || null,
        enderecoResumo: [request.endereco.endereco, request.endereco.cidade, request.endereco.estado]
          .filter(Boolean)
          .join(' — ') || null,
      }),
    )
    return {
      sucesso: true,
      mensagem: 'Cliente cadastrado com sucesso! Ele já aparece na sua lista e está vinculado ao Sankhya.',
      codParc,
      sincronizadoSankhya: true,
    }
  },

  async excluir(_token: string, id: number): Promise<void> {
    await mockDelay()
    const idx = MOCK_CLIENTES.findIndex((c) => c.id === id)
    if (idx >= 0) MOCK_CLIENTES.splice(idx, 1)
  },

  /**
   * Sincroniza parceiros do Sankhya com o banco local.
   * Retorna total, inseridos, atualizados.
   */
  async sincronizar(_token: string): Promise<{ sucesso: boolean; mensagem: string; total?: number; inseridos?: number; atualizados?: number }> {
    await mockDelay()
    const total = MOCK_CLIENTES.length
    const pendentes = MOCK_CLIENTES.filter((c) => !c.sincronizadoSankhya)
    let inseridos = 0

    for (const c of MOCK_CLIENTES) {
      if (!c.sincronizadoSankhya) {
        if (c.codParc == null) {
          c.codParc = 300_000 + c.id
          inseridos += 1
        }
        c.sincronizadoSankhya = true
      }
    }

    const mensagem =
      pendentes.length > 0
        ? `Sincronização com o Sankhya concluída.\n\n${pendentes.length} parceiro(es) pendente(s) foram alinhados ao ERP (${inseridos} novo(s) vínculo de código). Total na lista: ${total}.`
        : `Tudo certo com o Sankhya.\n\nForam conferidos ${total} parceiro(es) e não havia pendências: sua base já estava atualizada.`

    return {
      sucesso: true,
      mensagem,
      total,
      inseridos,
      atualizados: pendentes.length,
    }
  },
}
