import mongoose, { Document, Schema } from 'mongoose';
export interface IAttachment {
  name: string;
  url: string;
  public_id?: string;
  size?: number;
  mimetype?: string;
  uploadedAt: Date;
}
export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  dueDate?: Date | null;
  project: Schema.Types.ObjectId;
  completed?: boolean;
  attachments?: any[];
}

const attachmentSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  public_id: {type: String},
  size: {type : Number},
  // filename: { type: String, required: true },
  mimetype: { type: String},
  uploadedAt: { type: Date, default: Date.now }
});

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
    attachments: [attachmentSchema],
  },
  { timestamps: true }
);


export const Task = mongoose.model<ITask>('Task', taskSchema);
