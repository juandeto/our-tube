import { Button } from 'components/Ui/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from 'utils/routes';

export default function Landing() {
  const navigate = useNavigate();

  function navigateToLogin() {
    navigate(ROUTES.LOGIN);
  }

  return (
    <div className="bg-background">
      <div className="flex justify-center items-center h-screen">
        <div className="p-6 rounded-lg flex justify-center items-center flex-col w-1/2 mx-auto">
          <p className="text-5xl">
            <span className="px-4">{'{'}</span>
            <span className="px-4">{'}'}</span>
          </p>
          <h1 className="text-primary text-6xl m-8">Out there in the woods</h1>{' '}
          <Button size="lg" onClick={navigateToLogin} className="text-xl">
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}
