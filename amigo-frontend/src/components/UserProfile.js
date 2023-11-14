// src/components/UserProfile.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';

function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        db.collection('users')
          .doc(authUser.uid)
          .get()
          .then((doc) => {
            setUser(doc.data());
          });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>User Profile</h2>
      <p>Email: {user.email}</p>
      <p>Name: {user.displayName}</p>
      {/* Add more profile information as needed */}
    </div>
  );
}

export default UserProfile;
