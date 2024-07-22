import Router from 'utils/router';
import { BrowserRouter } from 'react-router-dom';
import ThemeProvider from 'providers/theme-providers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';

export const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <BrowserRouter>
            <Router />
          </BrowserRouter>
        </SnackbarProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
