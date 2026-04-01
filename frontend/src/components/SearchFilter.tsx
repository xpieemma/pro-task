interface Props {
  onSearch: (query: string) => void;
  onFilterStatus: (status: string) => void;
}

const SearchFilter = ({ onSearch, onFilterStatus }: Props) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <input
        type="text"
        placeholder="Search tasks..."
        onChange={(e) => onSearch(e.target.value)}
        className="border rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
      <select
        onChange={(e) => onFilterStatus(e.target.value)}
        className="border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
      >
        <option value="all">All statuses</option>
        <option value="To Do">To Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
      </select>
    </div>
  );
};

export default SearchFilter;
