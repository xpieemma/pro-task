import { Link } from 'react-router-dom';
import { Project } from '../types';
import { useAuth } from '../context/AuthContext';

interface Props {
  project: Project;
  onDelete: (id: string) => void;
}

const ProjectCard = ({ project, onDelete }: Props) => {
  const { user } = useAuth();
  // const isOwner = user?._id === project.owner._id;
  const ownerId =
  typeof project.owner === "string"
    ? project.owner
    : project.owner._id;

const isOwner = user?._id === ownerId;


  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5">
      <Link to={`/projects/${project._id}`}>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.name}</h3>
        {project.description && (
          <p className="text-gray-600 mb-4 truncate">{project.description}</p>
        )}
        <p className="text-xs text-gray-400 mb-2">
          Owner: {typeof project.owner === "string" ? "Unknown owner" : project.owner.name}
          {!isOwner && ' · Collaborator'}
        </p>
      </Link>
      {isOwner && (
        <button
          onClick={() => onDelete(project._id)}
          className="text-red-500 text-sm hover:underline"
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default ProjectCard;
