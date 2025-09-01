import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "@/components/PrivateRoute";

import Login from "@/pages/Login";
import Products from "@/pages/Products";
import NotFound from "@/pages/NotFound";
import InventoryManagement from "@/pages/InventoryManagement";
import ProductDetail from "@/pages/ProductDetail";
import RegisterProduct from "@/pages/RegisterProduct";
import Index from "@/pages/Index"

const publicRoutes = [
  { path: "/login", 
    element: <Login /> },
  { path: "/products", 
    element: <Products /> 
  },
  { path: "/products/:id", 
    element: <ProductDetail /> 
  },
  { path: "/dashboard", 
    element: <Index /> 
  },
  { path: "/", 
    element: <Navigate to="/products" replace /> 
  },  
];

const privateRoutes = [
  { path: "/inventory-management", element: <InventoryManagement /> },
  { path: "/register-product", element: <RegisterProduct /> },
];

export const AppRoutes = () => {
  return (
    <Routes>
      {publicRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}

      {privateRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={<PrivateRoute element={element} />}
        />
      ))}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
