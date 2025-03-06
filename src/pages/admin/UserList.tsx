import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt?: string;
}

const UserList = () => {
  console.log('UserList component mounted');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const getAllSignups = async () => {
    try {
      console.log('Fetching users...');
      const q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      console.log('Raw snapshot:', querySnapshot.docs.length, 'users found');
      
      const users = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('User data:', data);
        return {
          id: doc.id,
          ...data
        };
      }) as User[];
      
      setUsers(users);
    } catch (error) {
      console.error('Error getting users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllSignups();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User Signups</h1>
      <div className="space-y-4">
        {users.map(user => (
          <div key={user.id} className="border p-4 rounded">
            <p>Name: {user.firstName} {user.lastName}</p>
            <p>Email: {user.email}</p>
            <p>Phone: {user.phone}</p>
            <p>Signed up: {user.createdAt}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList; 