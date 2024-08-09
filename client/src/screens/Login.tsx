import { createVideoList } from 'services';
import LoginForm from '../components/LoginForm';
import { ListData } from '../typing/shared';
import { generatePath, useNavigate } from 'react-router-dom';
import { ROUTES } from 'utils/routes';

export default function Login() {
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const subject = formData.get('subject') as string;
    const listTitle = formData.get('list-title') as string;

    if (!subject || !listTitle) {
      alert('You need to complete the form to proceed.');
      return;
    }

    const body: ListData = { subject, title: listTitle };

    const data = await createVideoList(body);

    const listPath = await generatePath(ROUTES.CHANNEL, { id: data?.id });

    navigate(listPath);
  }

  return (
    <div className="h-[calc(100vh_-_5rem)] flex justify-center items-center">
      <LoginForm onSubmit={onSubmit} />
    </div>
  );
}
