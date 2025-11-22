'use client';
import * as React from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/hooks/use-auth';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {AppLogo} from '@/components/icons';
import {Loader2} from 'lucide-react';
import {motion} from 'framer-motion';

// Official Multi-colored Google "G" Logo
function GoogleColorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
      <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
  );
}

export default function LoginPage() {
  const {user, signInWithGoogle, loading} = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
        await signInWithGoogle();
    } catch (error) {
        console.error("Login failed", error);
        setIsSubmitting(false);
    }
  };
  
  if (loading || user) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent p-4">
      <motion.div
        initial={{opacity: 0, y: 10}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.5}}
        className="w-full max-w-sm"
      >
        <Card className="border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AppLogo className="h-12 w-12" />
            </div>
            <CardTitle className="text-2xl font-heading">Liorea</CardTitle>
            <CardDescription>
              Your cozy corner to study & connect.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 px-8">
            <div className="grid gap-4">
                {/* Smaller, Standard Google Button */}
                <Button 
                    className="relative w-full h-11 p-0.5 bg-[#4285F4] hover:bg-[#3367D6] text-white border-none rounded-[2px] shadow-md transition-all group overflow-hidden" 
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                >
                    <div className="absolute left-0.5 top-0.5 bottom-0.5 aspect-square bg-white rounded-[1px] flex items-center justify-center z-10">
                        {isSubmitting ? (
                            <Loader2 className="h-5 w-5 text-[#4285F4] animate-spin" />
                        ) : (
                            <GoogleColorIcon className="h-5 w-5" />
                        )}
                    </div>
                    <span className="w-full text-center font-medium text-sm pl-10 tracking-wide font-sans">
                        Sign up with Google
                    </span>
                </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}