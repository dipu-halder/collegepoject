import React, {useState} from "react";
import { useAuth } from "../store/auth";
import '../Css/Contact.css';
import { ToastContainer, toast } from 'react-toastify';

const defaultConatctFormData ={  
   username: "",
  email: "",
  message: "",};
const ContactPage = () => {
     const [contact, setContact] = useState(defaultConatctFormData);
  
      const [userData, setUserData] = useState(true);
  const { user } = useAuth();

 
    if (userData && user) {
      setContact({
        username: user.username,
        email: user.email ,
        message: "",
      });
      setUserData(false);
    }
 

        const handleInput = (e) => {
        const { name, value } = e.target;
     setContact((prevcontact) => ({
          ...prevcontact,
          [name]: value,
        }));
      };
    
        const handleSubmit = async(e) => {
        e.preventDefault();
        console.log(contact);
      try {
    
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/from/contact`,{
      method: "POST",
      headers:{
        "Content-Type": "application/json"
      },
      body:JSON.stringify(contact),
    });
     if(response.ok){
      setContact(defaultConatctFormData);
       toast.success("message successful", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
             theme: "colored",
           
              });
     }
   } catch (error) {
    console.log(error);
    
   }
 

      }
  return (
    // <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
    //   <h2 className="text-2xl font-bold mb-6 text-center">Contact Us</h2>
    //   <form onSubmit={handleSubmit} className="space-y-4"> 

    //     <div>
    //       <label className="block mb-1 font-medium">Username</label>
    //       <input
    //               type="text"
    //             name="username"
    //             placeholder="Enter your user name"
    //             id="username"
    //             value={contact.username}
    //             onChange={handleInput}
    //             autoComplete="off"
    //             required
    //         className="w-full px-4 py-2 border border-gray-300 rounded-md"
    //       />
    //     </div>

    //     <div>
    //       <label className="block mb-1 font-medium">Email</label>
    //       <input
        
    //             type="email"
    //             name="email"
    //             placeholder="Enter your user email"
    //             id="email"
    //             value={contact.email}
    //             onChange={handleInput}
    //             autoComplete="off"
    //             required
    //         className="w-full px-4 py-2 border border-gray-300 rounded-md"
    //       />
    //     </div>

   

    //     <div>
    //       <label className="block mb-1 font-medium">Message</label>
    //        <textarea
    //             name="message"
    //             id="message"
    //             value={contact.message}
    //             onChange={handleInput}
    //             required
    //             autoComplete="off"
    //             cols={30}
    //             rows={10}
    //           ></textarea>
    //     </div>

    //     <button
    //       type="submit"
    //       className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
    //     >
    //       Send
    //     </button>
    //   </form>
    // </div>

     <div class="container">
    {/* <!-- Left: Contact Form --> */}
    <div class="contact-form">
      <h2>Contact us</h2>
      <form onSubmit={handleSubmit}>
        <div class="form-group">
          <label for="username">Username</label>
          <input type="text" id="username" name="username" placeholder="Enter your user name"   value={contact.username}
          onChange={handleInput} required />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input
        
                type="email"
                name="email"
                placeholder="Enter your user email"
                id="email"
                value={contact.email}
                onChange={handleInput}
                autoComplete="off"
                required
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" name="message" rows="6" placeholder="Your message here..."   value={contact.message}
              onChange={handleInput} required></textarea>
        </div>
        <button type="submit">Send</button>
      </form>
    </div>

    {/* <!-- Right: Image and Contact Info --> */}
    <div class="contact-image">
      <img src="/contact.png" alt="Map Icon" />
      <div class="contact-details">
        <div><span>📞</span>123-456-78-90</div>
        <div><span>🌐</span>www.tiffin wala.com</div>
      </div>
    </div>
  </div>
  );
};

export default ContactPage;
