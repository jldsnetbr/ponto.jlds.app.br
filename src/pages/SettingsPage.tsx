import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useConfiguracoes, useAtualizarConfiguracoes } from '@/hooks/useConfiguracoes';
import { useFeriados, useAdicionarFeriado, useRemoverFeriado } from '@/hooks/useFeriados';
import { useLocais, useAdicionarLocal, useRemoverLocal } from '@/hooks/useLocais';
import { useAutenticacao } from '@/hooks/useAutenticacao';
import { useToast, Card, Button, Input, TimePicker, Spinner } from '@/components/ui';
import { requestNotificationPermission } from '@/lib/notificacoes';
import { subscribeToPush, unsubscribeFromPush } from '@/lib/push';
import { calcularJornada } from '@/lib/calculos';

const diasLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const coresLocais = ['#7c3aed', '#059669', '#d97706', '#dc2626', '#2563eb', '#9333ea'];

export function SettingsPage() {
  const { data: config, isLoading } = useConfiguracoes();
  const mutation = useAtualizarConfiguracoes();
  const { data: feriados } = useFeriados();
  const addFeriado = useAdicionarFeriado();
  const delFeriado = useRemoverFeriado();
  const { data: locais } = useLocais();
  const addLocal = useAdicionarLocal();
  const delLocal = useRemoverLocal();
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
  const [novoLocalNome, setNovoLocalNome] = useState('');
  const [novoLocalCor, setNovoLocalCor] = useState(coresLocais[0]);
  const [showAddLocal, setShowAddLocal] = useState(false);

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

  const [pushSupported, setPushSupported] = useState(true);

  useEffect(() => {
    setPushSupported('serviceWorker' in navigator && 'PushManager' in window);
  }, []);

  const handleToggleNotificacoes = async () => {
    if (!notificacoesAtivas) {
      const granted = await requestNotificationPermission();
      if (!granted) { showToast('Permissão de notificação negada', 'error'); return; }

      if (pushSupported) {
        const sub = await subscribeToPush();
        if (!sub) { showToast('Erro ao ativar push notifications', 'error'); return; }
      }
    } else {
      if (pushSupported) {
        await unsubscribeFromPush();
      }
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

  const handleAddLocal = () => {
    if (!novoLocalNome.trim()) return;
    addLocal.mutate(
      { nome: novoLocalNome, cor: novoLocalCor },
      {
        onSuccess: () => { showToast('Local adicionado', 'success'); setNovoLocalNome(''); setShowAddLocal(false); },
        onError: () => showToast('Erro ao adicionar local', 'error'),
      }
    );
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="flex flex-col gap-6 p-4 pb-8">
      <Card className="flex flex-col gap-4">
        <h3 className="text-base font-semibold text-slate-100">Horários</h3>
        <div className="grid grid-cols-2 gap-3">
          <TimePicker label="Entrada" value={inicioExpediente} onChange={setInicioExpediente} />
          <TimePicker label="Saída" value={fimExpediente} onChange={setFimExpediente} />
          <TimePicker label="Início Almoço" value={almocoInicio} onChange={setAlmocoInicio} />
          <TimePicker label="Fim Almoço" value={almocoFim} onChange={setAlmocoFim} />
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-slate-100">Dias Trabalhados</h3>
        <div className="flex flex-wrap gap-2">
          {diasLabels.map((label, index) => (
            <button
              key={index}
              onClick={() => toggleDia(index)}
              className={`px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] min-w-[44px] transition-colors ${
                diasTrabalho.includes(index) ? 'bg-midnight-500 text-white' : 'bg-midnight-800/50 text-slate-400 border border-midnight-400/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-slate-100">Notificações</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Ativar notificações</span>
          <button
            onClick={handleToggleNotificacoes}
            className={`w-12 h-7 rounded-full transition-colors ${notificacoesAtivas ? 'bg-midnight-500' : 'bg-midnight-800/50 border border-midnight-400/20'}`}
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
          <h3 className="text-base font-semibold text-slate-100">Feriados</h3>
          <button onClick={() => setShowAddFeriado(!showAddFeriado)} className="text-midnight-400 text-sm font-medium min-h-[44px] min-w-[44px] flex items-center justify-center">
            + Adicionar
          </button>
        </div>

        {showAddFeriado && (
          <div className="flex flex-col gap-2 p-3 bg-midnight-800/40 rounded-lg border border-midnight-400/20">
            <Input label="Data" type="date" value={novoFeriadoData} onChange={(e) => setNovoFeriadoData(e.target.value)} />
            <Input label="Nome" type="text" value={novoFeriadoNome} onChange={(e) => setNovoFeriadoNome(e.target.value)} placeholder="Ex: Aniversário da cidade" />
            <Button size="sm" onClick={handleAddFeriado} disabled={!novoFeriadoData || !novoFeriadoNome.trim()}>
              Adicionar
            </Button>
          </div>
        )}

        {feriadosNacionais.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-slate-500 uppercase">Nacionais</p>
            {feriadosNacionais.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-1">
                <span className="text-sm text-slate-300">{dayjs(h.data).format('DD/MM')} - {h.nome}</span>
              </div>
            ))}
          </div>
        )}

        {feriadosPessoais.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-slate-500 uppercase">Personalizados</p>
            {feriadosPessoais.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-1">
                <span className="text-sm text-slate-300">{dayjs(h.data).format('DD/MM')} - {h.nome}</span>
                <button onClick={() => delFeriado.mutate(h.id)} className="text-red-400 text-sm min-h-[44px] min-w-[44px] flex items-center justify-center">
                  Excluir
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-100">Locais de Trabalho</h3>
          <button onClick={() => setShowAddLocal(!showAddLocal)} className="text-midnight-400 text-sm font-medium min-h-[44px] min-w-[44px] flex items-center justify-center">
            + Adicionar
          </button>
        </div>

        {showAddLocal && (
          <div className="flex flex-col gap-2 p-3 bg-midnight-800/40 rounded-lg border border-midnight-400/20">
            <Input label="Nome" type="text" value={novoLocalNome} onChange={(e) => setNovoLocalNome(e.target.value)} placeholder="Ex: Obra Centro" />
            <div className="flex gap-2">
              {coresLocais.map((cor) => (
                <button
                  key={cor}
                  onClick={() => setNovoLocalCor(cor)}
                  className={`w-8 h-8 rounded-full ${novoLocalCor === cor ? 'ring-2 ring-white' : ''}`}
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>
            <Button size="sm" onClick={handleAddLocal} disabled={!novoLocalNome.trim()}>
              Adicionar
            </Button>
          </div>
        )}

        {(locais || []).length > 0 && (
          <div className="flex flex-col gap-1">
            {locais!.map((local) => (
              <div key={local.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: local.cor }} />
                  <span className="text-sm text-slate-300">{local.nome}</span>
                </div>
                <button onClick={() => delLocal.mutate(local.id)} className="text-red-400 text-sm min-h-[44px] min-w-[44px] flex items-center justify-center">
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

      <button onClick={sair} className="text-center text-red-400 font-medium py-3 min-h-[44px]">
        Sair
      </button>
    </div>
  );
}
