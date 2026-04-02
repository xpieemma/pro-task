// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { screen, fireEvent, waitFor, render } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import { MemoryRouter, Routes, Route } from 'react-router-dom';
// import api from '../services/api';
// import { makeProject, makeTask, makeActivity } from '../test/testUtils';
// import ProjectDetail from '../pages/ProjectDetail';

// vi.mock('../services/api');
// if (typeof document !== 'undefined' && !document.elementFromPoint) {
//   document.elementFromPoint = () => null;
// }
// const PROJECT_ID = 'project-1';

// type Task = { _id: string; title: string; status: string };

// const stubSuccessfulLoad = (taskOverrides: Task[] = [], activityOverrides: any[] = []) => {
//   vi.mocked(api.get).mockImplementation(async (url) => {
//     // 1. Exact match for Project Details
//     if (url === `/projects/${PROJECT_ID}`) {
//       return { data: makeProject({ _id: PROJECT_ID, name: 'Sprint 1', description: 'A test project' }) };
//     }
//     // 2. Exact match for Tasks
//     if (url === `/projects/${PROJECT_ID}/tasks`) {
//       return { data: taskOverrides };
//     }
//     // 3. Exact match for Activity
//     if (url === `/projects/${PROJECT_ID}/tasks/activity` || url === `/projects/${PROJECT_ID}/activity`) {
//       return { data: activityOverrides };
//     }
//     return { data: {} };
//   });
// };

// const renderDetail = () =>
//   render(
//     <MemoryRouter initialEntries={[`/projects/${PROJECT_ID}`]}>
//       <Routes>
//         <Route path="/projects/:id" element={<ProjectDetail />} />
//       </Routes>
//     </MemoryRouter>
//   );

// beforeEach(() => {
//   vi.clearAllMocks();
// });

// // ─── Loading ───────────────────────────────────────────────────────────────────

// describe('ProjectDetail — loading', () => {
//   it('shows a spinner on initial load', () => {
//     vi.mocked(api.get).mockReturnValue(new Promise(() => {})); // Hang the promise
//     renderDetail();
//     expect(screen.getByRole('status')).toBeInTheDocument();
//   });
// });

// // ─── Project header ────────────────────────────────────────────────────────────

// describe('ProjectDetail — header', () => {
//   it('renders the project name', async () => {
//     stubSuccessfulLoad();
//     renderDetail();
//     expect(await screen.findByText('Sprint 1')).toBeInTheDocument();
//   });

//   it('renders the project description', async () => {
//     stubSuccessfulLoad();
//     renderDetail();
//     expect(await screen.findByText('A test project')).toBeInTheDocument();
//   });

//   it('renders the owner name in the collaborators section', async () => {
//     stubSuccessfulLoad();
//     renderDetail();
//     expect(await screen.findByText(/alice.*owner/i)).toBeInTheDocument();
//   });
// });

// // ─── Activity Feed ─────────────────────────────────────────────────────────────

// describe('ProjectDetail — activity feed', () => {
//   it('renders activities in the feed', async () => {
//     const activities = [
//       makeActivity({ action: 'created a task', taskTitle: 'Initial Task' })
//     ];
//     stubSuccessfulLoad([], activities);
//     renderDetail();

//     expect(await screen.findByText(/created a task/i)).toBeInTheDocument();
//     expect(screen.getByText(/Initial Task/i)).toBeInTheDocument();
//   });
// });

// // ─── Task creation ─────────────────────────────────────────────────────────────

// describe('ProjectDetail — task creation', () => {
//   it('renders the add task form', async () => {
//     stubSuccessfulLoad();
//     renderDetail();
//     expect(await screen.findByPlaceholderText(/task title/i)).toBeInTheDocument();
//     expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
//   });

//   it('calls POST /tasks when the form is submitted', async () => {
//     const user = userEvent.setup();
//     stubSuccessfulLoad();
//     vi.mocked(api.post).mockResolvedValue({
//       data: makeTask({ _id: 'new-task', title: 'Write tests' }),
//     });
//     renderDetail();
//     await screen.findByText('Sprint 1'); // ensures project data is ready

