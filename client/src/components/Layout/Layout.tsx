import { ModeToggle } from 'components/ThemeToggle';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <header className="h-20 shadow-md p-6 flex justify-end">
        <ModeToggle />
      </header>
      <Outlet />
      <footer></footer>
    </>
  );
}
