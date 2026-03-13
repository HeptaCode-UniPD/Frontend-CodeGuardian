import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Repositories from '../pages/Repositories';
import DettagliRepo from '../pages/DettagliRepo';

const router = createBrowserRouter([
  {
    path: "/repositories",
    element: <Repositories />,
  },
  {
    path: "/",
    element: <Repositories />,
  },
  {
    path: "/repository/:id", 
    element: <DettagliRepo />,
  },
  {
    path: "*",
    element: <div>404 - Pagina non trovata</div>,
  }
]);

export default function Routing() {
  return <RouterProvider router={router} />;
}