type GoatLogoMarkProps = {
  size?: number;
  className?: string;
};

export function GoatLogoMark({ size = 32, className }: GoatLogoMarkProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="32" height="32" rx="10" fill="rgba(67, 205, 120, 0.22)" />
      <path
        d="M9 14c0-3.3 2.7-6 6-6 1.2 0 2.3.4 3.2 1 1-1.5 2.6-2.5 4.3-2.5 3 0 5.5 2.4 5.5 5.4 0 .8-.2 1.6-.5 2.3.8.7 1.2 1.7 1.2 2.8 0 2.2-1.8 4-4 4h-1.1c-.6 1.2-1.8 2-3.2 2H13.5c-2.5 0-4.5-2-4.5-4.5 0-1 .3-1.9.9-2.6C9.3 16.4 9 15.2 9 14Z"
        fill="#f8fbff"
      />
      <path
        d="M11.5 10.5c-.8 0-1.5.4-2 1-.3-.9-1.1-1.5-2-1.5-1.2 0-2.2 1-2.2 2.2 0 .5.2 1 .5 1.4M20.5 9.5c.7 0 1.3.3 1.7.8.4-.6 1.1-1 1.8-1 1.3 0 2.3 1 2.3 2.3"
        stroke="#43cd78"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="13.5" cy="14.5" r="1" fill="#1a3a5c" />
      <circle cx="18.5" cy="14.5" r="1" fill="#1a3a5c" />
      <path
        d="M14.5 17.5c.8.5 1.7.5 2.5 0"
        stroke="#1a3a5c"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}
