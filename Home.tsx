import { useState, useEffect } from 'react';
import { useCreateUser, useListUsers, type User } from '@workspace/api-client-react';

// Stub auth hook that uses localStorage and the users API
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { mutateAsync: createUser } = useCreateUser();
  const { data: users } = useListUsers();

  useEffect(() => {
    const storedUserId = localStorage.getItem('codecollab_user_id');
    
    if (storedUserId && users) {
      const foundUser = users.find(u => u.id === storedUserId);
      if (foundUser) {
        setUser(foundUser);
      }
    }
    setIsLoading(false);
  }, [users]);

  const login = async (username: string) => {
    try {
      // Check if user exists (simplification for stub auth)
      let existingUser = users?.find(u => u.username.toLowerCase() === username.toLowerCase());
      
      if (!existingUser) {
        existingUser = await createUser({ data: { username, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}` } });
      }
      
      localStorage.setItem('codecollab_user_id', existingUser.id);
      setUser(existingUser);
      return true;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('codecollab_user_id');
    setUser(null);
  };

  return { user, isLoading, login, logout };
}
