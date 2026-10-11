import clsx from "clsx";

export interface LoadingSkeletonProps {
  className?: string;
  variant?: "block" | "card" | "text";
}

export default function LoadingSkeleton({ className, variant = "block" }: LoadingSkeletonProps) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded bg-gray-200",
        variant === "card" && "h-24 w-full",
        variant === "text" && "h-4 w-3/4",
        variant === "block" && "h-16 w-full",
        className
      )}
    />
  );
}
