import React from 'react';
import { Tag } from '../../services/task.service';

interface TagDisplayProps {
  tags: Tag[];
  className?: string;
  maxDisplay?: number;
  onTagClick?: (tag: Tag) => void;
}

export const TagDisplay: React.FC<TagDisplayProps> = ({
  tags,
  className = '',
  maxDisplay,
  onTagClick,
}) => {
  if (!tags || tags.length === 0) return null;

  const displayTags = maxDisplay ? tags.slice(0, maxDisplay) : tags;
  const remainingCount = maxDisplay && tags.length > maxDisplay ? tags.length - maxDisplay : 0;

  const getTagColor = (tag: Tag) => {
    return tag.color || '#ec4899';
  };

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {displayTags.map((tag) => (
        <span
          key={tag.id}
          onClick={() => onTagClick?.(tag)}
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-white ${
            onTagClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
          }`}
          style={{ backgroundColor: getTagColor(tag) }}
        >
          {tag.name}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700">
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

