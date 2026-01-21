import { Navigate } from 'react-router-dom';

interface StudentPrivateRouteProps {
  children: React.ReactNode;
}

const StudentPrivateRoute = ({ children }: StudentPrivateRouteProps) => {
  const studentToken = localStorage.getItem('studentToken');

  if (!studentToken) {
    return <Navigate to="/student/login" replace />;
  }

  return <>{children}</>;
};

export default StudentPrivateRoute;
