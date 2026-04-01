import { useState } from 'react';
import { Calendar, dateFnsLocalizer, View, Event } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Task } from '../types';
import toast from 'react-hot-toast';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const DnDCalendar = withDragAndDrop(Calendar);

interface CalendarEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: Task;
}

interface Props {
  tasks: Task[];
  projectId: string;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskAdd: (task: Partial<Task>) => void;
}

const CalendarView = ({ tasks, onTaskUpdate, onTaskAdd }: Props) => {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  const events: CalendarEvent[] = tasks
    .filter((task) => task.dueDate)
    .map((task) => ({
      id: task._id,
      title: task.title,
      start: new Date(task.dueDate!),
      end: new Date(task.dueDate!),
      resource: task,
    }));

  const handleSelectSlot = ({ start }: { start: Date }) => {
    const title = window.prompt('New task title');
    if (!title?.trim()) return;
    onTaskAdd({ title: title.trim(), dueDate: start.toISOString(), status: 'To Do' });
    toast.success('Task scheduled');
  };

  const handleEventDrop = ({ event, start }: { event: object; start: Date | string }) => {
    const calEvent = event as CalendarEvent;
    onTaskUpdate(calEvent.id, { dueDate: new Date(start).toISOString() });
    toast.success('Due date updated');
  };

  const handleSelectEvent = (event: object) => {
    const calEvent = event as CalendarEvent;
    const task = calEvent.resource!;
    const current = task.dueDate ? task.dueDate.slice(0, 10) : '';
    const newDate = window.prompt('New due date (YYYY-MM-DD)', current);
    if (!newDate || isNaN(Date.parse(newDate))) return;
    onTaskUpdate(task._id, { dueDate: new Date(newDate).toISOString() });
    toast.success('Due date updated');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 h-[70vh]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Calendar View</h2>
        <div className="flex gap-2">
          {(['month', 'week', 'day'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded capitalize text-sm ${
                view === v
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        selectable
        onSelectSlot={handleSelectSlot}
        onEventDrop={handleEventDrop}
        onSelectEvent={handleSelectEvent}
        draggableAccessor={() => true}
        style={{ height: 'calc(100% - 48px)' }}
      />
    </div>
  );
};

export default CalendarView;
