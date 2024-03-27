import { createContext, useContext } from 'react';
import { User } from '../scripts/user';

export interface UserContextProps {
  user: User | undefined;
  setUser: (user: User | undefined) => void; 
}

const UserContext = createContext<UserContextProps>({ user: undefined, setUser: () => {} });

export const useUser = () => useContext(UserContext);

export default UserContext;
