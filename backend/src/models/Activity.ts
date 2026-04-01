import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  project: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  action: string;
  details: string;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    details: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
