import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'components/Ui/Card';
import { Button } from './Ui/Button';
import { Label } from './Ui/Label';

export default function Login({
  onSubmit,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Card className="shadow-lg bg-accent">
      <CardHeader>
        <CardTitle className="text-3xl">Start your shared channel</CardTitle>
        <CardDescription>Let's begin choosing your list title</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(e);
          }}
          id="login-form"
        >
          <div className="p-3">
            <Label htmlFor="list-title">Enter the title of your list</Label>
            <input
              type="text"
              name="list-title"
              className="rounded-md mx-2 p-3 text-black"
            />
          </div>
          <div className="p-3">
            <Label htmlFor="subject">Enter the subject of your list</Label>
            <input
              type="text"
              name="subject"
              className="rounded-md mx-2 p-3 text-black"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="p-4">
        <Button
          variant="outline"
          type="submit"
          form="login-form"
          className="rounded-md bg-black text-white text-lg w-36 p-2 float-right"
        >
          Start
        </Button>
      </CardFooter>
    </Card>
  );
}
