export interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: { _id: string; name: string; email: string };
  collaborators: { _id: string; name: string; email: string }[];
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  dueDate?: string | null;
  project: string;
}

export interface Activity {
  _id: string;
  user: { _id: string; name: string; email: string };
  action: string;
  details: string;
  createdAt: string;
}
