import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import Repositories from '../pages/Repositories';
import DettagliRepo from '../pages/DettagliRepo';
import AddRepository from '../pages/AddRepository';
import UserPage from '../pages/UserPage';
import Login from '../pages/Login';
import { NavBar } from '../components/NavBar';

const RootLayout = () => (
  <div>
    <NavBar />
    <main>
      <Outlet />
    </main>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        handle: { label: "Repositories" },
        children: [
          {
            path: "repositories", 
            element: <Repositories />,
          },
          {
            path: "repository/:id", 
            element: <DettagliRepo />,
            handle: { label: "Repository" },
          }
        ]
      },
      {
        index: true,
        element: <Navigate to="/repositories" replace />,
      },
      {
        path: "/addRepository",
        element: <AddRepository />,
        handle: { label: "Aggiungi repository" },
      },
      {
        path: "/profile",
        element: <UserPage />,
        handle: { label: "Profilo" },
      },
      {
        path: "/login",
        element: <Login />,
        handle: { label: "Login" },
      },
      {
        path: "*",
        element: <div>404 - Pagina non trovata</div>,
      }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}