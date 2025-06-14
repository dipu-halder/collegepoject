import { createContext, useContext,useEffect,useState } from "react";


export const AuthContext = createContext();


export const  AuthProvider = ({children}) =>{
    
  const [user, setUser] = useState("");
    const [token, setToken] = useState(  localStorage.getItem("token"))
    const  authorizationToken =`Bearer ${token}`;
      const [isLoading, setIsLoading] = useState(true);
  // Store token and update state
  const storeTokenInLS = (serverToken) => {
    localStorage.setItem("token", serverToken);
    setToken(serverToken);
  };

  let isLoggedin = !!token;

  const LogoutUser =() =>{
    setToken("");
    return localStorage.removeItem("token")
  };

  const userAuthentication = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user`, {
        method: "GET",
    headers: {
  "Content-Type": "application/json",
  Authorization: authorizationToken,
},
         credentials: "include", 
      });

      if (response.ok) {
        const data = await response.json();
        console.log("User data:", data.userData);
        setUser(data.userData);
        setIsLoading(false);
      } else {
        console.warn("Failed to authenticate user");
        LogoutUser(); // Clear token if invalid
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error during user authentication:", error);
      LogoutUser();
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
  // getServices();
  if (token) {
    userAuthentication();
  } else {
    setIsLoading(false);
  }
}, [token]);


  return (
    <AuthContext.Provider
      value={{
        isLoggedin,
        storeTokenInLS,
        LogoutUser,
        userAuthentication,
        
        user,
        authorizationToken,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};