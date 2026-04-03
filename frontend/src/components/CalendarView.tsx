import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View, Event } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { Task } from '../types';
import toast from 'react-hot-toast';

// Styles
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// const DnDCalendar = withDragAndDrop(Calendar);
const DnDCalendar = withDragAndDrop<CalendarEvent, object>(Calendar);


interface CalendarEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Task;
}

interface Props {
  tasks: Task[];
  projectId: string;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskAdd: (task: Partial<Task>) => void;
}

const CalendarView = ({ tasks = [], projectId, onTaskUpdate, onTaskAdd }: Props) => {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  const events: CalendarEvent[] = useMemo(() => {
    return (tasks || [])
      .filter((task) => task.dueDate)
      .map((task) => {
        const start = new Date(task.dueDate!);
        const end = new Date(start);
        end.setHours(start.getHours() + 1);

        return {
          id: task._id,
          title: task.title,
          start,
          end,
          resource: task,
        };
      });
  }, [tasks]);

  const handleEventDrop = (args: {
    event: CalendarEvent;
    start: string | Date;
    end: string | Date;
  }) => {
    const { event, start } = args;
    const newDate = new Date(start);
    onTaskUpdate(event.id, { dueDate: newDate.toISOString() });
    toast.success('Task moved');
  };

  const handleEventResize = (args: {
    event: CalendarEvent;
    start: string | Date;
    end: string | Date;
  }) => {
    const newDate = new Date(args.start);
    onTaskUpdate(args.event.id, { dueDate: newDate.toISOString() });
    toast.success('Task duration updated');
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    const title = window.prompt('New task title');
    if (!title?.trim()) return;

    onTaskAdd({
      title: title.trim(),
      dueDate: start.toISOString(),
      status: 'To Do',
    });
    toast.success('Task scheduled');
  };

  const eventPropGetter = (event: CalendarEvent) => {
    const status = event.resource?.status;
    let backgroundColor = '#3b82f6';

    switch (status) {
      case 'Done': backgroundColor = '#10b981'; break;
      case 'In Progress': backgroundColor = '#f59e0b'; break;
      case 'To Do': backgroundColor = '#ef4444'; break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        color: 'white',
        border: 'none',
        padding: '2px 4px',
        fontSize: '0.875rem',
      },
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 h-[75vh] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Project Timeline</h2>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(['month', 'week', 'day'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-md capitalize text-sm font-medium transition-all ${
                view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow">
        <DnDCalendar 
          localizer={localizer}
          events={events}
          startAccessor={(event) => event.start}
          endAccessor={(event) => event.end}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          selectable
          resizable
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onSelectEvent={(event: any) => toast(`Task: ${event.title}`)}
          eventPropGetter={eventPropGetter}
          popup
          longPressThreshold={10}
          tooltipAccessor={(event: any) => `Status: ${event.resource.status}`}
          views={['month', 'week', 'day']}
          className="rounded-lg border-gray-100"
        />
      </div>
    </div>
  );
};

export default CalendarView;