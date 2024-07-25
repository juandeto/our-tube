import { User } from 'typing/shared';
import { Avatar, AvatarFallback, AvatarImage } from './Ui/Avatar';

export default function UserList({
  users,
  username,
}: {
  users: User[];
  username: string;
}) {
  return (
    <ul className="h-96 overflow-y-auto">
      <li className="border-b-2 border-gray-600 p-2 flex justify-between">
        <span className="text-xl text-gray-500 mr-6"></span>
        <span className="text-xl text-gray-500 mr-6">Username</span>

        <span className="text-xl text-gray-500 font-bold">Status</span>
      </li>
      {users.map((user) => (
        <li key={user.id} className="p-4 flex gap-4 justify-between">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span
            className={`text-xl ${
              username === user.username ? 'text-red-500' : 'text-gray-500'
            } mr-6`}
          >
            {user.username}
          </span>
          <span className="text-xl text-gray-500 font-bold">
            {user.host ? 'Host' : ''}
          </span>
        </li>
      ))}
    </ul>
  );
}
