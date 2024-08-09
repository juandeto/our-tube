import { Button } from './Ui/Button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './Ui/Card';
import { Input } from './Ui/Input';
import { Label } from './Ui/Label';

export default function UserForm({
  onSubmit,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Card className="shadow-lg bg-accent h-[70%] flex flex-col justify-center md:block md:h-auto">
      <CardHeader>
        <CardTitle>Join in</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(e);
          }}
          id="join-form"
        >
          <div className="">
            <Label htmlFor="username" className="text-md">
              How should people call you?
            </Label>
            <Input
              type="text"
              name="username"
              className="rounded-md  text-primary"
            />
          </div>
          <div className="mt-6">
            <Label htmlFor="url" className="text-md">
              Enter your favourite youtube video (url)
            </Label>
            <Input
              type="text"
              name="url"
              className="rounded-md  text-primary"
            />
          </div>
          <div className="p-4"></div>
        </form>
      </CardContent>
      <CardFooter className="p-4 flex justify-center md:justify-end">
        <Button
          type="submit"
          form="join-form"
          className="rounded-md bg-black text-white text-lg w-36 float-right"
        >
          Start
        </Button>
      </CardFooter>
    </Card>
  );
}
