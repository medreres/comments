import { makeRequest } from "./makeRequest";

export function createComment({ postId, message, parentId }) {
  return makeRequest(`posts/${postId}/comments`, {
    method: "POST",
    data: {
      message,
      parentId,
    },
  });
}

export function updateComment({ postId, message, id }) {
  return makeRequest(`posts/${postId}/comments/${id}`, {
    method: "PATCH",
    data: {
      message,
    },
  });
}


export function deleteComment({ postId, id }) {
  return makeRequest(`posts/${postId}/comments/${id}`, {
    method: "DELETE",
    data: {
      id,
    },
  });
}


export function toggleLikeComment({ postId, id }) {
  return makeRequest(`posts/${postId}/comments/${id}/toggleLike`, {
    method: "POST"
  });
}
