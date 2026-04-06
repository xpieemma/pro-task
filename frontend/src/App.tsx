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
import MoodboardGenerator from "./pages/showcase/MoodboardGenerator";

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
            <Route path="moodboard" element={<MoodboardGenerator />} />
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

// import { lazy, Suspense } from "react"; // 1. Import these
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import ProtectedRoute from "./components/ProtectedRoute";

// // 2. Replace static imports with lazy imports
// const Landing = lazy(() => import("./pages/Landing"));
// const Login = lazy(() => import("./pages/Login"));
// const Register = lazy(() => import("./pages/Register"));
// const Dashboard = lazy(() => import("./pages/Dashboard"));
// const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));

// // Showcase pages (The biggest source of bulk)
// const Showcase = lazy(() => import("./pages/showcase/Showcase"));
// const PoemWeaver = lazy(() => import("./pages/showcase/PoemWeaver"));
// const StoryWeaver = lazy(() => import("./pages/showcase/StoryWeaver"));
// const WeatherMood = lazy(() => import("./pages/showcase/WeatherMood"));
// const GalleryPage = lazy(() => import("./pages/showcase/GalleryPage"));
// const CurrencyExplorer = lazy(() => import("./pages/showcase/CurrencyExplorer"));
// const StudyStudio = lazy(() => import("./pages/showcase/StudyStudio"));
// const SpotifyVibe = lazy(() => import("./pages/showcase/SpotifyVibe"));
// const ResumePage = lazy(() => import("./pages/showcase/ResumePage"));
// const MoodboardGenerator = lazy(() => import("./pages/showcase/MoodboardGenerator"));

// // 3. Create a simple Loading component
// const PageLoader = () => (
//   <div className="flex h-screen items-center justify-center">Loading...</div>
// );

// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         {/* 4. Wrap everything in Suspense */}
//         <Suspense fallback={<PageLoader />}>
//           <Routes>
//             <Route path="/" element={<Landing />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
            
//             <Route path="/showcase/*">
//               <Route index element={<Showcase />} />
//               <Route path="poem" element={<PoemWeaver />} />
//               <Route path="story" element={<StoryWeaver />} />
//               <Route path="weather" element={<WeatherMood />} />
//               <Route path="gallery" element={<GalleryPage />} />
//               <Route path="currency" element={<CurrencyExplorer />} />
//               <Route path="study" element={<StudyStudio />} />
//               <Route path="spotify" element={<SpotifyVibe />} />
//               <Route path="resume" element={<ResumePage />} />
//               <Route path="moodboard" element={<MoodboardGenerator />} />
//             </Route>

//             <Route
//               path="/dashboard"
//               element={
//                 <ProtectedRoute>
//                   <Dashboard />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/projects/:id"
//               element={
//                 <ProtectedRoute>
//                   <ProjectDetail />
//                 </ProtectedRoute>
//               }
//             />
//           </Routes>
//         </Suspense>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;
