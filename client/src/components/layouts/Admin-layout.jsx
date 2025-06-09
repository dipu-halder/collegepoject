// import { Navigate, NavLink, Outlet } from "react-router-dom";
// import { FaUserAlt } from "react-icons/fa";
// import { useAuth } from "../../store/auth";
// import { TfiAlignJustify } from "react-icons/tfi";
// import "../AdminLayout.css"; // Import the CSS file

// export const AdminLayout = () => {
//   const { user, isLoading } = useAuth();

//   if (isLoading) {
//     return <h1>Loading...</h1>;
//   }

//   if (!user?.isAdmin) {
//     return <Navigate to="/" />;
//   }

//   return (
//     <div className="admin-container">
//       <aside className="admin-sidebar">
//         <nav>
//           <ul>
//             <li>
//               <NavLink to="/admin/users" className="admin-link">
//                 <FaUserAlt /> Users
//               </NavLink>
//             </li>
//             <li>
//               <NavLink to="/admin/contacts" className="admin-link">
//                 Contacts
//               </NavLink>
//             </li>
//             <li>
//               <NavLink to="/admin/services" className="admin-link">
//                 Services
//               </NavLink>
//             </li>
//             <li>
//               <NavLink to="/" className="admin-link">
//                 Home
//               </NavLink>
//             </li>
//           </ul>
//         </nav>
//       </aside>

//       <main className="admin-content">
//         <Outlet />
//       </main>
//     </div>
//   );
// };
import { useState } from "react";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import { FaUserAlt } from "react-icons/fa";
import { TfiAlignJustify } from "react-icons/tfi";
import { useAuth } from "../../store/auth";
import "../AdminLayout.css";

export const AdminLayout = () => {
  const { user, isLoading } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);

  if (isLoading) return <h1>Loading...</h1>;
  if (!user?.isAdmin) return <Navigate to="/" />;

  return (
    <div className="admin-container">
      {/* Mobile Toggle Button */}
      <div className="hamburger-icon" onClick={() => setShowSidebar(!showSidebar)}>
        <TfiAlignJustify />
      </div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${showSidebar ? "show" : ""}`}>
        <nav>
          <ul>
            <li>
              <NavLink to="/admin/users" className="admin-link" onClick={() => setShowSidebar(false)}>
                <FaUserAlt /> Users
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/contacts" className="admin-link" onClick={() => setShowSidebar(false)}>
                Contacts
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/services" className="admin-link" onClick={() => setShowSidebar(false)}>
                Services
              </NavLink>
            </li>
            <li>
              <NavLink to="/" className="admin-link" onClick={() => setShowSidebar(false)}>
                Home
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};
