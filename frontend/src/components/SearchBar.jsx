const SearchBar = ({ onSearch }) => {
    return (
      <input
        type="text"
        placeholder="Search by doctor or speciality..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full md:w-64 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    );
  };
  
  export default SearchBar;