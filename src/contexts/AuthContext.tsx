import { createContext, ReactNode, useEffect, useState } from "react";
import { firebase, auth } from "../services/firebase";

type User = {
  id: string;
  name: string;
  avatar: string;
}

type AuthContextType = {
  user: User | undefined;
  signInWithGoogle: () => Promise<void>;
}

export const AuthContext = createContext({} as AuthContextType)

type AuthContextProviderProps = {
  children: ReactNode;
}

export function AuthContextProvider(props: AuthContextProviderProps) {
  const [ user, setUser ] = useState<User>();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user){
        const { displayName, photoURL, uid } = user

      if (!displayName || !photoURL){
        throw new Error ('Missing information from Google Account.');
      }

        setUser({ 
          id: uid,
          name: displayName,
          avatar: photoURL
        })
      }
    })

    return () => {
      unsubscribe();
    }
  }, [])

  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();

    const result = await auth.signInWithPopup(provider);

    if (result.user) {
      const { displayName, photoURL, uid } = result.user

      if (!displayName || !photoURL){
        throw new Error ('Missing information from Google Account.');
      }

      setUser({ 
        id: uid,
        name: displayName,
        avatar: photoURL
      })
    }
  }
// criar um botão para chamar essa função para deslogar.
// async function signOut() {
//   await auth.signOut();
// }

  return(
    <AuthContext.Provider value={{ user, signInWithGoogle }}>
      {props.children}
    </AuthContext.Provider>
  );
}