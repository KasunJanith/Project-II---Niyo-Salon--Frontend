import axios from "axios";
import { useEffect, useState } from "react";

export default function useUserData() {
  const [user, setUser] = useState<{
    id: number;
    password: string;
    phoneNumber: string;
    role: string;
    username: string;
  }>({
    id: 0,
    password: "",
    phoneNumber: "",
    role: "",
    username: "",
  });

  useEffect(() => {
    const handleAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found in localStorage. User not authenticated.");
        setUser({ id: -1, password: "", phoneNumber: "", role: "", username: "" });
        return;
      }

      try {
        const response = await axios.get("http://localhost:8080/api/auth/me", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        setUser(response.data);
        console.log("User data fetched successfully:", response.data);
      } catch (err) {
        console.error("Authentication error:", err);
        setUser({
          id: -1,
          password: "",
          phoneNumber: "",
          role: "",
          username: "",
        });
      }
    };

    handleAuth();
  }, []);

  return user;
}