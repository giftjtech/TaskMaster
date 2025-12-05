import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Comment as CommentType } from '../../services/comment.service';
import { User } from '../../services/user.service';

interface CommentListProps {
  comments: CommentType[];
  currentUserId: string;
  allUsers: User[];
  onDelete?: (commentId: string) => void;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  currentUserId,
  allUsers,
  onDelete,
}) => {
  // Function to highlight mentions in comment content
  const renderCommentContent = (content: string) => {
    // Simple regex to find @mentions
    const mentionRegex = /@(\w+)/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      // Find user by name or ID
      const mentionText = match[1].toLowerCase();
      const mentionedUser = allUsers.find(
        (u) =>
          u.id.toLowerCase() === mentionText ||
          u.firstName.toLowerCase() === mentionText ||
          u.lastName.toLowerCase() === mentionText ||
          `${u.firstName}${u.lastName}`.toLowerCase() === mentionText ||
          `${u.firstName} ${u.lastName}`.toLowerCase() === mentionText
      );

      if (mentionedUser) {
        parts.push(
          <span
            key={match.index}
            className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1 rounded"
          >
            @{mentionedUser.firstName} {mentionedUser.lastName}
          </span>
        );
      } else {
        parts.push(`@${match[1]}`);
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const commentUser = comment.user || allUsers.find((u) => u.id === comment.userId);
        const isOwner = comment.userId === currentUserId;

        return (
          <div
            key={comment.id}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {commentUser
                    ? `${commentUser.firstName[0]}${commentUser.lastName[0]}`
                    : 'U'}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                    {commentUser
                      ? `${commentUser.firstName} ${commentUser.lastName}`
                      : 'Unknown User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              {isOwner && onDelete && (
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete comment"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {renderCommentContent(comment.content)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

