"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Music, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useBackground } from '@/context/BackgroundContext';


export default function BackgroundManagement() {
  const { allFiles } = useBackground();

  const getFileIcon = (filename: string) => {
    if (filename.startsWith('background/')) {
        return <ImageIcon className="w-5 h-5 text-muted-foreground" />;
    }
    if (filename.startsWith('sounds/')) {
        return <Music className="w-5 h-5 text-muted-foreground" />;
    }
    return null;
  }
  
  return (
    <Card className="bg-black/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Cloudflare R2 File Management</CardTitle>
        <CardDescription>All files from your Cloudflare R2 bucket worker.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Type</TableHead>
              <TableHead>Filename</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allFiles.map((file) => (
              <TableRow key={file.filename} className="hover:bg-muted/50 border-gray-500/50">
                <TableCell>
                    {getFileIcon(file.filename)}
                </TableCell>
                <TableCell className="font-medium">
                    {file.filename}
                </TableCell>
                <TableCell>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate w-32">
                        {file.url}
                    </a>
                </TableCell>
                <TableCell className="text-right">
                    <Button variant="outline" size="sm" disabled>Manage</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
       <CardFooter className="border-t border-gray-500/50 pt-6">
            <div className="w-full">
                <h3 className="text-lg font-semibold mb-2">Upload New File</h3>
                 <p className="text-sm text-muted-foreground mt-2">
                    Please upload new files to your R2 bucket. They will appear here automatically.
                </p>
            </div>
      </CardFooter>
    </Card>
  );
}