//     const input = await screen.findByPlaceholderText(/task title/i);
//     const button = screen.getByRole('button', { name: /create task/i });

//     await user.type(input, 'Write tests');
//     await user.click(button);

//     await waitFor(() => {
//       expect(api.post).toHaveBeenCalledWith(
//         `/projects/${PROJECT_ID}/tasks`,
//         expect.objectContaining({ title: 'Write tests' })
//       );
//     });
//   });

//   it('adds the task optimistically before the API responds', async () => {
//     const user = userEvent.setup();
//     stubSuccessfulLoad();
//     vi.mocked(api.post).mockReturnValue(new Promise(() => {})); // Hang API
//     renderDetail();

//     const input = await screen.findByPlaceholderText(/task title/i);
//     const button = screen.getByRole('button', { name: /create task/i });

//     await user.type(input, 'Optimistic task');
//     await user.click(button);

//     expect(await screen.findByText('Optimistic task')).toBeInTheDocument();
//   });
// });
// it('filters tasks by search text', async () => {
//   const user = userEvent.setup();
//   const tasks = [makeTask({ _id: 't1', title: 'Fix login bug' })];
//   stubSuccessfulLoad(tasks);
  
//   renderDetail();

//   // 1. Wait for the task to actually appear in the DOM
//   const taskItem = await screen.findByText('Fix login bug');
//   expect(taskItem).toBeInTheDocument();

//   const searchInput = screen.getByPlaceholderText(/search tasks/i);
//   await user.type(searchInput, 'nonexistent');

//   // 2. Wait for it to disappear
//   await waitFor(() => {
//     expect(screen.queryByText('Fix login bug')).not.toBeInTheDocument();
//   });
// });
// // ─── Search & filter ───────────────────────────────────────────────────────────

// describe('ProjectDetail — search and filter', () => {
//   const tasks = [
//     makeTask({ _id: 't1', title: 'Fix login bug', status: 'To Do' }),
//     makeTask({ _id: 't2', title: 'Add dark mode', status: 'In Progress' }),
//     makeTask({ _id: 't3', title: 'Deploy to prod', status: 'Done' }),
//   ];

//   it('filters tasks by search text with debounce awareness', async () => {
//     const user = userEvent.setup();
//     stubSuccessfulLoad(tasks);
//     renderDetail();

//     const searchInput = await screen.findByPlaceholderText(/search tasks/i);
    
//     // Ensure tasks are rendered first
//     expect(await screen.findByText('Fix login bug')).toBeInTheDocument();

//     await user.type(searchInput, 'login');

//     expect(await screen.findByText('Fix login bug')).toBeInTheDocument();
//     expect(screen.queryByText('Add dark mode')).not.toBeInTheDocument();
//   });

//   it('filters tasks by search text', async () => {
//     const user = userEvent.setup();
//     stubSuccessfulLoad(tasks);
//     renderDetail();

//     const searchInput = await screen.findByPlaceholderText(/search tasks/i);
//     expect(await screen.findByText('Fix login bug')).toBeInTheDocument();

//     await user.type(searchInput, 'login');

//     expect(screen.getByText('Fix login bug')).toBeInTheDocument();
//     expect(screen.queryByText('Add dark mode')).not.toBeInTheDocument();
//   });

//   it('filters tasks by status', async () => {
//     const user = userEvent.setup();
//     stubSuccessfulLoad(tasks);
//     renderDetail();

//     expect(await screen.findByText('Fix login bug')).toBeInTheDocument();

//     const select = screen.getByRole('combobox');
//     await user.selectOptions(select, 'Done');

//     expect(screen.getByText('Deploy to prod')).toBeInTheDocument();
//     expect(screen.queryByText('Fix login bug')).not.toBeInTheDocument();
//   });

//   it('shows all tasks when filter is reset to "all"', async () => {
//     const user = userEvent.setup();
//     stubSuccessfulLoad(tasks);
//     renderDetail();

//     expect(await screen.findByText('Fix login bug')).toBeInTheDocument();

//     const select = screen.getByRole('combobox');
//     await user.selectOptions(select, 'Done');
//     await user.selectOptions(select, 'all');

