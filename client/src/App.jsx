import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

 import SUGGESTION from "./pages/Suggestion";
 //-> to import your jsx code
import Dietary from "./pages/DietaryPreference";

import Cart from "./pages/Cart";          
import Contact from "./pages/ContactModal";
import Categories from "./pages/CategoriesPage";
import Signup from "./pages/SignupModal";
import Login from "./pages/LoginModal";
import OrderPage from "./pages/OrderPage";
import Error from "./pages/Error";
import Logout from "./pages/Logout";
import { AdminUsers } from "./pages/Admin-Users";
import { AdminContacts } from "./pages/Admin-Contacts";
import { AdminLayout } from "./components/layouts/Admin-layout";
import AdminUpdate from "./pages/Admin-Update";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
   
      <Navbar />

    
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/OrderPage" element={<OrderPage />} />
        <Route path="/Suggestion" element={<SUGGESTION/>} /> 
        <Route path="/DietaryPreference" element={<Dietary/>} /> 
        <Route path="/cart" element={<Cart />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/contact" element={<Contact />} />
       {/* <Route path="/order" element={<OrderPage />} /> */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<Error />} />

         <Route path="/admin" element={<AdminLayout/>}>
          <Route path='users' element={<AdminUsers/>} />
          
      
         <Route path="/admin/users/:id/edit" element={<AdminUpdate />} />
          <Route path='contacts' element={<AdminContacts/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
