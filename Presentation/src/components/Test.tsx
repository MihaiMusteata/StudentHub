//default test component
import React from 'react';
import { useUser } from '../context/userContext.tsx';

const Test = () => {
  const {user, setUser} = useUser();
  const ShowUser = () => {
    console.log(user);
  };
  return (
    <div>
      <button onClick={ShowUser}>Show User</button>
    </div>
  );
};
export default Test;