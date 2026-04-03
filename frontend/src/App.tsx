import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProjectDetail from "./pages/ProjectDetail";
import Landing from "./pages/Landing";
import Showcase from "./pages/showcase/Showcase";
import PoemWeaver from "./pages/showcase/PoemWeaver";
import StoryWeaver from "./pages/showcase/StoryWeaver";
import WeatherMood from "./pages/showcase/WeatherMood";
import GalleryPage from "./pages/showcase/GalleryPage";
import CurrencyExplorer from "./pages/showcase/CurrencyExplorer";
import StudyStudio from "./pages/showcase/StudyStudio";
import SpotifyVibe from "./pages/showcase/SpotifyVibe";
import ResumePage from "./pages/showcase/ResumePage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/showcase/*">
            <Route index element={<Showcase />} />
            <Route path="poem" element={<PoemWeaver />} />
            <Route path="story" element={<StoryWeaver />} />
            <Route path="weather" element={<WeatherMood />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="currency" element={<CurrencyExplorer />} />
            <Route path="study" element={<StudyStudio />} />
            <Route path="spotify" element={<SpotifyVibe />} />
            <Route path="resume" element={<ResumePage />} />
          </Route>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <Dashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/projects/:id"
//             element={
//               <ProtectedRoute>
//                 <ProjectDetail />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/"
//             element={
//               <ProtectedRoute>
//                 <Dashboard />
//               </ProtectedRoute>
//             }
//           />
//         </Routes>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;
