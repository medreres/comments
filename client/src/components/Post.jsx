import React from "react";
import { usePost } from "../contexts/PostContext";
import { useAsyncFn } from "../hooks/useAsync";
import { createComment } from "../services/comments";
import CommentForm from "./CommentForm";
import CommentsList from "./CommentsList";

const Post = (props) => {
  const { post, rootComments, updateComments } = usePost();
  const {
    loading,
    error,
    execute: createCommentFn,
  } = useAsyncFn(createComment);

  function onCommentCreate(message) {
    return createCommentFn({ postId: post.id, message }).then((comment) =>
      updateComments(comment)
    );
  }
  return (
    <>
      <h1>{post.title}</h1>
      <article>{post.body}</article>
      <h3 className="comments-title">Comments</h3>
      <section>
        <CommentForm
          loading={loading}
          error={error}
          onSubmit={onCommentCreate}
        />
        {rootComments != null && rootComments.length > 0 && (
          <div className="mt-4">
            <CommentsList comments={rootComments} />
          </div>
        )}
      </section>
    </>
  );
};

export default Post;