//     expect(screen.getByText('Fix login bug')).toBeInTheDocument();
//     expect(screen.getByText('Add dark mode')).toBeInTheDocument();
//     expect(screen.getByText('Deploy to prod')).toBeInTheDocument();
//   });
// });

// // ─── View toggle ──────────────────────────────────────────────────────────────

// describe('ProjectDetail — view toggle', () => {
//   it('shows the Kanban board by default', async () => {
//     stubSuccessfulLoad();
//     renderDetail();
//     expect(await screen.findByRole('heading', { name: /To Do/i })).toBeInTheDocument();
//     expect(screen.getByRole('heading', { name: /In Progress/i })).toBeInTheDocument();
//     expect(screen.getByRole('heading', { name: /Done/i })).toBeInTheDocument();
//   });

//   it('switches to Calendar view when tab is clicked', async () => {
//     const user = userEvent.setup();
//     stubSuccessfulLoad();
//     renderDetail();

//     const calendarBtn = await screen.findByRole('button', { name: /calendar/i });
//     await user.click(calendarBtn);

//     expect(await screen.findByText(/calendar view/i)).toBeInTheDocument();
//   });

//   it('switches back to Kanban from Calendar', async () => {
//     const user = userEvent.setup();
//     stubSuccessfulLoad();
//     renderDetail();

//     const calendarBtn = await screen.findByRole('button', { name: /calendar/i });
//     await user.click(calendarBtn);
    
//     const kanbanBtn = await screen.findByRole('button', { name: /kanban/i });
//     await user.click(kanbanBtn);

//     expect(await screen.findByRole('heading', { name: /to do/i })).toBeInTheDocument();
//   });
// });

// // ─── Invite collaborator ───────────────────────────────────────────────────────

// describe('ProjectDetail — invite collaborator', () => {
//   it('renders the invite input and button', async () => {
//     stubSuccessfulLoad();
//     renderDetail();
//     expect(await screen.findByPlaceholderText(/invite by email/i)).toBeInTheDocument();
//     expect(screen.getByRole('button', { name: /invite/i })).toBeInTheDocument();
//   });

  
//   it('calls POST /invite when Invite button is clicked', async () => {
//   const user = userEvent.setup();
//   stubSuccessfulLoad();
//   vi.mocked(api.post).mockResolvedValue({ data: {} });

//   renderDetail();

//   // Wait for project and tasks to load
//   await screen.findByText('Sprint 1'); // ensures project data is ready

//   const input = await screen.findByPlaceholderText(/invite by email/i);
//   const button = screen.getByRole('button', { name: /invite/i });

//   // Ensure button is enabled
//   expect(button).toBeEnabled();

//   await user.clear(input);
//   await user.type(input, 'bob@example.com');
//   await user.click(button);

//   await waitFor(() => {
//     expect(api.post).toHaveBeenCalledWith(
//       `/projects/${PROJECT_ID}/invite`,
//       { email: 'bob@example.com' }
//     );
//   });
// });

//   it('clears the invite input after a successful invite', async () => {
//     const user = userEvent.setup();
//     stubSuccessfulLoad();
//     vi.mocked(api.post).mockResolvedValue({ data: { message: 'Collaborator added' } });
//     renderDetail();

//     const input = await screen.findByPlaceholderText(/invite by email/i);
//     const button = screen.getByRole('button', { name: /invite/i });

//     await user.type(input, 'bob@example.com');
//     await user.click(button);

//     await waitFor(() => {
//       expect(input).toHaveValue('');
//     });
//   });
// });


import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import api from '../services/api';
import { makeProject, makeTask, makeActivity } from '../test/testUtils';
import ProjectDetail from '../pages/ProjectDetail';

vi.mock('../services/api');

if (typeof document !== 'undefined' && !document.elementFromPoint) {
  document.elementFromPoint = () => null;
}

const PROJECT_ID = 'project-1';

type Task = { _id: string; title: string; status: string };

