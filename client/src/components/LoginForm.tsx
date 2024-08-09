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
import { Input } from './Ui/Input';

export default function Login({
  onSubmit,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Card className="shadow-lg bg-accent h-[70%] flex flex-col justify-center md:block md:h-auto">
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
          <div className="">
            <Label htmlFor="list-title" className="text-md">
              Enter the title of your channel
            </Label>
            <Input
              type="text"
              name="list-title"
              className="rounded-md  text-primary"
            />
          </div>
          <div className="mt-6">
            <Label htmlFor="subject" className="text-md">
              Enter the subject of your channe
            </Label>
            <Input
              type="text"
              name="subject"
              className="rounded-md  text-primary"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="p-4 flex justify-center md:justify-end">
        <Button
          variant="default"
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
