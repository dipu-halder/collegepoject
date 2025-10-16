
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null if not logged in
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [isLoading, setIsLoading] = useState(true);

  // Derived values
  const isLoggedin = !!token;
  const authorizationToken = token ? `Bearer ${token}` : null;

  // ✅ Store raw token in LS
  const storeTokenInLS = useCallback((serverToken) => {
    if (!serverToken) return;
    localStorage.setItem("token", serverToken);
    setToken(serverToken);
  }, []);

  // ✅ Logout
  const LogoutUser = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  }, []);

  // ✅ Safe JSON parsing
  const safeJson = async (res) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  // ✅ Authenticate user with backend
  const userAuthentication = useCallback(async () => {
    if (!authorizationToken) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationToken,
        },
      });

      if (!res.ok) {
        console.warn("Auth failed:", res.status, res.statusText);
        LogoutUser();
        setIsLoading(false);
        return null;
      }

      const data = await safeJson(res);

      if (data?.userData) {
        setUser(data.userData);
        setIsLoading(false);
        return data.userData;
      } else {
        console.warn("No userData in response", data);
        LogoutUser();
        setIsLoading(false);
        return null;
      }
    } catch (err) {
      console.error("userAuthentication error:", err);
      LogoutUser();
      setIsLoading(false);
      return null;
    }
  }, [authorizationToken, LogoutUser]);

  // Load user whenever token changes
  useEffect(() => {
    if (token) {
      userAuthentication();
    } else {
      setIsLoading(false);
    }
  }, [token, userAuthentication]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedin,
        storeTokenInLS,
        LogoutUser,
        userAuthentication,

        user,
        token,
        authorizationToken,
        isLoading,
        setUser, // allow manual user update
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
