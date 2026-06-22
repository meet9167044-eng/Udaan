export type Session = {
  role: "borrower" | "lender";
  name: string;
};

const SESSION_KEY = "udaan_session";

export const getSession = (): Session | null => {
  if (typeof window === "undefined") return null;
  
  try {
    const item = localStorage.getItem(SESSION_KEY);
    if (item) {
      return JSON.parse(item) as Session;
    }
  } catch (error) {
    console.error("Error parsing session", error);
  }
  
  // Default fallback for hackathon demo if no session exists
  return {
    role: "borrower",
    name: "Raju Sharma"
  };
};

export const clearSession = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
};

export const getBorrowerName = (): string => {
  const session = getSession();
  if (session && session.role === "borrower") {
    return session.name;
  }
  return "Raju Sharma"; // fallback
};

export const login = (session: Session): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
};
