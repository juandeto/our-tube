import { User } from 'typing/shared';
import { Card, CardFooter, CardHeader, CardTitle } from './Ui/Card';
import { Button } from './Ui/Button';
import UserList from './UserList';

export default function JoiningUsers({
  users,
  username,
  handleOnStart,
  isHost,
}: {
  users: User[];
  username: string;
  handleOnStart: () => void;
  isHost: boolean;
}) {
  return (
    <Card className="w-1/2 min-h-1/2 shadow-md rounded-md p-6">
      <CardHeader>
        <CardTitle className="text-3xl text-gray-600 my-4">
          Users connecting...
        </CardTitle>
      </CardHeader>
      <UserList users={users} username={username} />
      <CardFooter>
        {!isHost ? (
          <div className="py-4 w-full">
            <p className="text-xl text-center w-full animate-pulse">
              Waiting for host to start...
            </p>
          </div>
        ) : (
          <div className="pt-8 flex gap-3 items-center justify-end w-full">
            <p>Wait for others and then</p>
            <Button onClick={handleOnStart}>Start playing</Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
