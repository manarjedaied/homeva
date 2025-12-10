import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetails } from './pages/ProductDetails';
import { Orders } from './pages/Orders';
import './i18n/config';
import './styles/global.css';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </Layout>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 5000,
            style: {
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px 20px',
              fontSize: '16px',
              fontWeight: '500',
            },
            success: {
              iconTheme: {
                primary: '#4caf50',
                secondary: '#fff',
              },
              duration: 5000,
            },
            error: {
              iconTheme: {
                primary: '#f44336',
                secondary: '#fff',
              },
              duration: 5000,
            },
          }}
        />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

