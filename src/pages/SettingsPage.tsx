import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { useHolidays, useAddHoliday, useDeleteHoliday } from '@/hooks/useHolidays';
import { useAuth } from '@/hooks/useAuth';
import { useToast, Card, Button, Input, TimePicker } from '@/components/ui';
import { requestNotificationPermission } from '@/lib/notifications';
import { calculateWorkloadMinutes } from '@/lib/calculations';

const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const { data: holidays } = useHolidays();
  const addHolidayMutation = useAddHoliday();
  const deleteHolidayMutation = useDeleteHoliday();
  const { signOut } = useAuth();
  const { showToast } = useToast();

  const [workHoursStart, setWorkHoursStart] = useState('08:00');
  const [workHoursEnd, setWorkHoursEnd] = useState('17:00');
  const [lunchBreakStart, setLunchBreakStart] = useState('12:00');
  const [lunchBreakEnd, setLunchBreakEnd] = useState('13:00');
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState('07:30');
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');
  const [showAddHoliday, setShowAddHoliday] = useState(false);

  useEffect(() => {
    if (settings) {
      setWorkHoursStart(settings.work_hours_start.slice(0, 5));
      setWorkHoursEnd(settings.work_hours_end.slice(0, 5));
      setLunchBreakStart(settings.lunch_break_start.slice(0, 5));
      setLunchBreakEnd(settings.lunch_break_end.slice(0, 5));
      setWorkDays(settings.work_days as number[]);
      setNotificationsEnabled(settings.notifications_enabled);
      setNotificationTime(settings.notification_time.slice(0, 5));
    }
  }, [settings]);

  const handleSave = () => {
    const dailyWorkloadMinutes = calculateWorkloadMinutes(workHoursStart, workHoursEnd, lunchBreakStart, lunchBreakEnd);

    updateMutation.mutate(
      {
        work_hours_start: workHoursStart,
        work_hours_end: workHoursEnd,
        lunch_break_start: lunchBreakStart,
        lunch_break_end: lunchBreakEnd,
        work_days: workDays,
        notifications_enabled: notificationsEnabled,
        notification_time: notificationTime,
        daily_workload_minutes: dailyWorkloadMinutes,
        tolerance_minutes: 5,
      },
      {
        onSuccess: () => showToast('Configurações salvas', 'success'),
        onError: () => showToast('Erro ao salvar configurações', 'error'),
      }
    );
  };

  const toggleWorkDay = (day: number) => {
    setWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        showToast('Permissão de notificação negada', 'error');
        return;
      }
    }
    setNotificationsEnabled(!notificationsEnabled);
  };

  const handleAddHoliday = () => {
    if (!newHolidayDate || !newHolidayName.trim()) return;
    addHolidayMutation.mutate(
      { date: newHolidayDate, name: newHolidayName },
      {
        onSuccess: () => {
          showToast('Feriado adicionado', 'success');
          setNewHolidayDate('');
          setNewHolidayName('');
          setShowAddHoliday(false);
        },
        onError: () => showToast('Erro ao adicionar feriado', 'error'),
      }
    );
  };

  const handleDeleteHoliday = (id: string) => {
    deleteHolidayMutation.mutate(id, {
      onSuccess: () => showToast('Feriado removido', 'success'),
      onError: () => showToast('Erro ao remover feriado', 'error'),
    });
  };

  const personalHolidays = (holidays || []).filter((h) => h.user_id !== null);
  const nationalHolidays = (holidays || []).filter((h) => h.user_id === null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-8">
      <Card className="flex flex-col gap-4">
        <h3 className="text-base font-semibold text-gray-900">Horários</h3>
        <div className="grid grid-cols-2 gap-3">
          <TimePicker label="Entrada" value={workHoursStart} onChange={setWorkHoursStart} />
          <TimePicker label="Saída" value={workHoursEnd} onChange={setWorkHoursEnd} />
          <TimePicker label="Início Almoço" value={lunchBreakStart} onChange={setLunchBreakStart} />
          <TimePicker label="Fim Almoço" value={lunchBreakEnd} onChange={setLunchBreakEnd} />
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-gray-900">Dias Trabalhados</h3>
        <div className="flex flex-wrap gap-2">
          {dayLabels.map((label, index) => (
            <button
              key={index}
              onClick={() => toggleWorkDay(index)}
              className={`px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] min-w-[44px] transition-colors ${
                workDays.includes(index)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
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
            onClick={handleToggleNotifications}
            className={`w-12 h-7 rounded-full transition-colors ${
              notificationsEnabled ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {notificationsEnabled && (
          <TimePicker label="Horário do lembrete" value={notificationTime} onChange={setNotificationTime} />
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Feriados</h3>
          <button
            onClick={() => setShowAddHoliday(!showAddHoliday)}
            className="text-blue-500 text-sm font-medium min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            + Adicionar
          </button>
        </div>

        {showAddHoliday && (
          <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg">
            <Input label="Data" type="date" value={newHolidayDate} onChange={(e) => setNewHolidayDate(e.target.value)} />
            <Input label="Nome" type="text" value={newHolidayName} onChange={(e) => setNewHolidayName(e.target.value)} placeholder="Ex: Aniversário da cidade" />
            <Button size="sm" onClick={handleAddHoliday} disabled={!newHolidayDate || !newHolidayName.trim()}>
              Adicionar
            </Button>
          </div>
        )}

        {nationalHolidays.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-gray-500 uppercase">Nacionais</p>
            {nationalHolidays.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700">{dayjs(h.date).format('DD/MM')} - {h.name}</span>
              </div>
            ))}
          </div>
        )}

        {personalHolidays.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-gray-500 uppercase">Personalizados</p>
            {personalHolidays.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700">{dayjs(h.date).format('DD/MM')} - {h.name}</span>
                <button
                  onClick={() => handleDeleteHoliday(h.id)}
                  className="text-red-500 text-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Button onClick={handleSave} fullWidth disabled={updateMutation.isPending}>
        {updateMutation.isPending ? 'Salvando...' : 'Salvar configurações'}
      </Button>

      <button
        onClick={signOut}
        className="text-center text-red-500 font-medium py-3 min-h-[44px]"
      >
        Sair
      </button>
    </div>
  );
}
