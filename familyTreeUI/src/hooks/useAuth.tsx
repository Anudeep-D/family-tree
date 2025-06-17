import {
  useLoginWithGoogleMutation,
  useFetchSessionUserQuery,
  useLogoutMutation,
} from "@/redux/queries/auth-endpoints";
import { User } from "@/types/entityTypes";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { supabase } from "@/config/supabaseClient"; // Import supabase client

// Define the new SessionData interface
interface SessionData {
  user: User;
  idToken: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (googleCredentialToken: string) => Promise<void>;
  logout: () => Promise<void>;
  redirectPath: string | null;
  setRedirectPath: (path: string | null) => void;
  idToken: string | null;
  setIdToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [localIsAuthenticated, setLocalIsAuthenticated] =
    useState<boolean>(false);
  const [localIsLoading, setLocalIsLoading] = useState<boolean>(true);
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);

  const [rtkLoginWithGoogle, { isLoading: isLoginMutationLoading }] =
    useLoginWithGoogleMutation();
  const {
    data: sessionUser,
    error: sessionError,
    isLoading: isInitialSessionLoading,
    isFetching: isSessionFetching,
    refetch: refetchSession,
  } = useFetchSessionUserQuery();
  const [rtkLogout, { isLoading: isLogoutMutationLoading }] =
    useLogoutMutation();

  const contextIsLoading =
    isLoginMutationLoading ||
    isInitialSessionLoading ||
    isSessionFetching ||
    isLogoutMutationLoading;

  useEffect(() => {
    if (contextIsLoading) return;

    // Adjust to use SessionData type for sessionUser
    const currentSessionUser = sessionUser as SessionData | undefined;

    if (currentSessionUser && currentSessionUser.user) {
      setLocalUser(currentSessionUser.user);
      setIdToken(currentSessionUser.idToken || null);
      setLocalIsAuthenticated(true);
      setLocalIsLoading(false);
      // Attempt to refresh the Supabase client's session
      // This is useful if auth is primarily cookie-based and the client needs to sync.
      supabase.auth.refreshSession().then(({ error }) => {
        if (error) {
          console.error("Error refreshing Supabase session:", error.message);
        } else {
          console.log("Supabase session refreshed successfully after user session update.");
        }
      });
    } else if (sessionError) {
      console.error("Session fetch error:", sessionError);
      setLocalUser(null);
      setIdToken(null);
      setLocalIsAuthenticated(false);
      setLocalIsLoading(false);
      // Also clear Supabase session on error
      supabase.auth.signOut().catch(err => console.error("Error signing out Supabase session on error:", err.message));
    } else {
      // This case handles when sessionUser is null and no error (e.g., initial state or after logout)
      setLocalUser(null);
      setIdToken(null);
      setLocalIsAuthenticated(false);
      setLocalIsLoading(false); // Ensure loading is set to false
      // Clear Supabase session when local session is cleared (e.g., after logout)
      supabase.auth.signOut().catch(err => console.error("Error signing out Supabase session on logout:", err.message));
    }
  }, [sessionUser, sessionError, isInitialSessionLoading, isSessionFetching, contextIsLoading]);

  const login = useCallback(
    async (googleCredentialToken: string) => {
      try {
        setLocalIsLoading(true);
        const user = await rtkLoginWithGoogle(
          googleCredentialToken as any
        ).unwrap();

        setLocalUser(user); 
        setLocalIsAuthenticated(true);
        setIdToken(googleCredentialToken); // This might be the Google ID token
        setLocalIsLoading(false);
        await refetchSession(); // This will trigger the useEffect above, which now calls refreshSession
        
        // Explicitly try to get the new session for Supabase after login and refetch
        // This ensures the client syncs up if cookies were updated.
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.error("Error getting Supabase session post-login:", error.message);
        } else if (session) {
            console.log("Supabase client session established post-login:", session);
            // If your backend provides a direct Supabase access token with the user object,
            // you could use supabase.auth.setSession here.
            // e.g., if user.supabaseAccessToken and user.supabaseRefreshToken are available:
            // await supabase.auth.setSession({
            //   access_token: user.supabaseAccessToken,
            //   refresh_token: user.supabaseRefreshToken,
            // });
        } else {
            console.log("No active Supabase session found post-login by getSession, relying on refreshSession in useEffect.");
        }

      } catch (error) {
        console.error("Login failed via RTK query:", error);
        setLocalUser(null);
        setLocalIsAuthenticated(false);
        setIdToken(null);
        setLocalIsLoading(false);
        throw error;
      }
    },
    [rtkLoginWithGoogle, refetchSession]
  );

  const logout = useCallback(async () => {
    try {
      setLocalIsLoading(true);
      await rtkLogout().unwrap();
      // Backend clears HttpOnly cookie
    } catch (error) {
      console.error("RTK Logout mutation failed:", error);
    } finally {
      setLocalUser(null);
      setLocalIsAuthenticated(false);
      setIdToken(null);
      setLocalIsLoading(false);
      // refetchSession will be called, which in turn will call supabase.auth.signOut() in the useEffect
      await refetchSession(); 
    }
  }, [rtkLogout, refetchSession]);

  // Wrap setRedirectPath with useCallback (though useState setters are stable)
  const stableSetRedirectPath = useCallback((path: string | null) => {
    setRedirectPath(path);
  }, []);

  useEffect(() => {
    const handleAuthErrorLogout = () => {
      logout();
    };
    window.addEventListener("auth-error-logout", handleAuthErrorLogout);
    return () => {
      window.removeEventListener("auth-error-logout", handleAuthErrorLogout);
    };
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: localIsAuthenticated,
        isLoading: localIsLoading,
        user: localUser,
        login,
        logout,
        redirectPath,
        setRedirectPath: stableSetRedirectPath,
        idToken: idToken,
        setIdToken: setIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
