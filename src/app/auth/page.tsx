import { Suspense } from 'react';
import AuthForm from './AuthForm';
import { Loader2 } from 'lucide-react';

function AuthLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthForm />
    </Suspense>
  );
}
