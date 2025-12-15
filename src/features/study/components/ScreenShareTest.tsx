"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useScreenShare } from '../context/ScreenShareContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ScreenShareTest = () => {
    const {
        startSharing,
        stopSharing,
        joinStream,
        localStream,
        remoteStream,
        isSharing,
        isViewing,
        error
    } = useScreenShare();

    const [roomId, setRoomId] = useState("test-room-1");
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Auto-play local stream when available (for preview)
    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Auto-play remote stream when available
    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            console.log("Setting remote stream to video element", remoteStream.active);
        }
    }, [remoteStream]);

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white mb-8">Hidden Screen Share Test</h1>

            <Card className="bg-slate-900 border-slate-800 text-white">
                <CardHeader>
                    <CardTitle>Controls</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4 items-center">
                    <Input
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="Room ID"
                        className="w-48 bg-slate-800 border-slate-700"
                    />

                    {!isSharing && !isViewing && (
                        <>
                            <Button onClick={() => startSharing(roomId)} className="bg-blue-600 hover:bg-blue-700">
                                Start Sharing (Host)
                            </Button>
                            <Button onClick={() => joinStream(roomId)} className="bg-green-600 hover:bg-green-700">
                                Join Stream (Viewer)
                            </Button>
                        </>
                    )}

                    {(isSharing || isViewing) && (
                        <Button
                            onClick={stopSharing}
                            variant="destructive"
                        >
                            Stop / Disconnect
                        </Button>
                    )}
                </CardContent>
            </Card>

            {error && (
                <div className="p-4 bg-red-900/50 border border-red-500 rounded text-red-200">
                    Error: {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Local Preview */}
                <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-sm text-slate-400">Local Stream</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 aspect-video bg-black relative flex items-center justify-center">
                        {localStream ? (
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="text-slate-600">No local stream</div>
                        )}
                    </CardContent>
                </Card>

                {/* Remote View */}
                <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-sm text-slate-400">Remote Stream</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 aspect-video bg-black relative flex items-center justify-center">
                        {remoteStream ? (
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                controls
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="text-slate-600">Waiting for stream...</div>
                        )}
                        {isViewing && !remoteStream && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white animate-pulse">
                                Connecting...
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
