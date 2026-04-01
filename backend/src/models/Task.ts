import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  dueDate?: Date | null;
  project: Schema.Types.ObjectId;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Done'],
      default: 'To Do',
    },
    dueDate: { type: Date, default: null },
    project: { type: Schema.Types.ObjectId, required: true, ref: 'Project' },
  },
  { timestamps: true }
);

export const Task = mongoose.model<ITask>('Task', taskSchema);
