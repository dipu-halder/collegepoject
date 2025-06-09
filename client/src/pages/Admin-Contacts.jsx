import { useAuth } from "../store/auth"
import { useEffect, useState } from "react"

import {  toast } from 'react-toastify';

export const AdminContacts =() =>{
    const [contact, setcontact] = useState([]);
    const { authorizationToken } = useAuth();

    const AllgetContactData = async () =>{
        try {
        
        const response = await fetch("http://localhost:5000/api/admin/contacts",{
            method: "GET",
            headers: {
                    Authorization: authorizationToken,
            }

        });
        const data = await response.json();
        console.log(data);
        if(response.ok){
            setcontact(data)
            
            
        }

    } catch (error) {
           console.log(error);
           
       }
    }

    const deleteContact = async(id) => {
        try {
            
               const response = await fetch(`http://localhost:5000/api/admin/contacts/delete/${id}`,{
                method: "DELETE",
                 headers: {
          Authorization: authorizationToken,
        }

            })
 

             if (response.ok){
                AllgetContactData()
                 toast.success("Updated successfully", {
                                  position: "top-right",
                                  autoClose: 3000,
                                  hideProgressBar: false,
                                  closeOnClick: true,
                                  pauseOnHover: true,
                                  draggable: true,
                                  progress: undefined,
                                  theme: "light",});
                
             }
            
              } catch (error) {
            console.log(error);
            
            
        }
    }

    useEffect(() => { 
        AllgetContactData();    
    },[])
    return ( <>
   <section className="admin_users-section">
    <div className="container">
        <h1>contact</h1>
    </div>
    <div className="container admin-users">
        <table>
            <thead>
                <tr>
                    <th>username</th>
                    <th>email</th>
                    <th>message</th>
                    <th>Delete</th>
                </tr>
            </thead>
            <tbody>
           {contact.map((curCont, index) => 
            (
        <tr key={index}>
            <td>{curCont.username}</td>  
            <td>{curCont.email}</td>
            <td>{curCont.message}</td>
            <td><button className="btn" onClick={()=> deleteContact(curCont._id)}>Delete</button></td>
           </tr>
          ))}
            </tbody>
        </table>
    </div>

    
    </section> 
    
    </>)
}