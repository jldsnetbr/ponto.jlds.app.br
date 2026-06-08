import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useConfiguracoes, useAtualizarConfiguracoes } from '@/hooks/useConfiguracoes';
import { useFeriados, useAdicionarFeriado, useRemoverFeriado } from '@/hooks/useFeriados';
import { useAutenticacao } from '@/hooks/useAutenticacao';
import { useToast, Card, Button, Input, TimePicker, Spinner } from '@/components/ui';
import { requestNotificationPermission } from '@/lib/notificacoes';
import { calcularJornada } from '@/lib/calculos';

const diasLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function SettingsPage() {
  const { data: config, isLoading } = useConfiguracoes();
  const mutation = useAtualizarConfiguracoes();
  const { data: feriados } = useFeriados();
  const addFeriado = useAdicionarFeriado();
  const delFeriado = useRemoverFeriado();
  const { sair } = useAutenticacao();
  const { showToast } = useToast();

  const [inicioExpediente, setInicioExpediente] = useState('08:00');
  const [fimExpediente, setFimExpediente] = useState('17:00');
  const [almocoInicio, setAlmocoInicio] = useState('12:00');
  const [almocoFim, setAlmocoFim] = useState('13:00');
  const [diasTrabalho, setDiasTrabalho] = useState<number[]>([1, 2, 3, 4, 5]);
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(false);
  const [notificacaoHorario, setNotificacaoHorario] = useState('07:30');
  const [novoFeriadoData, setNovoFeriadoData] = useState('');
  const [novoFeriadoNome, setNovoFeriadoNome] = useState('');
  const [showAddFeriado, setShowAddFeriado] = useState(false);

  useEffect(() => {
    if (config) {
      setInicioExpediente(config.inicio_expediente.slice(0, 5));
      setFimExpediente(config.fim_expediente.slice(0, 5));
      setAlmocoInicio(config.almoco_inicio.slice(0, 5));
      setAlmocoFim(config.almoco_fim.slice(0, 5));
      setDiasTrabalho(config.dias_trabalho as number[]);
      setNotificacoesAtivas(config.notificacoes_ativas);
      setNotificacaoHorario(config.notificacao_horario.slice(0, 5));
    }
  }, [config]);

  const handleSalvar = () => {
    const jornadaMinutos = calcularJornada(inicioExpediente, fimExpediente, almocoInicio, almocoFim);

    mutation.mutate(
      {
        inicio_expediente: inicioExpediente,
        fim_expediente: fimExpediente,
        almoco_inicio: almocoInicio,
        almoco_fim: almocoFim,
        dias_trabalho: diasTrabalho,
        notificacoes_ativas: notificacoesAtivas,
        notificacao_horario: notificacaoHorario,
        jornada_minutos: jornadaMinutos,
      },
      {
        onSuccess: () => showToast('Configurações salvas', 'success'),
        onError: () => showToast('Erro ao salvar configurações', 'error'),
      }
    );
  };

  const toggleDia = (dia: number) => {
    setDiasTrabalho((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const handleToggleNotificacoes = async () => {
    if (!notificacoesAtivas) {
      const granted = await requestNotificationPermission();
      if (!granted) { showToast('Permissão de notificação negada', 'error'); return; }
    }
    setNotificacoesAtivas(!notificacoesAtivas);
  };

  const handleAddFeriado = () => {
    if (!novoFeriadoData || !novoFeriadoNome.trim()) return;
    addFeriado.mutate(
      { data: novoFeriadoData, nome: novoFeriadoNome },
      {
        onSuccess: () => { showToast('Feriado adicionado', 'success'); setNovoFeriadoData(''); setNovoFeriadoNome(''); setShowAddFeriado(false); },
        onError: () => showToast('Erro ao adicionar feriado', 'error'),
      }
    );
  };

  const feriadosPessoais = (feriados || []).filter((h) => h.usuario_id !== null);
  const feriadosNacionais = (feriados || []).filter((h) => h.usuario_id === null);

  if (isLoading) return <Spinner />;

  return (
    <div className="flex flex-col gap-6 p-4 pb-8">
      <Card className="flex flex-col gap-4">
        <h3 className="text-base font-semibold text-gray-900">Horários</h3>
        <div className="grid grid-cols-2 gap-3">
          <TimePicker label="Entrada" value={inicioExpediente} onChange={setInicioExpediente} />
          <TimePicker label="Saída" value={fimExpediente} onChange={setFimExpediente} />
          <TimePicker label="Início Almoço" value={almocoInicio} onChange={setAlmocoInicio} />
          <TimePicker label="Fim Almoço" value={almocoFim} onChange={setAlmocoFim} />
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-gray-900">Dias Trabalhados</h3>
        <div className="flex flex-wrap gap-2">
          {diasLabels.map((label, index) => (
            <button
              key={index}
              onClick={() => toggleDia(index)}
              className={`px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] min-w-[44px] transition-colors ${
                diasTrabalho.includes(index) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-gray-900">Notificações</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Ativar notificações</span>
          <button
            onClick={handleToggleNotificacoes}
            className={`w-12 h-7 rounded-full transition-colors ${notificacoesAtivas ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notificacoesAtivas ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        {notificacoesAtivas && (
          <TimePicker label="Horário do lembrete" value={notificacaoHorario} onChange={setNotificacaoHorario} />
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Feriados</h3>
          <button onClick={() => setShowAddFeriado(!showAddFeriado)} className="text-blue-500 text-sm font-medium min-h-[44px] min-w-[44px] flex items-center justify-center">
            + Adicionar
          </button>
        </div>

        {showAddFeriado && (
          <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg">
            <Input label="Data" type="date" value={novoFeriadoData} onChange={(e) => setNovoFeriadoData(e.target.value)} />
            <Input label="Nome" type="text" value={novoFeriadoNome} onChange={(e) => setNovoFeriadoNome(e.target.value)} placeholder="Ex: Aniversário da cidade" />
            <Button size="sm" onClick={handleAddFeriado} disabled={!novoFeriadoData || !novoFeriadoNome.trim()}>
              Adicionar
            </Button>
          </div>
        )}

        {feriadosNacionais.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-gray-500 uppercase">Nacionais</p>
            {feriadosNacionais.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700">{dayjs(h.data).format('DD/MM')} - {h.nome}</span>
              </div>
            ))}
          </div>
        )}

        {feriadosPessoais.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-gray-500 uppercase">Personalizados</p>
            {feriadosPessoais.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700">{dayjs(h.data).format('DD/MM')} - {h.nome}</span>
                <button onClick={() => delFeriado.mutate(h.id)} className="text-red-500 text-sm min-h-[44px] min-w-[44px] flex items-center justify-center">
                  Excluir
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Button onClick={handleSalvar} fullWidth disabled={mutation.isPending}>
        {mutation.isPending ? 'Salvando...' : 'Salvar configurações'}
      </Button>

      <button onClick={sair} className="text-center text-red-500 font-medium py-3 min-h-[44px]">
        Sair
      </button>
    </div>
  );
}