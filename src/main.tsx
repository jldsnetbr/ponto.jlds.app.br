import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProvedorAutenticacao } from '@/hooks/useAutenticacao';
import { ToastProvider } from '@/components/ui';
import './index.css';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ProvedorAutenticacao>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ProvedorAutenticacao>
    </QueryClientProvider>
  </React.StrictMode>
);