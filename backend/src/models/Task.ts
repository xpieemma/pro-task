import mongoose, { Document, Schema } from 'mongoose';
import { upload } from '../config/cloudinary';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  dueDate?: Date | null;
  project: Schema.Types.ObjectId;
  completed?: boolean;
  attachments?: any[];
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
    completed: { type: Boolean, default: false },
    attachments: { type: Array, default: [] },
  },
  { timestamps: true }
);
const attachmentSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  public_id: {type: String},
  size: {type : Number},
  // filename: { type: String, required: true },
  mimetype: { type: String},
  uploadedAt: { type: Date, default: Date.now }
});

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  dueDate?: Date | null;
  project: Schema.Types.ObjectId;
  completed?: boolean;
  attachments?: any[];
}

export const Task = mongoose.model<ITask>('Task', taskSchema);
