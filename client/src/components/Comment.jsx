import IconButton from "./IconButton";
import { useState } from "react";
import { FaHeart, FaReply, FaEdit, FaTrash, FaRegHeart } from "react-icons/fa";
import { usePost } from "../contexts/PostContext";
import CommentsList from "./CommentsList";
import { useAsyncFn } from "../hooks/useAsync";
import {
  createComment,
  updateComment as updateCommentLocalStorage,
  deleteComment as deleteCommentLocalStorage,
  toggleLikeComment,
} from "../services/comments";
import CommentForm from "./CommentForm";
import { useUser } from "../hooks/userUser";

const Comment = ({ id, message, user, createdAt, likeCount, likedByMe }) => {
  const {
    post,
    getReplies,
    updateComments,
    updateComment,
    deleteComment,
    toggleLike,
  } = usePost();
  const childComments = getReplies(id);
  const [areChildrenHidden, setAreChildrenHidden] = useState(true);
  const createCommentFn = useAsyncFn(createComment);
  const editCommentFn = useAsyncFn(updateCommentLocalStorage);
  const deleteCommentFn = useAsyncFn(deleteCommentLocalStorage);
  const likeCommentFn = useAsyncFn(toggleLikeComment);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { id: userId } = useUser();

  function onCommentReply(message) {
    return createCommentFn
      .execute({ postId: post.id, message, parentId: id })
      .then((comment) => {
        updateComments(comment);
        setIsReplying(false);
        setAreChildrenHidden(false);
      });
  }

  function onCommentEdit(message) {
    return editCommentFn
      .execute({
        postId: post.id,
        message,
        id,
      })
      .then((comment) => {
        updateComment(comment);
        setIsEditing(false);
      });
  }

  function onCommentDelete(id) {
    return deleteCommentFn
      .execute({
        postId: post.id,
        id,
      })
      .then(() => {
        deleteComment(id);
      });
  }

  function onToggleLike() {
    return likeCommentFn
      .execute({ postId: post.id, id })
      .then(({ addLike }) => {
        console.log(addLike)
        toggleLike(id, addLike);
      });
  }
  return (
    <>
      <div className="comment">
        <div className="header">
          <span className="name">{user.name}</span>
          <span className="date">
            {dateFormatter.format(Date.parse(createdAt))}
          </span>
        </div>
        {!isEditing && <div className="message">{message}</div>}
        {isEditing && (
          <div className="mt-1 ml-3">
            <CommentForm
              autoFocus
              onSubmit={onCommentEdit}
              error={editCommentFn.error}
              loading={editCommentFn.loading}
              initialValue={message}
            />
          </div>
        )}
        <div className="footer">
          <IconButton
            Icon={likedByMe ? FaHeart : FaRegHeart}
            aria-label={likedByMe ? "Unlike" : "Like"}
            onClick={onToggleLike}
          >
            {likeCount}
          </IconButton>
          <IconButton
            Icon={FaReply}
            onClick={() => setIsReplying((prevState) => !prevState)}
            isActive={isReplying}
            aria-label={isReplying ? "Cancel replying" : "Reply"}
          />

          {user.id === userId && (
            <>
              <IconButton
                Icon={FaEdit}
                onClick={() => setIsEditing((prevState) => !prevState)}
                isActive={isEditing}
                aria-label={isEditing ? "Cancel editing" : "Edit"}
              />
              <IconButton
                Icon={FaTrash}
                color="danger"
                aria-label="Delete"
                onClick={() => onCommentDelete(id)}
              />
            </>
          )}
        </div>
        {deleteCommentFn.error && (
          <div className="error-msg mt-1">{deleteCommentFn.error}</div>
        )}
      </div>
      {isReplying && (
        <div className="mt-1 ml-3">
          <CommentForm
            autoFocus
            onSubmit={onCommentReply}
            loading={createCommentFn.loading}
            error={createCommentFn.error}
          />
        </div>
      )}

      {childComments?.length > 0 && (
        <>
          <div
            className={`nested-comments-stack ${
              areChildrenHidden ? "hide" : ""
            }`}
          >
            <button
              className="collapse-line"
              aria-label="Hide Replies"
              onClick={() => setAreChildrenHidden(true)}
            />
            <div className="nested-comments">
              <CommentsList comments={childComments} />
            </div>
          </div>
          <button
            className={`btn mt-1 ${!areChildrenHidden ? "hide" : ""}`}
            onClick={() => setAreChildrenHidden(false)}
          >
            {" "}
            Show Replies
          </button>
        </>
      )}
    </>
  );
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export default Comment;
