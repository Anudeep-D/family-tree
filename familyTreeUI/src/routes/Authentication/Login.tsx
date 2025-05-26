import { useLoginWithGoogleMutation } from "@/redux/queries/auth-endpoints";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [loginWithGoogle] = useLoginWithGoogleMutation();
  const navigate = useNavigate();

  const handleLogin = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        const user = await loginWithGoogle(credentialResponse.credential).unwrap();
        console.log("Logged in:", user);
        navigate("/");
      } catch (err) {
        console.error("Login failed", err);
      }
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <GoogleLogin onSuccess={handleLogin} onError={() => console.error("Google login failed")} />
    </div>
  );
};

export default LoginPage;
