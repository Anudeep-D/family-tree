
import { useLogoutMutation } from "@/redux/queries/auth-endpoints";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return <button onClick={handleLogout}>Logout</button>;
};
