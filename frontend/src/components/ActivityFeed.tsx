import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import api from "../services/api";
import { getSocket } from "../services/socket";
import { Activity } from "../types";

interface Props {
  projectId: string;
}

const ActivityFeed = ({ projectId }: Props) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${projectId}/tasks/activity`);
      setActivities(data);
      setError(null);
    } catch (err) {
      setError("Failed to load activity feed");
      // silently fail — feed is non-critical
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchActivities();
    const socket = getSocket();
    if (!socket) return;
    socket.on("activity-updated", fetchActivities);
    return () => {
      socket.off("activity-updated", fetchActivities);
    };
  }, [fetchActivities]);

  if (loading)
    return (
      <div className="text-sm text-gray-500 mt-6">Loading activity...</div>
    );

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mt-6">
      <h3 className="font-semibold mb-3 text-gray-800">Activity Feed</h3>
      {error && (
        <p className="text-sm text-red-500 mb-2">
          Unable to load activity right now.
        </p>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {activities.length === 0 && (
          <p className="text-sm text-gray-500">No activity yet</p>
        )}
        {activities.map((activity) => (
          <div
            key={activity._id}
            className="text-sm border-b pb-2 last:border-b-0"
          >
            <span className="font-medium text-gray-800">
              {activity.user.name}
            </span>{" "}
            <span className="text-gray-600">{activity.action}</span>{" "}
            <span className="text-gray-500">{activity.details}</span>
            <div className="text-xs text-gray-400 mt-0.5">
              {formatDistanceToNow(new Date(activity.createdAt), {
                addSuffix: true,
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
