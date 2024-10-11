// External imports
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { StarIcon, TrashIcon } from 'lucide-react';
import { toast } from 'sonner';

// Internal imports
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
// Alert dialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/**
 * The MyAccount page component.
 * This page contatins navigation to the ratings page and a button to delete the account.
 * @returns {JSX.Element} - The MyAccount page component.
 */
export default function MyAccount() {
  const navigate = useNavigate();
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });

  const [confirmText, setConfirmText] = useState('');
  async function handleDelete() {
    try {
      await axiosInstance.post(
        '/delete_user',
        {
          password: confirmText,
        },
        {
          withCredentials: true,
        }
      );
      navigate('/login');
      toast.success('Account deleted');
      console.log('Account deleted');
      setConfirmText('');
    } catch (error) {
      toast.error('Error deleting account. Check if your password is correct');
      setConfirmText('');
      console.error(error);
    }
  }

  return (
    <div className="w-full h-full md:mt-12 mt-4 flex items-center justify-center">
      <Toaster richColors />
      <Card className="w-[300px] sm:w-[400px] ">
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-100"
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="mt-4">
                <Input
                  placeholder="Type your password to confirm"
                  type="password"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  className="w-full"
                />
              </div>
              <AlertDialogFooter className="mt-4">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={confirmText.length < 8}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
