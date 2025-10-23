import axios from "axios";
import { useEffect, useState } from "react";

interface User {
  id: number;
  email: string;
  fname: string;
  lname: string;
  phonenumber:number,
}

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/auth/get-user`,
        { withCredentials: true }
      );
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Auth fetch error:", err);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    isAuthenticated,
    user,
    loading,
    refetch: fetchUser
  };
};

export default useAuth;