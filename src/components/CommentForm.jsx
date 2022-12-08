import React, { useState } from "react";

const CommentForm = ({
  loading,
  error,
  onSubmit,
  initialValue = "",
  autoFocus = false,
}) => {
  const [message, setMessage] = useState(initialValue);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(message).then(() => setMessage(""));
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="comment-form-row">
        <textarea
          autoFocus={autoFocus}
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          disabled={loading}    
          className="message-input"
          name=""
          id=""
          cols="30"
          rows="10"
        ></textarea>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Loading..." : "Post"}
        </button>
      </div>
      <div className="error-msg">{error}</div>
    </form>
  );
};

export default CommentForm;
