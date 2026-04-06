interface Props {
  onSearch: (query: string) => void;
  onFilterStatus: (status: string) => void;
}

const SearchFilter = ({ onSearch, onFilterStatus }: Props) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="flex-1 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-40">
        🔍
        </span>
      
      <input
        type="text"
        placeholder="Search tasks titles or descriptions..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-shadow"
      />
      </div>

      <div className="sm:w-48">
      
      <select
        onChange={(e) => onFilterStatus(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white cursor-pointer transition-shadow"
      >
        <option value="all">All statuses</option>
        <option value="To Do">To Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
      </select>
      </div>

    </div>
  );
};

export default SearchFilter;
