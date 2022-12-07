import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Post from "./components/Post";
import PostList from "./components/PostList";
import PostContextProvider from "./contexts/PostContext";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<PostList />} />
        <Route
          path="posts/:id"
          element={
            <PostContextProvider>
              <Post />
            </PostContextProvider>
          }
        />
        <Route path="*" element={<Navigate to="" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
