import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarIcon, TrashIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Component() {
  const navigate = useNavigate();
  return (
    <div className="w-full h-full mt-12 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>My Account</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              navigate('/rating');
            }}
          >
            <StarIcon className="mr-2 h-4 w-4" />
            Ratings
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-100"
            onClick={() =>
              alert('Are you sure you want to delete your account?')
            }
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
