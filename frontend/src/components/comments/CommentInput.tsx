import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { User } from '../../services/user.service';
import { useClickOutside } from '../../hooks/useClickOutside';

interface CommentInputProps {
  onSubmit: (content: string) => Promise<void>;
  users: User[];
  currentUserId: string;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  users,
  currentUserId,
}) => {
  const [content, setContent] = useState('');
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(-1);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useClickOutside(containerRef, () => {
    if (showMentionSuggestions) {
      setShowMentionSuggestions(false);
      setMentionQuery('');
      setMentionIndex(-1);
    }
  });

  // Filter users for mention suggestions (exclude current user)
  const filteredUsers = useMemo(() => {
    if (!users || users.length === 0) {
      return [];
    }
    
    // First filter: exclude current user and invalid users
    const availableUsers = users.filter((user) => user && user.id !== currentUserId);
    
    // If no query (just typed @), show all available users
    if (!mentionQuery || mentionQuery.trim() === '') {
      return availableUsers.slice(0, 5);
    }
    
    // Filter by query
    const query = mentionQuery.toLowerCase().trim();
    return availableUsers
      .filter((user) => {
        const firstName = (user.firstName || '').toLowerCase();
        const lastName = (user.lastName || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();
        
        return (
          firstName.includes(query) ||
          lastName.includes(query) ||
          fullName.includes(query) ||
          firstName.startsWith(query) ||
          lastName.startsWith(query)
        );
      })
      .slice(0, 5); // Limit to 5 suggestions
  }, [users, currentUserId, mentionQuery]);

  // Handle textarea input
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;

    setContent(value);

    // Check if user is typing @mention
    const textBeforeCursor = value.substring(0, cursorPosition);
    
    // Match @ followed by optional alphanumeric characters
    // This will match: @, @u, @user, @user123
    // But won't match if there's a space: @user name
    const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9]*)$/);

    if (mentionMatch && mentionMatch.index !== undefined) {
      const query = mentionMatch[1] || '';
      setMentionQuery(query);
      setMentionIndex(mentionMatch.index);
      setShowMentionSuggestions(true);
      setSelectedMentionIndex(0);
    } else {
      // Close suggestions if not in mention context
      setShowMentionSuggestions(false);
      setMentionQuery('');
      setMentionIndex(-1);
    }
  };

  // Handle mention selection
  const insertMention = (user: User) => {
    if (mentionIndex === -1 || !textareaRef.current) return;

    const beforeMention = content.substring(0, mentionIndex);
    // Replace from @ to cursor position (including the @ and any typed query)
    const afterMention = content.substring(mentionIndex + 1 + mentionQuery.length);
    const mentionText = `@${user.firstName} ${user.lastName}`;
    const newContent = `${beforeMention}${mentionText} ${afterMention}`;

    setContent(newContent);
    setShowMentionSuggestions(false);
    setMentionQuery('');
    setMentionIndex(-1);

    // Focus back on textarea and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = mentionIndex + mentionText.length + 1; // +1 for space
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionSuggestions && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        );
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (filteredUsers[selectedMentionIndex]) {
          insertMention(filteredUsers[selectedMentionIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentionSuggestions(false);
        setMentionQuery('');
        setMentionIndex(-1);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (filteredUsers[selectedMentionIndex]) {
          insertMention(filteredUsers[selectedMentionIndex]);
        }
      }
    } else if (e.key === 'Enter' && !e.shiftKey && content.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Scroll selected suggestion into view
  useEffect(() => {
    if (suggestionsRef.current && showMentionSuggestions) {
      const selectedElement = suggestionsRef.current.children[selectedMentionIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedMentionIndex, showMentionSuggestions]);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await onSubmit(content.trim());
      setContent('');
      setShowMentionSuggestions(false);
      setMentionQuery('');
      setMentionIndex(-1);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-start space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment... (Type @ to mention someone)"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
            rows={3}
          />
          {showMentionSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto z-[100]"
            >
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => insertMention(user)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 ${
                      index === selectedMentionIndex
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : ''
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.firstName?.[0] || ''}
                      {user.lastName?.[0] || ''}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 hover:shadow-lg disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