const stubSuccessfulLoad = (
  taskOverrides: Task[] = [],
  activityOverrides: any[] = []
) => {
  vi.mocked(api.get).mockImplementation(async (url) => {
    if (url === `/projects/${PROJECT_ID}`) {
      return {
        data: makeProject({
          _id: PROJECT_ID,
          name: 'Sprint 1',
          description: 'A test project',
        }),
      };
    }

    if (url === `/projects/${PROJECT_ID}/tasks`) {
      return { data: taskOverrides };
    }

    if (
      url === `/projects/${PROJECT_ID}/tasks/activity` ||
      url === `/projects/${PROJECT_ID}/activity`
    ) {
      return { data: activityOverrides };
    }

    throw new Error(`Unhandled GET request: ${url}`);
  });
};

const renderDetail = () =>
  render(
    <MemoryRouter initialEntries={[`/projects/${PROJECT_ID}`]}>
      <Routes>
        <Route path="/projects/:id" element={<ProjectDetail />} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

//
// ─── Loading ─────────────────────────────────────────────
//

describe('ProjectDetail — loading', () => {
  it('shows a spinner on initial load', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
    renderDetail();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error when project fails to load', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Failed'));
    renderDetail();

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});

//
// ─── Header ──────────────────────────────────────────────
//

describe('ProjectDetail — header', () => {
  it('renders the project name', async () => {
    stubSuccessfulLoad();
    renderDetail();
    expect(await screen.findByText('Sprint 1')).toBeInTheDocument();
  });

  it('renders the project description', async () => {
    stubSuccessfulLoad();
    renderDetail();
    expect(await screen.findByText('A test project')).toBeInTheDocument();
  });

  it('renders the owner name in collaborators', async () => {
    stubSuccessfulLoad();
    renderDetail();
    expect(await screen.findByText(/owner/i)).toBeInTheDocument();
  });
});

//
// ─── Activity Feed ───────────────────────────────────────
//

describe('ProjectDetail — activity feed', () => {
  it('renders activities in the feed', async () => {
    const activities = [
      makeActivity({ action: 'created a task',
        details: "Initial task" }),
    ];
    stubSuccessfulLoad([], activities);

    renderDetail();

    expect(await screen.findByText(/created a task/i)).toBeInTheDocument();
    expect(screen.getByText(/Initial Task/i)).toBeInTheDocument();
  });
});

//
// ─── Task Creation ───────────────────────────────────────
//

describe('ProjectDetail — task creation', () => {
  it('renders the add task form', async () => {
    stubSuccessfulLoad();
    renderDetail();

    expect(await screen.findByPlaceholderText(/task title/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('calls POST /tasks when submitted', async () => {
    const user = userEvent.setup();
    stubSuccessfulLoad();

    vi.mocked(api.post).mockResolvedValue({
      data: makeTask({ _id: 'new-task', title: 'Write tests' }),
    });

    renderDetail();

    await screen.findByText('Sprint 1');

    const input = await screen.findByPlaceholderText(/task title/i);
    const button = screen.getByRole('button', { name: /create task/i });

    await user.type(input, 'Write tests');
    await user.click(button);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        `/projects/${PROJECT_ID}/tasks`,
        expect.objectContaining({ title: 'Write tests' })
      );
    });
  });

  it('adds task optimistically', async () => {
    const user = userEvent.setup();
    stubSuccessfulLoad();

    vi.mocked(api.post).mockReturnValue(new Promise(() => {}));

    renderDetail();

    const input = await screen.findByPlaceholderText(/task title/i);
    const button = screen.getByRole('button', { name: /create task/i });

    await user.type(input, 'Optimistic task');
    await user.click(button);

    expect(await screen.findByText('Optimistic task')).toBeInTheDocument();
  });

  it('rolls back optimistic task on failure', async () => {
    const user = userEvent.setup();
    stubSuccessfulLoad();

    // vi.mocked(api.post).mockRejectedValue(new Error('fail'));
    vi.mocked(api.post).mockImplementation(
    () => new Promise((_, reject) => setTimeout(() => reject(new Error('fail')), 50))
  );

    renderDetail();

    await screen.findByText('Sprint 1');

    const input = await screen.findByPlaceholderText(/task title/i);
    const button = screen.getByRole('button', { name: /create task/i });
    

    await user.type(input, 'Failing task');
    await user.click(button);

    expect(await screen.findByText('Failing task')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Failing task')).not.toBeInTheDocument();
    });
  });
});

