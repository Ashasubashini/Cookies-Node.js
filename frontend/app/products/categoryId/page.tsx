'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter, useParams } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number;
  created_at: string;
}

const ProductList: React.FC = () => {
  const params = useParams();
  const categoryId = params?.categoryId as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productClicks, setProductClicks] = useState<Record<string, number>>({});
  const [user, setUser] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userCookie = Cookies.get('user');
    const userId = Cookies.get('userId');

    if (!userCookie || !userId) {
      router.push('/login');
      return;
    }

    setUser(userCookie);
    setLoading(true);
    axios.get(`http://localhost:5000/products?categoryId=${categoryId}`)
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
    const cookieName = `productClicks_${userId}`;
    const cookie = Cookies.get(cookieName);
    setProductClicks(cookie ? JSON.parse(cookie) : {});
  }, [categoryId, router]);

  const handleProductClick = (product: Product) => {
    const userId = Cookies.get('userId');
    if (!userId) return;
    const newClicks = { ...productClicks, [product.name]: (productClicks[product.name] || 0) + 1 };
    setProductClicks(newClicks);
    const cookieName = `productClicks_${userId}`;
    Cookies.set(cookieName, JSON.stringify(newClicks), { expires: 7 });
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => router.push('/home')}>Back to Categories</button>
          <h2>Products</h2>
        </div>
        <div>
          {user && <span className="welcome-message" style={{ marginRight: '1rem' }}>Welcome, {user}!</span>}
        </div>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="loading"></div>
          <p>Loading products...</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {products.length === 0 ? (
            <li style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No products found.</li>
          ) : (
            products.map(prod => (
              <li
                key={prod.id}
                className="item-card"
                onClick={() => handleProductClick(prod)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{prod.name}</strong> <span style={{ color: '#888' }}>(${prod.price})</span>
                  </div>
                  <span className="click-counter">
                    Clicks: {productClicks[prod.name] || 0}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default ProductList;