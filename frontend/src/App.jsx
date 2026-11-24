import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import LoadingSpinner from "./components/LoadingSpinner";
import ProtectedRoute from "./components/ProtectedRoute";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const Careers = lazy(() => import("./pages/Careers"));
const Contact = lazy(() => import("./pages/Contact"));
const Support = lazy(() => import("./pages/Support"));
const CustomerCart = lazy(() => import("./pages/CustomerCart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminCategories = lazy(() => import("./pages/AdminCategories"));
const AdminFoods = lazy(() => import("./pages/AdminFoods"));
const AdminCollections = lazy(() => import("./pages/AdminCollections"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const DeliveryDashboard = lazy(() => import("./pages/DeliveryDashboard"));
const DeliveryAssignedOrders = lazy(() => import("./pages/DeliveryAssignedOrders"));
const DeliveryCompletedOrders = lazy(() => import("./pages/DeliveryCompletedOrders"));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading page..." />}>
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
    </Suspense>
  );
}

export default App;
