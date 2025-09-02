// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";

//  import SUGGESTION from "./pages/Suggestion";
//  //-> to import your jsx code
// import Dietary from "./pages/DietaryPreference";

// import Cart from "./pages/Cart";          
// import Contact from "./pages/ContactModal";
// import Categories from "./pages/CategoriesPage";
// import Signup from "./pages/SignupModal";
// import Login from "./pages/LoginModal";
// import OrderPage from "./pages/OrderPage";
// import Error from "./pages/Error";
// import Logout from "./pages/Logout";
// import { AdminUsers } from "./pages/Admin-Users";
// import { AdminContacts } from "./pages/Admin-Contacts";
// import { AdminLayout } from "./components/layouts/Admin-layout";
// import AdminUpdate from "./pages/Admin-Update";
// import Navbar from "./components/Navbar";

// import OrderTrackingPage from "./pages/Tracking Page";
// import { AdminOrders } from "./pages/AdminOrders";
// import OrderHistory from "./pages/OrderHistory";
// import Profile from "./components/Profile";
// import RiderTest from "./pages/rider-test";


// function App() {
//   return (
//     <BrowserRouter>
   
//       <Navbar />

    
//       <Routes>
//         <Route path="/" element={<Home />} />
        
//         <Route path="/OrderPage" element={<OrderPage />} />
//         <Route path="/Suggestion" element={<SUGGESTION/>} /> 
//         <Route path="/DietaryPreference" element={<Dietary/>} /> 
//         <Route path="/profile" element={<Profile />} />
//         <Route path="/cart" element={<Cart />} />
//         <Route path="/categories" element={<Categories />} />
//         <Route path="/contact" element={<Contact />} />
//         <Route path="/ridertest" element={<RiderTest />} />
//          <Route path="/order-history" element={<OrderHistory />} />
//        {/* <Route path="/order" element={<OrderPage />} /> */}
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/logout" element={<Logout />} />
//         <Route path="*" element={<Error />} />
          
//            <Route path="/track/:orderId" element={<OrderTrackingPage />} />

//          <Route path="/admin" element={<AdminLayout/>}>
//           <Route path='users' element={<AdminUsers/>} />
          
      
//          <Route path="/admin/users/:id/edit" element={<AdminUpdate />} />
//           <Route path='contacts' element={<AdminContacts/>} />
//           <Route path="orders" element={<AdminOrders />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
//   import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";
// import SUGGESTION from "./pages/Suggestion";
// import Dietary from "./pages/DietaryPreference";
// import Cart from "./pages/Cart";
// import Contact from "./pages/ContactModal";
// import Categories from "./pages/CategoriesPage";
// import Signup from "./pages/SignupModal";
// import Login from "./pages/LoginModal";
// import OrderPage from "./pages/OrderPage";
// import Error from "./pages/Error";
// import Logout from "./pages/Logout";
// import { AdminUsers } from "./pages/Admin-Users";
// import { AdminContacts } from "./pages/Admin-Contacts";
// import { AdminLayout } from "./components/layouts/Admin-layout";
// import AdminUpdate from "./pages/Admin-Update";
// import Navbar from "./components/Navbar";
// import OrderTrackingPage from "./pages/TrackOrder";   // ✅ filename fix: no space
// import { AdminOrders } from "./pages/AdminOrders";
// import OrderHistory from "./pages/OrderHistory";
// import Profile from "./components/Profile";
// import RiderPanel from "./components/RiderPanel";

           
// import RiderForm from "./pages/RiderForm";
// import AdminRider from "./pages/Admin-Rider";
// import TrackOrder from "./pages/RiderUpdate";
// import RiderHistory from "./pages/RiderHistory";
// import RiderOrderDetail from "./pages/RiderOrderDetail";
// import RiderTracking from "./pages/RiderTracking";
// import TrackingPage from "./pages/TrackOrder";
// import RiderMapDashboard from "./pages/RiderMapDashboard";

// function App() {
//   return (
//     <BrowserRouter>
//       <Navbar />

//       <Routes>
//         {/* Public Routes */}
//         <Route path="/" element={<Home />} />
//         <Route path="/orderPage" element={<OrderPage />} />
//         <Route path="/suggestion" element={<SUGGESTION />} />
//         <Route path="/dietaryPreference" element={<Dietary />} />
//         <Route path="/profile" element={<Profile />} />
//         <Route path="/trackorder" element={<TrackOrder />} />
//         <Route path="/cart" element={<Cart />} />
//         <Route path="/categories" element={<Categories />} />
//         <Route path="/contact" element={<Contact />} />
//         <Route path="/rider-test" element={< RiderPanel />} />
//         <Route path="/order-history" element={<OrderHistory />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/logout" element={<Logout />} />
//         <Route path="/rider/orders/:id" element={<RiderOrderDetail />} />
//         <Route path="/rider/history" element={<RiderHistory />} />
//         <Route path="/ridertracking" element={<RiderTracking />} />
//           <Route path="/rider/map" element={<RiderMapDashboard />} />

//         <Route path="/riderform" element={<RiderForm />} />
//         <Route path="*" element={<Error />} />
//         {/* Live Tracking */}
//         <Route path="/track/:orderId" element={<TrackingPage />} />

//         {/* Admin Routes */}
//         <Route path="/admin" element={<AdminLayout />}>
//           <Route path="users" element={<AdminUsers />} />
//           <Route path="users/:id/edit" element={<AdminUpdate />} />
//           <Route path="contacts" element={<AdminContacts />} />
//           <Route path="orders" element={<AdminOrders />} />
//           <Route path="riders" element={<AdminRider />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
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
