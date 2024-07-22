import { Button } from 'components/Ui/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from 'utils/routes';

export default function ListEnded() {
  const navigate = useNavigate();
  return (
    <div className="h-screen">
      <div className="container flex justify-center items-center">
        <h1 className="text-2xl">Your list ended</h1>
        <div className="p-8">
          <p className="px-4">
            <Button onClick={() => navigate(ROUTES.LOGIN)}>
              Start a new list
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
