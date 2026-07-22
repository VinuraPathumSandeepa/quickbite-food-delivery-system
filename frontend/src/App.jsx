import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Support from "./pages/Support";

import CustomerCart from "./pages/CustomerCart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderTracking from "./pages/OrderTracking";

import AdminDashboard from "./pages/AdminDashboard";
import AdminCategories from "./pages/AdminCategories";
import AdminFoods from "./pages/AdminFoods";
import AdminCollections from "./pages/AdminCollections";
import AdminOrders from "./pages/AdminOrders";

import DeliveryDashboard from "./pages/DeliveryDashboard";
import DeliveryAssignedOrders from "./pages/DeliveryAssignedOrders";
import DeliveryCompletedOrders from "./pages/DeliveryCompletedOrders";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Footer Resource Pages */}
      <Route path="/careers" element={<Careers />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/support" element={<Support />} />

      {/* Profile Page */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER", "ADMIN", "DELIVERY"]}>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Customer Dashboard Removed */}
      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <Navigate to="/menu" replace />
          </ProtectedRoute>
        }
      />

      {/* Customer Pages */}
      <Route
        path="/customer/cart"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <CustomerCart />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/checkout"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <Checkout />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/orders"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <MyOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/orders/:orderId/track"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <OrderTracking />
          </ProtectedRoute>
        }
      />

      {/* Admin Pages */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminCategories />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/foods"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminFoods />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/collections"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminCollections />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminOrders />
          </ProtectedRoute>
        }
      />

      {/* Delivery Pages */}
      <Route
        path="/delivery/dashboard"
        element={
          <ProtectedRoute allowedRoles={["DELIVERY"]}>
            <DeliveryDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/delivery/assigned-orders"
        element={
          <ProtectedRoute allowedRoles={["DELIVERY"]}>
            <DeliveryAssignedOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/delivery/completed-orders"
        element={
          <ProtectedRoute allowedRoles={["DELIVERY"]}>
            <DeliveryCompletedOrders />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;