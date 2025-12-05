import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { Tag } from '../../services/task.service';

interface TagInputProps {
  tags: Tag[];
  availableTags?: Tag[];
  onChange: (tags: Tag[]) => void;
  placeholder?: string;
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  availableTags = [],
  onChange,
  placeholder = 'Type to add tags...',
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Tag[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Format tag name: lowercase, replace spaces with hyphens, remove special chars
  const formatTagName = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Validate tag name
  const isValidTagName = (name: string): boolean => {
    const formatted = formatTagName(name);
    return formatted.length >= 1 && formatted.length <= 30;
  };

  useEffect(() => {
    if (inputValue.trim()) {
      const searchTerm = inputValue.toLowerCase().trim();
      const filtered = availableTags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(searchTerm) &&
          !tags.some((t) => t.id === tag.id || t.name.toLowerCase() === tag.name.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      // Show all available tags when input is empty and focused
      const unselectedTags = availableTags.filter(
        (tag) => !tags.some((t) => t.id === tag.id || t.name.toLowerCase() === tag.name.toLowerCase())
      );
      setFilteredSuggestions(unselectedTags.slice(0, 10)); // Limit to 10 for performance
      setShowSuggestions(unselectedTags.length > 0);
      setSelectedIndex(-1);
    }
  }, [inputValue, availableTags, tags]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setDuplicateWarning(false);

    // Handle comma-separated tags
    if (value.includes(',')) {
      const tagNames = value.split(',').map((t) => t.trim()).filter(Boolean);
      tagNames.forEach((tagName) => {
        if (tagName) {
          addTag(tagName);
        }
      });
      setInputValue('');
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
        selectSuggestion(filteredSuggestions[selectedIndex]);
      } else if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
      setShowSuggestions(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setInputValue('');
      setSelectedIndex(-1);
    } else if (e.key === 'Tab' && selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
      e.preventDefault();
      selectSuggestion(filteredSuggestions[selectedIndex]);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1].id);
    }
  };

  const addTag = (tagName: string) => {
    if (!isValidTagName(tagName)) {
      setDuplicateWarning(true);
      setTimeout(() => setDuplicateWarning(false), 2000);
      return;
    }

    const formattedName = formatTagName(tagName);
    if (!formattedName) return;

    // Check if tag already exists in current tags
    if (tags.some((t) => t.name.toLowerCase() === formattedName)) {
      setDuplicateWarning(true);
      setTimeout(() => setDuplicateWarning(false), 2000);
      setInputValue('');
      return;
    }

    // Check if tag exists in available tags
    const existingTag = availableTags.find(
      (t) => t.name.toLowerCase() === formattedName
    );
    
    if (existingTag) {
      onChange([...tags, existingTag]);
    } else {
      // Create new tag with color rotation
      const colors = [
        '#ec4899', // pink
        '#a855f7', // purple
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // amber
        '#ef4444', // red
        '#8b5cf6', // violet
        '#06b6d4', // cyan
      ];
      const colorIndex = tags.length % colors.length;
      const newTag: Tag = {
        id: `temp-${Date.now()}`,
        name: formattedName,
        color: colors[colorIndex],
      };
      onChange([...tags, newTag]);
    }

    setInputValue('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const removeTag = (tagId: string) => {
    onChange(tags.filter((t) => t.id !== tagId));
    inputRef.current?.focus();
  };

  const selectSuggestion = (tag: Tag) => {
    if (!tags.some((t) => t.id === tag.id)) {
      onChange([...tags, tag]);
    }
    setInputValue('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const getTagColor = (tag: Tag) => {
    return tag.color || '#ec4899';
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`flex flex-wrap gap-2 p-2.5 border rounded-lg bg-white dark:bg-gray-800 min-h-[44px] items-center transition-colors ${
          duplicateWarning
            ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
            : showSuggestions
            ? 'border-pink-400 dark:border-pink-500 ring-2 ring-pink-100 dark:ring-pink-900/50'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-white shadow-sm transition-all hover:shadow-md"
            style={{ backgroundColor: getTagColor(tag) }}
          >
            <span>{tag.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag.id);
              }}
              className="hover:bg-black/20 rounded-full p-0.5 transition-opacity opacity-80 hover:opacity-100"
              aria-label={`Remove ${tag.name} tag`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => {
            setShowSuggestions(true);
          }}
          placeholder={tags.length === 0 ? placeholder : 'Add more tags...'}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400"
          maxLength={30}
        />
        {duplicateWarning && (
          <span className="text-xs text-red-600 dark:text-red-400 animate-pulse">
            Tag already exists
          </span>
        )}
      </div>

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.length > 0 ? (
            <div className="py-1">
              {filteredSuggestions.map((tag, index) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => selectSuggestion(tag)}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-2.5 ${
                    index === selectedIndex
                      ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-900 dark:text-pink-100'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: getTagColor(tag) }}
                  />
                  <span className="flex-1">{tag.name}</span>
                  {tags.some((t) => t.id === tag.id) && (
                    <Check className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            inputValue.trim() && (
              <div className="py-2 px-3">
                <button
                  type="button"
                  onClick={() => addTag(inputValue.trim())}
                  className={`w-full text-left text-sm transition-colors flex items-center gap-2.5 px-2 py-2 rounded ${
                    selectedIndex === -1 && filteredSuggestions.length === 0
                      ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-900 dark:text-pink-100'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Create tag "{formatTagName(inputValue.trim())}"</span>
                </button>
              </div>
            )
          )}
          {!inputValue.trim() && filteredSuggestions.length === 0 && (
            <div className="py-4 px-3 text-center text-sm text-gray-500 dark:text-gray-400">
              No tags available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

