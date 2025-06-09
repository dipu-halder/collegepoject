import { useEffect, useState } from "react"; // You forgot to import useState
import { useAuth } from "../store/auth";
import { Link } from "react-router-dom";
import './style/AdminUsers.css';

import { ToastContainer, toast } from 'react-toastify';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const { authorizationToken } = useAuth();

  const getAllUsersData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        method: "GET",
        headers: {
          Authorization: authorizationToken,
        },
      }); 
      const data = await response.json();
      console.log("user", data);
      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteUser = async (id) => {
    try {
        
   
     const response = await fetch(`http://localhost:5000/api/admin/users/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: authorizationToken,
        },
      });
        //  const data = await response.json();
      // console.log(`user data after delete: ${data}`);
      if(response.ok){
         toast.success('Delete successful', {
                  position: "top-right",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",})
        getAllUsersData();
      }
       } catch (error) {
     console.log(error);
        
    }
  }

  useEffect(() => {
    getAllUsersData();
  }, []);

  return (
    <>
    <section className="admin_users-section">
        <div className="">
      <h1>All Registered Users</h1>
        </div>
        <div className=" admin-users">
        <table>
            <thead>
                <tr>
               <th>Name</th>
               <th>email</th>
               <th>phone</th>
               <th>update</th>
               <th>Delete</th>
                  </tr>
            </thead>
         <tbody>
        {users.map((curUser, index) => 
        (
    <tr key={index}>
        <td>{curUser.username}</td>
        <td>{curUser.email}</td>
        <td>{curUser.phone}</td>
        <td> <Link to={`/admin/users/${curUser._id}/edit`}>Edit</Link></td>
        <td><button onClick={()=> deleteUser(curUser._id)}>Delete</button></td>
       </tr>
      ))}
            </tbody>
        </table>
       

      
       </div>
    </section>
    </>
  );
};
