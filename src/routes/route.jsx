import { Route, Routes } from "react-router";
import App from "@/src/App.jsx";
import Profile from "@/src/pages/Profile.jsx";
import Timeline from "@/src/pages/Timeline.jsx";
import Search from "@/src/pages/Search.jsx";
import Notification from "@/src/pages/Notification.jsx";
import User from "@/src/pages/User.jsx";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/timeline" element={<Timeline />} />
      <Route path="/search" element={<Search />} />
      <Route path="/notification" element={<Notification />} />
      <Route path="/user/:id" element={<User />} />
    </Routes>
  );
}
