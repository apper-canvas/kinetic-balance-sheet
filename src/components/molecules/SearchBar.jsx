import { useState } from "react";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch, 
  onClear,
  value = "",
  className 
}) => {
  const [searchValue, setSearchValue] = useState(value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchValue);
    }
  };

  const handleClear = () => {
    setSearchValue("");
    if (onClear) {
      onClear();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative flex">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pr-20 rounded-r-none"
        />
        <div className="flex border border-l-0 border-gray-300 rounded-r-lg bg-white">
          {searchValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="px-2 rounded-none border-0"
            >
              <ApperIcon name="X" className="w-4 h-4" />
            </Button>
          )}
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="px-2 rounded-l-none border-0"
          >
            <ApperIcon name="Search" className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;