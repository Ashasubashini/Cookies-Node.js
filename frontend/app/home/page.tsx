'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { SERVER_URI } from '../config';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number;
  created_at: string;
}

const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  const [user, setUser] = useState<string | null>(null);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const userCookie = Cookies.get('user');
    const userId = Cookies.get('userId');

    if (!userCookie || !userId) {
      router.push('/login');
      return;
    }

    setUser(userCookie);

    axios.get(`${SERVER_URI}/categories`)
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));

    axios.get(`${SERVER_URI}/recommendations?userId=${userId}`)
      .then(res => setRecommended(res.data))
      .catch(() => setRecommended([]));

    const cookieName = `categoryClicks_${userId}`;
    const cookie = Cookies.get(cookieName);
    setClickCounts(cookie ? JSON.parse(cookie) : {});
  }, [router]);

  const handleCategoryClick = (category: Category) => {
    const userId = Cookies.get('userId');
    if (!userId) return;

    const newCounts = { ...clickCounts, [category.name]: (clickCounts[category.name] || 0) + 1 };
    setClickCounts(newCounts);

    const cookieName = `categoryClicks_${userId}`;
    Cookies.set(cookieName, JSON.stringify(newCounts), { expires: 7 });

    const productClicksCookie = Cookies.get(`productClicks_${userId}`);
    const productClicks = productClicksCookie ? JSON.parse(productClicksCookie) : {};

    axios.post(`${SERVER_URI}/save-clicks`, {
      userId,
      categoryClicks: newCounts,
      productClicks
    }).catch(err => {
      console.error('Failed to save clicks:', err);
    });

    router.push(`/products/${category.id}`);
  };

  const Logout = () => {
    const userId = Cookies.get('userId');
    const refreshToken = Cookies.get('refreshToken');

    if (userId) {
      Cookies.remove(`categoryClicks_${userId}`);
      Cookies.remove(`productClicks_${userId}`);
    }

    Object.keys(Cookies.get()).forEach(key => {
      if (key.startsWith('categoryClicks_') || key.startsWith('productClicks_')) {
        Cookies.remove(key);
      }
    });

    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('user');
    Cookies.remove('userId');

    if (refreshToken) {
      axios.delete(`${SERVER_URI}/logout`, { data: { refreshToken } })
        .catch(err => console.error('Logout error:', err));
    }

    router.push('/login');
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <div className="page-header">
        <h2>Categories</h2>
        <div>
          {user && <span className="welcome-message" style={{ marginRight: '1rem' }}>Welcome, {user}!</span>}
          <button className="logout-btn" onClick={Logout}>
            Logout
          </button>
        </div>
      </div>

      {recommended.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3>You may like</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {recommended.map(prod => (
              <li key={prod.id} className="item-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><strong>{prod.name}</strong> - ${prod.price}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {categories.map(cat => (
          <li
            key={cat.id}
            className="item-card"
            onClick={() => handleCategoryClick(cat)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{cat.name}</strong>
              <span className="click-counter">Clicked: {clickCounts[cat.name] || 0}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;