import { Button } from './Ui/Button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './Ui/Card';
import { Label } from './Ui/Label';

export default function UserForm({
  onSubmit,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Card className="bg-accent p-4 shadow-xl max-w-[40%]">
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
          <div className="p-3">
            <Label htmlFor="username">How should people call you?</Label>
            <input
              type="text"
              name="username"
              className="rounded-md mx-2 p-3 text-black"
            />
          </div>
          <div className="p-3">
            <Label htmlFor="url">
              Enter your favourite youtube video (url)
            </Label>
            <input
              type="text"
              name="url"
              className="rounded-md mx-2 p-3 text-black"
            />
          </div>
          <div className="p-4"></div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="join-form"
          className="rounded-md bg-black text-white text-lg w-36 p-2 float-right"
        >
          Start
        </Button>
      </CardFooter>
    </Card>
  );
}
