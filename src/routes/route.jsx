import { Route, Routes } from "react-router";
import App from "@/src/App.jsx";
import Profile from "@/src/pages/Profile.jsx";
import Blog from "@/src/pages/Blog.jsx";
import Gallery from "@/src/pages/Gallery.jsx";
import Admin from "@/src/pages/Admin.jsx";
import Post from "@/src/pages/Post.jsx";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/:id/b203357m241731" element={<Post />} />
    </Routes>
  );
}
