import { Button } from 'components/Ui/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from 'utils/routes';
import { RefreshCcw, Share2, BadgeCheck, CirclePlay } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  function navigateToLogin() {
    navigate(ROUTES.LOGIN);
  }

  return (
    <div className="bg-background">
      <div className="flex justify-center items-center h-screen">
        <div className="p-6 rounded-lg flex justify-center items-center flex-col lg:w-1/2 mx-auto">
          <p className="text-5xl">
            <RefreshCcw className={'w-12 h-12 lg:w-24 lg:h-24'} />
          </p>
          <h1 className="text-primary text-3xl md:text-5xl lg:text-6xl m-8 text-center">
            Sync Youtube videos with your friends
          </h1>{' '}
          <ul className="flex flex-col justify-center items-center mb-6">
            <li className="flex gap-2 m-3 md:text-xl">
              <BadgeCheck /> Create channel
            </li>
            <li className="flex gap-2 m-3 md:text-xl">
              <Share2 /> Share it with whoever you want
            </li>
            <li className="flex gap-2 m-3 md:text-xl">
              <CirclePlay /> Enjoy sync youtube videos
            </li>
          </ul>
          <Button
            size="lg"
            onClick={navigateToLogin}
            className="text-md lg:text-xl"
          >
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}
