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
    } else if (sessionError) {
      console.error("Session fetch error:", sessionError);
      setLocalUser(null);
      setIdToken(null);
      setLocalIsAuthenticated(false);
      setLocalIsLoading(false);
    } else {
      // This case handles when sessionUser is null and no error (e.g., initial state or after logout)
      setLocalUser(null);
      setIdToken(null);
      setLocalIsAuthenticated(false);
      setLocalIsLoading(false); // Ensure loading is set to false
    }
  }, [sessionUser, sessionError, isInitialSessionLoading, isSessionFetching, contextIsLoading]);

  const login = useCallback(
    async (googleCredentialToken: string) => {
      try {
        setLocalIsLoading(true);
        // Expect User object directly from the mutation, backend sets HttpOnly cookie
        const user = await rtkLoginWithGoogle(
          googleCredentialToken as any
        ).unwrap();

        // HttpOnly cookie is set by the backend and handled by the browser

        setLocalUser(user); // Set user from the direct response
        setLocalIsAuthenticated(true);
        setIdToken(googleCredentialToken);
        setLocalIsLoading(false);
        await refetchSession();
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
