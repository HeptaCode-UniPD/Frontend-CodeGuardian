import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import History from './pages/Repositories';

// 1. Definiamo la "Mappa" (il tuo vecchio index.php) direttamente qui
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/history",
    element: <History />,
  },
  {
    path: "*",
    element: <div>404 - Pagina non trovata</div>,
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}