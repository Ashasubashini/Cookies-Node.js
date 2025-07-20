'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/login', { email, password });

      Cookies.remove('categoryClicks');
      Cookies.remove('productClicks');

      const userId = res.data.user.id;
      Cookies.set('accessToken', res.data.accessToken, { expires: 1 });
      Cookies.set('refreshToken', res.data.refreshToken, { expires: 1 });
      const userReadable = `${res.data.user.name} (${res.data.user.email})`;
      Cookies.set('user', userReadable, { expires: 1 });
      Cookies.set('userId', userId, { expires: 1 });

      router.push('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Don't have an account? <a href="/signup">Sign up</a></p>
    </div>
  );
};

export default Login;