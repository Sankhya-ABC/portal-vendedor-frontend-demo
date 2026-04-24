import { PageHeader } from '@/components/ui'
import { ROUTES } from '@/constants'
import { useAuth } from '@/contexts/AuthContext'
import { clienteService } from '@/services'
import type { ClienteRequest } from '@/types'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function NovoClientePage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [cnpj, setCnpj] = useState('')
  const [consultando, setConsultando] = useState(false)
  const [erroConsulta, setErroConsulta] = useState('')
  const [consultaOk, setConsultaOk] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erroSalvar, setErroSalvar] = useState('')
  const [sucesso, setSucesso] = useState('')

  const [razaoSocial, setRazaoSocial] = useState('')
  const [fantasia, setFantasia] = useState('')
  const [nomeContato, setNomeContato] = useState('')
  const [email, setEmail] = useState('')
  const [telefoneComercial, setTelefoneComercial] = useState('')
  const [celular, setCelular] = useState('')
  const [ie, setIe] = useState('')
  const [segmento, setSegmento] = useState('')

  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')

  const [origem, setOrigem] = useState('')
  const [jaEraCliente, setJaEraCliente] = useState('')
  const [condicoesPagamento, setCondicoesPagamento] = useState<'avista' | 'aprazo' | ''>('')
  const [horario, setHorario] = useState('')
  const [turno, setTurno] = useState<'diurno' | 'noturno' | ''>('')
  const [diasSemana, setDiasSemana] = useState({
    segunda: false,
    terca: false,
    quarta: false,
    quinta: false,
    sexta: false,
    sabado: false,
  })

  const toggleDia = (dia: keyof typeof diasSemana) => {
    setDiasSemana((prev) => ({ ...prev, [dia]: !prev[dia] }))
  }

  const handleConsultarCnpj = async () => {
    if (!token) return
    setErroConsulta('')
    setConsultaOk('')
    setConsultando(true)
    try {
      const dados = await clienteService.consultarPorCnpj(token, cnpj)
      setRazaoSocial(dados.razaoSocial ?? '')
      setFantasia(dados.fantasia ?? '')
      setNomeContato(dados.nomeContato ?? '')
      setEmail(dados.email ?? '')
      setTelefoneComercial(dados.telefoneComercial ?? '')
      setCelular(dados.celular ?? '')
      setCep(dados.cep ?? '')
      setEndereco(dados.endereco ?? '')
      setNumero(dados.numero ?? '')
      setComplemento(dados.complemento ?? '')
      setBairro(dados.bairro ?? '')
      setCidade(dados.cidade ?? '')
      setEstado(dados.estado ?? '')
      setSegmento(dados.segmento ?? '')
      setIe(dados.ie ?? '')
      setConsultaOk('Dados do CNPJ localizados e preenchidos automaticamente no formulário.')
    } catch (err) {
      setErroConsulta(err instanceof Error ? err.message : 'Erro ao consultar CNPJ')
    } finally {
      setConsultando(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    if (!cnpj.trim() || !razaoSocial.trim()) {
      setErroSalvar('CNPJ e Razão Social são obrigatórios')
      return
    }

    setErroSalvar('')
    setSucesso('')
    setSalvando(true)
    try {
      const request: ClienteRequest = {
        cliente: {
          cnpjCpf: cnpj,
          razaoSocial,
          fantasia,
          nomeContato,
          ie,
          segmento,
          email,
          telefone: telefoneComercial || celular,
        },
        endereco: {
          cep,
          endereco,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
          referencia: '',
          municipio: cidade,
        },
        complemento: {
          condicoesPagamento:
            condicoesPagamento === 'avista' ? 'À vista' : condicoesPagamento === 'aprazo' ? 'À prazo' : '',
          diasDisponiveis: diasSemana,
          turno,
          horario,
        },
        origemCliente: {
          origem,
          jaEraCliente,
          empresaAnterior: '',
          informacoesAdicionais: '',
        },
        observacoesGerais: '',
      }

      const resultado = await clienteService.cadastrar(token, request)
      const msg =
        resultado.mensagem ||
        (resultado.sincronizadoSankhya
          ? 'Parceiro cadastrado com sucesso!'
          : `Parceiro salvo.${resultado.avisoSankhya ? ` ${resultado.avisoSankhya}` : ''}`)
      setSucesso(msg)
      setTimeout(() => navigate(ROUTES.CLIENTES), 3000)
    } catch (err) {
      setErroSalvar(err instanceof Error ? err.message : 'Erro ao cadastrar cliente')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <Link
          to={ROUTES.CLIENTES}
          className="flex items-center gap-1 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Novo Cliente" description="Preencha os dados e conclua o cadastro" />
      </div>

      {consultaOk && !sucesso ? (
        <div className="flex items-center gap-3 rounded-lg border border-primary-200 bg-primary-50/80 p-4 shadow-sm">
          <svg className="h-6 w-6 flex-shrink-0 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-primary-900">{consultaOk}</p>
        </div>
      ) : null}

      {sucesso && (
        <div className="flex items-center gap-3 rounded-lg border border-green-300 bg-green-50 p-4 shadow-sm">
          <svg className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold text-green-800">{sucesso}</p>
            <p className="mt-0.5 text-sm text-green-600">Redirecionando para a lista de clientes...</p>
          </div>
        </div>
      )}
      {erroSalvar && (
        <div className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-4 shadow-sm">
          <svg className="h-6 w-6 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div>
            <p className="font-semibold text-red-800">Erro ao cadastrar</p>
            <p className="mt-0.5 text-sm text-red-600">{erroSalvar}</p>
          </div>
        </div>
      )}

      <form className="space-y-8" onSubmit={handleSubmit}>
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-800">Cliente</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
              <input
                type="text"
                placeholder="CNPJ (apenas números ou com máscara)"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={handleConsultarCnpj}
                disabled={consultando || !cnpj.trim()}
                className="w-full rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50 sm:w-auto"
              >
                {consultando ? 'Consultando...' : 'Consultar CNPJ'}
              </button>
            </div>
            {erroConsulta && (
              <p className="text-sm text-red-500 sm:col-span-2">{erroConsulta}</p>
            )}
            <input
              type="text"
              placeholder="Razão Social"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="Fantasia"
              value={fantasia}
              onChange={(e) => setFantasia(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="Nome do Contato"
              value={nomeContato}
              onChange={(e) => setNomeContato(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <input
              type="tel"
              placeholder="Telefone Comercial"
              value={telefoneComercial}
              onChange={(e) => setTelefoneComercial(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <input
              type="tel"
              placeholder="Celular"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="I.E."
              value={ie}
              onChange={(e) => setIe(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="Segmento"
              value={segmento}
              onChange={(e) => setSegmento(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-800">Endereço</h2>
          <div className="mt-4 space-y-4">
            <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
              <input
                type="text"
                placeholder="CEP"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button
                type="button"
                className="w-full rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 sm:w-auto"
              >
                Preencher endereço
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Endereço"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Número"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Complemento"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Referência"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Município"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-800">Complemento</h2>
          <div className="mt-4 space-y-5">
            <div>
              <span className="mb-1.5 block text-sm font-medium text-slate-600">Condições de pagto.</span>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Condições de pagamento">
                {(
                  [
                    { id: 'avista' as const, label: 'À vista' },
                    { id: 'aprazo' as const, label: 'À prazo' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={condicoesPagamento === opt.id}
                    onClick={() =>
                      setCondicoesPagamento((prev) => (prev === opt.id ? '' : opt.id))
                    }
                    className={`rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                      condicoesPagamento === opt.id
                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'segunda' as const, label: 'Segunda' },
                  { id: 'terca' as const, label: 'Terça' },
                  { id: 'quarta' as const, label: 'Quarta' },
                  { id: 'quinta' as const, label: 'Quinta' },
                  { id: 'sexta' as const, label: 'Sexta' },
                  { id: 'sabado' as const, label: 'Sábado' },
                ].map((dia) => (
                  <button
                    key={dia.id}
                    type="button"
                    onClick={() => toggleDia(dia.id)}
                    className={`rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                      diasSemana[dia.id]
                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {dia.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
              <div className="min-w-0">
                <span className="mb-1.5 block text-sm font-medium text-slate-600">Turno</span>
                <div
                  className="flex min-h-[42px] flex-wrap items-center gap-x-4 gap-y-2"
                  role="radiogroup"
                  aria-label="Turno"
                >
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="turno-visita"
                      value="diurno"
                      checked={turno === 'diurno'}
                      onChange={() => setTurno('diurno')}
                      className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    Diurno
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="turno-visita"
                      value="noturno"
                      checked={turno === 'noturno'}
                      onChange={() => setTurno('noturno')}
                      className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    Noturno
                  </label>
                </div>
              </div>
              <div className="min-w-0 sm:max-w-[11rem]">
                <label htmlFor="horario-complemento" className="mb-1.5 block text-sm font-medium text-slate-600">
                  Horário
                </label>
                <div className="flex min-h-[42px] items-center">
                  <input
                    id="horario-complemento"
                    type="time"
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-800">Origem do cliente</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Como ele nos conheceu?
              </label>
              <select
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Selecione</option>
                <option value="prospectado">Cliente prospectado</option>
                <option value="indicacao">Indicação</option>
                <option value="visita">Visita</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Já era seu cliente anteriormente?
              </label>
              <select
                value={jaEraCliente}
                onChange={(e) => setJaEraCliente(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Selecione</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Qual empresa ele comprava com você?
              </label>
               <input
              type="text"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Informações adicionais
              </label>
              <textarea
                rows={4}
                placeholder="Qualquer dado que possa auxiliar em nossa análise."
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-800">Observações gerais</h2>
          <div className="mt-4 space-y-4">
              <textarea
                rows={4}
                placeholder="Observações gerais sobre o cliente."
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              /> 
          </div>
        </section>
        
        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Link to={ROUTES.CLIENTES} className="w-full sm:w-auto">
            <button
              type="button"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
            >
              Cancelar
            </button>
          </Link>
          <button
            type="submit"
            disabled={salvando}
            className="w-full rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50 sm:w-auto"
          >
            {salvando ? 'Salvando...' : 'Concluir cadastro'}
          </button>
        </div>
      </form>
    </div>
  )
}
