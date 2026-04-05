import { Request, Response } from 'express';
import { Task } from '../models/Task.js';

export const handleGithubPush = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ensure it's a push event
    const event = req.headers['x-github-event'];
    if (event !== 'push') {
      res.status(200).json({ message: 'Event ignored. Only listening for pushes.' });
      return;
    }

    // Extract commits from the GitHub payload
    const commits = req.body.commits || [];
    const io = req.app.get('io');
    const processedTasks: string[] = [];

    // Scan every commit message for the closing pattern
    for (const commit of commits) {
      const message = commit.message as string;
      
      // Regex matches: "Fixes #<taskId>", "closes #<taskId>", "resolved #<taskId>"
      // It captures the alphanumeric MongoDB ID after the '#'
      const regex = /(?:fix|fixes|fixed|resolves|resolved|closes|closed)\s+#([a-zA-Z0-9]+)/gi;
      let match;

      while ((match = regex.exec(message)) !== null) {
        const taskId = match[1];

        // Validate that the ID matches MongoDB's 24-character hex format
        if (taskId.length === 24) {
          const task = await Task.findById(taskId);
          
          if (task && task.status !== 'Done') {
            task.status = 'Done';
            await task.save();

            // Fire real-time WebSocket update to the frontend
            io.to(`project:${task.project}`).emit('task-updated', task);
            processedTasks.push(taskId);
            console.log(`✅ Webhook auto-completed task: ${taskId}`);
          }
        }
      }
    }

    res.status(200).json({ 
      message: 'Webhook processed successfully', 
      tasksUpdated: processedTasks 
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Internal server error processing webhook' });
  }
};