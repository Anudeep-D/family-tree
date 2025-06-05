import { useEffect } from 'react';
import { useLoginWithGoogleMutation } from '@/redux/queries/auth-endpoints';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Adjust path if useAuth is elsewhere
import './Login.scss';

const LoginPage = () => {
  // Commenting out the RTK query hook for now, as useAuth.login will handle the logic.
  // We might move the actual Google login API call into the useAuth.login() method.
  // const [loginWithGoogleAPIMutation] = useLoginWithGoogleMutation(); 
  
  const navigate = useNavigate();
  const { isAuthenticated, login, redirectPath, isLoading, setRedirectPath } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const path = redirectPath || '/';
      navigate(path, { replace: true });
      setRedirectPath(null); // Clear the redirect path after using it
    }
  }, [isAuthenticated, isLoading, navigate, redirectPath, setRedirectPath]);

  const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      try {
        // The login function from useAuth should ideally handle the API call and token storage.
        // We pass the credential to it.
        await login(credentialResponse.credential); 
        // Successful login in useAuth will set isAuthenticated.
        // The useEffect above will then handle the redirect.
        // If useEffect doesn't redirect immediately (e.g. state update timing),
        // we can still navigate here as a fallback, but it's better if useEffect handles it.
        // const path = redirectPath || '/';
        // navigate(path, { replace: true }); 
        // setRedirectPath(null);
      } catch (err) {
        console.error('Login failed:', err);
        // Optionally, display an error message to the user on the login page
      }
    } else {
      console.error('Google login failed: No credential returned');
    }
  };

  const handleLoginError = () => {
    console.error('Google login failed');
    // Optionally, display an error message to the user
  };

  // If loading auth state, or if already authenticated and waiting for redirect,
  // show a loading message or nothing to prevent flicker.
  if (isLoading || isAuthenticated) {
    return <div>Loading...</div>; // Or return null
  }

  return (
    <div className="login">
      <h1>Login to FamilyTree</h1>
      <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginError} />
    </div>
  );
};

export default LoginPage;
