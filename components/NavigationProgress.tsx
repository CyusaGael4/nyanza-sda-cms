"use client";

import Link from "next/link";
import {
  ComponentProps,
  createContext,
  MouseEvent,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { usePathname } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type NavigationProgressValue = {
  startLoading: () => void;
  stopLoading: () => void;
};

const NavigationProgressContext = createContext<NavigationProgressValue | null>(null);

export function NavigationProgressProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  const value = useMemo(
    () => ({
      startLoading: () => setIsLoading(true),
      stopLoading: () => setIsLoading(false)
    }),
    []
  );

  return (
    <NavigationProgressContext.Provider value={value}>
      {children}
      {isLoading ? (
        <div className="page-loading-overlay">
          <div className="page-loading-card">
            <LoadingSpinner center label="Birimo gufungura..." />
          </div>
        </div>
      ) : null}
    </NavigationProgressContext.Provider>
  );
}

export function useNavigationProgress() {
  return useContext(NavigationProgressContext);
}

type LoadingLinkProps = ComponentProps<typeof Link>;

export function LoadingLink({
  href,
  onClick,
  children,
  ...props
}: LoadingLinkProps & {
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const progress = useNavigationProgress();

  return (
    <Link
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          progress?.startLoading();
        }
      }}
    >
      {children}
    </Link>
  );
}
