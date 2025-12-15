"use client";

import { ScreenShareProvider } from "@/features/study/context/ScreenShareContext";
import { ScreenShareTest } from "@/features/study/components/ScreenShareTest";

export default function HiddenSharePage() {
    return (
        <ScreenShareProvider>
            <ScreenShareTest />
        </ScreenShareProvider>
    );
}
