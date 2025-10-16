


// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import OrderPage from "./pages/OrderPage";
import SUGGESTION from "./pages/Suggestion";
import Dietary from "./pages/DietaryPreference";
import Cart from "./pages/Cart";
import Categories from "./pages/CategoriesPage";
import Contact from "./pages/ContactModal";
import Signup from "./pages/SignupModal";
import Login from "./pages/LoginModal";
import Error from "./pages/Error";
import Logout from "./pages/Logout";
import OrderHistory from "./pages/OrderHistory";
import TrackOrderPage from "./pages/TrackOrder";        // /track/:orderId
import RiderForm from "./pages/RiderForm";
import RiderOrderDetail from "./pages/RiderOrderDetail";
import RiderHistory from "./pages/RiderHistory";
import RiderMapDashboard from "./pages/RiderMapDashboard";

// Admin
import { AdminLayout } from "./components/layouts/Admin-layout";
import { AdminUsers } from "./pages/Admin-Users";
import { AdminContacts } from "./pages/Admin-Contacts";
import { AdminOrders } from "./pages/AdminOrders";
import AdminUpdate from "./pages/Admin-Update";
import AdminRider from "./pages/Admin-Rider";

// Components (smaller)
import Profile from "./components/Profile";
import RiderPanel from "./components/RiderPanel";
import RiderTracking from "./components/RiderTracking"; // if this file is under pages, change path accordingly

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/orderPage" element={<OrderPage />} />
        <Route path="/suggestion" element={<SUGGESTION />} />
        <Route path="/dietaryPreference" element={<Dietary />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/riderpanel" element={<RiderPanel />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />

        {/* Rider pages */}
        <Route path="/rider/orders/:id" element={<RiderOrderDetail />} />
        <Route path="/rider/history" element={<RiderHistory />} />
        <Route path="/ridertracking" element={<RiderTracking />} />
        <Route path="/rider/map" element={<RiderMapDashboard />} />
        <Route path="/riderform" element={<RiderForm />} />

        {/* Live tracking (customer-facing) */}
        <Route path="/track/:orderId" element={<TrackOrderPage />} />

        {/* Admin area (nested) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id/edit" element={<AdminUpdate />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="riders" element={<AdminRider />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
