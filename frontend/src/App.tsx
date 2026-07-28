import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import ApplicationForm from './pages/ApplicationForm'
import ApplicationsList from './pages/ApplicationsList'
import Login from './pages/Login'
import ResumeLibrary from './pages/ResumeLibrary'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ApplicationsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications/new"
        element={
          <ProtectedRoute>
            <ApplicationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications/:id/edit"
        element={
          <ProtectedRoute>
            <ApplicationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resumes"
        element={
          <ProtectedRoute>
            <ResumeLibrary />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
