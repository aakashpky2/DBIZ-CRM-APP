import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

const isGstPath =
  window.location.pathname === '/gst' ||
  window.location.pathname.startsWith('/gst/');

async function bootstrap() {
  // Load only the active application's global stylesheet. Loading both causes
  // the GST reset rules to override the CRM/Tailwind design and vice versa.
  if (isGstPath) {
    await import('./gst/index.css');
  } else {
    await import('./crm/index.css');
  }

  const App = isGstPath
    ? lazy(() => import('./gst/App.jsx'))
    : lazy(() => import('./crm/App.jsx'));

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <Suspense fallback={<div style={{ padding: 24 }}>Loading application…</div>}>
        <App />
      </Suspense>
    </StrictMode>,
  );
}

bootstrap().catch((error) => {
  console.error('Failed to start the combined frontend:', error);
});
