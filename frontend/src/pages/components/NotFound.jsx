// External imports
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

// Internal imports
import { Button } from '@/components/ui/button';

/**
 * The 404 page component
 * @returns {JSX.Element} - The 404 page component
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[800px] px-4">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-gray-800 mb-4">404</h1>
        <p className="text-2xl font-semibold text-gray-600 mb-8">
          Oops! Page not found
        </p>
        <div className="mb-8">
          <svg
            className="w-64 h-64 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild>
          <Link to="/" className="inline-flex items-center">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