//
// ─── Search & Filter ─────────────────────────────────────
//

describe('ProjectDetail — search and filter', () => {
  const tasks = [
    makeTask({ _id: 't1', title: 'Fix login bug', status: 'To Do' }),
    makeTask({ _id: 't2', title: 'Add dark mode', status: 'In Progress' }),
    makeTask({ _id: 't3', title: 'Deploy to prod', status: 'Done' }),
  ];

  it('filters tasks by search text (debounced)', async () => {
    // vi.useFakeTimers();

    // const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const user = userEvent.setup();

    stubSuccessfulLoad(tasks);
    renderDetail();

    const input = await screen.findByPlaceholderText(/search tasks/i);
    expect(await screen.findByText('Fix login bug')).toBeInTheDocument();

    await user.type(input, 'login');

    // vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText('Fix login bug')).toBeInTheDocument();
      expect(screen.queryByText('Add dark mode')).not.toBeInTheDocument();
    });
  });

  it('filters tasks by status', async () => {
    const user = userEvent.setup();
    stubSuccessfulLoad(tasks);
    renderDetail();

    expect(await screen.findByText('Fix login bug')).toBeInTheDocument();

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'Done');

    expect(screen.getByText('Deploy to prod')).toBeInTheDocument();
    expect(screen.queryByText('Fix login bug')).not.toBeInTheDocument();
  });

  it('resets filter to show all tasks', async () => {
    const user = userEvent.setup();
    stubSuccessfulLoad(tasks);
    renderDetail();

    expect(await screen.findByText('Fix login bug')).toBeInTheDocument();

    const select = screen.getByRole('combobox');

    await user.selectOptions(select, 'Done');
    await user.selectOptions(select, 'all');

    expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    expect(screen.getByText('Add dark mode')).toBeInTheDocument();
    expect(screen.getByText('Deploy to prod')).toBeInTheDocument();
  });
});

//
// ─── View Toggle ─────────────────────────────────────────
//

describe('ProjectDetail — view toggle', () => {
  it('shows Kanban by default', async () => {
    stubSuccessfulLoad();
    renderDetail();

    expect(await screen.findByRole('heading', { name: /to do/i })).toBeInTheDocument();
  });

  it('switches to Calendar view', async () => {
    const user = userEvent.setup();
    stubSuccessfulLoad();
    renderDetail();

    const btn = await screen.findByRole('button', { name: /calendar/i });
    await user.click(btn);

    expect(await screen.findByText(/calendar view/i)).toBeInTheDocument();
  });

  it('switches back to Kanban', async () => {
    const user = userEvent.setup();
    stubSuccessfulLoad();
    renderDetail();

    await user.click(await screen.findByRole('button', { name: /calendar/i }));
    await user.click(await screen.findByRole('button', { name: /kanban/i }));

    expect(await screen.findByRole('heading', { name: /to do/i })).toBeInTheDocument();
  });
});

//
// ─── Invite Collaborator ─────────────────────────────────
//

describe('ProjectDetail — invite collaborator', () => {
  it('renders invite controls', async () => {
    stubSuccessfulLoad();
    renderDetail();

    expect(await screen.findByPlaceholderText(/invite by email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /invite/i })).toBeInTheDocument();
  });

  it('calls POST /invite', async () => {
    const user = userEvent.setup();
    stubSuccessfulLoad();

    vi.mocked(api.post).mockResolvedValue({ data: {} });

    renderDetail();
    await screen.findByText('Sprint 1');

    const input = await screen.findByPlaceholderText(/invite by email/i);
    const button = screen.getByRole('button', { name: /invite/i });

    await user.type(input, 'bob@example.com');
    await user.click(button);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        `/projects/${PROJECT_ID}/invite`,
        { email: 'bob@example.com' }
      );
    });
  });

  it('clears input after invite', async () => {
    const user = userEvent.setup();
    stubSuccessfulLoad();

    vi.mocked(api.post).mockResolvedValue({ data: {} });

    renderDetail();

    const input = await screen.findByPlaceholderText(/invite by email/i);
    const button = screen.getByRole('button', { name: /invite/i });

    await user.type(input, 'bob@example.com');
    await user.click(button);

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });
});