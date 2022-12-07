import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getPost } from "../services/posts";

export const Context = React.createContext({
  post: null,
  rootComments: [],
  getReplies: () => [],
  updateComments: () => {},
  updateComment: (comment) => {},
  deleteComment: (id) => {},
});

export const usePost = () => {
  return useContext(Context);
};

const PostContextProvider = ({ children }) => {
  const { id } = useParams();
  const {
    loading,
    error,
    value: post,
  } = useAsync(getPost.bind(null, id), [id]);
  const [comments, setComments] = useState([]);

  const commentsByParentId = useMemo(() => {
    if (comments === undefined) return [];
    const group = {};
    comments.forEach((comment) => {
      group[comment.parentId] ||= [];

      group[comment.parentId].push(comment);
    });
    return group;
  }, [comments]);

  useEffect(() => {
    if (post?.comments == null) return;

    setComments(post.comments);
  }, [post?.comments]);

  function getReplies(id) {
    return commentsByParentId[id];
  }

  function updateComments(comment) {
    // createdat, id, message, parentid, postid, updatedat, userid
    setComments((prevState) => {
      return [comment, ...prevState];
    });
  }

  function updateComment(updatedComment) {
    setComments((prevState) =>
      prevState.map((comment) => {
        if (comment.id === updatedComment.id) {
          return updatedComment;
        }
        return comment;
      })
    );
  }

  function deleteComment(id) {
    console.log("deleting");
    setComments((prevState) =>
      prevState.filter((comment) => comment.id !== id)
    );
  }

  return (
    <Context.Provider
      value={{
        post: { id, ...post },
        getReplies: getReplies,
        rootComments: commentsByParentId[null],
        updateComments: updateComments,
        updateComment: updateComment,
        deleteComment: deleteComment,
      }}
    >
      {loading ? (
        <h1>Loading...</h1>
      ) : error ? (
        <h1 className="error-msg">{error}</h1>
      ) : (
        children
      )}
    </Context.Provider>
  );
};

export default PostContextProvider;
