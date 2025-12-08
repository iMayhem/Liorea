"use client";

import { useBackground } from "@/context/BackgroundContext";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";

export default function BackgroundDisplay() {
  const { currentBackground, isLoading } = useBackground();

  return (
    <div className="absolute inset-0 transition-all duration-1000 -z-10">
      {isLoading || !currentBackground ? (
        <Skeleton className="h-full w-full" />
      ) : (
        <Image
          key={currentBackground.id}
          src={currentBackground.url}
          alt={currentBackground.name}
          fill
          className="object-cover animate-in fade-in-50"
          priority
        />
      )}
    </div>
  );
}
