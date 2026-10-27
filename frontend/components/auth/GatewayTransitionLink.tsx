"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import clsx from "clsx";

interface GatewayTransitionLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export default function GatewayTransitionLink({
  href,
  className,
  children,
}: GatewayTransitionLinkProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If command/ctrl click, let browser handle new tab
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();

    // If already logged in, navigate straight to destination
    if (user) {
      router.push(href);
      return;
    }

    // Trigger subtle animated transition to auth gateway
    setIsTransitioning(true);

    const authTarget = `/auth?next=${encodeURIComponent(href)}`;
    setTimeout(() => {
      router.push(authTarget);
    }, 280);
  };

  return (
    <a
      href={user ? href : `/auth?next=${encodeURIComponent(href)}`}
      onClick={handleClick}
      className={clsx(
        className,
        isTransitioning && "opacity-80 scale-[0.98] ring-2 ring-terracotta-500/40 transition-all duration-300"
      )}
    >
      {children}
    </a>
  );
}
