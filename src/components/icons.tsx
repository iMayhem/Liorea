import Link from 'next/link';
import { cn } from '@/lib/utils';


export const AppLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-primary"
    {...props}
  >
    <path
      d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2V3z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7V3z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
     <path
      d="m9 12 2 2 4-4"
      stroke="hsl(var(--background))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ChatIcon = (props: React.SVGProps<SVGSVGElement> & { showDot?: boolean }) => {
    const { showDot, className, ...rest } = props;
    return (
        <div className={cn("relative", className)}>
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                {...rest}
            >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            {showDot && (
                <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-white/50 backdrop-blur-sm ring-1 ring-white/20" />
            )}
        </div>
    );
};

export const SkullIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <circle cx="9" cy="12" r="1" />
        <circle cx="15" cy="12" r="1" />
        <path d="M8 20v2h8v-2" />
        <path d="M12.5 17.5c-1.5-1.5-3-1.5-4.5 0" />
        <path d="M16 20a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2" />
        <path d="M16 20a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2" />
        <path d="M12 2c-5.52 0-10 4.48-10 10 0 4.42 2.86 8.17 6.84 9.5" />
        <path d="M12 2c5.52 0 10 4.48 10 10 0 4.42-2.86 8.17-6.84 9.5" />
    </svg>
);
