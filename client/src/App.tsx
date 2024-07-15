import Router from 'utils/router';
import { BrowserRouter } from 'react-router-dom';
import ThemeProvider from 'providers/theme-providers';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
