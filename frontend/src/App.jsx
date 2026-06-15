import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";

import { Toaster } from "react-hot-toast";
import DashboardPage from "./pages/DashboardPage";
import ProblemPage from "./pages/ProblemPage";
import ProblemsPage from "./pages/ProblemsPage";
import SessionPage from "./pages/SessionPage";
import ReportPage from "./pages/ReportPage";
import AdminProblemsPage from "./pages/AdminProblemsPage";
import CandidateFeedbackPage from "./pages/CandidateFeedbackPage";
import { useCurrentUser } from "./hooks/useCurrentUser";

function App() {
  const { isSignedIn, isLoaded } = useUser();
  const { data: currentUser } = useCurrentUser();

  const isAdmin = currentUser?.role === "admin";

  // this will get rid of the flickering effect
  if (!isLoaded) return null;

  return (
    <>
      <Routes>
        <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/dashboard" element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"} />} />

        <Route path="/problems" element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/"} />} />
        <Route path="/problem/:id" element={isSignedIn ? <ProblemPage /> : <Navigate to={"/"} />} />
        <Route path="/session/:id" element={isSignedIn ? <SessionPage /> : <Navigate to={"/"} />} />
        <Route path="/report/:id" element={isSignedIn ? <ReportPage /> : <Navigate to={"/"} />} />
        <Route path="/feedback/:id" element={isSignedIn ? <CandidateFeedbackPage /> : <Navigate to={"/"} />} />

        {/* Admin-only route — redirects non-admins to dashboard */}
        <Route
          path="/admin/problems"
          element={
            !isSignedIn
              ? <Navigate to={"/"} />
              : isAdmin
              ? <AdminProblemsPage />
              : <Navigate to={"/dashboard"} />
          }
        />
      </Routes>

      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;
