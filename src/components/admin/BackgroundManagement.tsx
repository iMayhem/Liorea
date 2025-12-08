"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
import { backgrounds } from '@/lib/backgrounds';
import Image from 'next/image';


export default function BackgroundManagement() {
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Background Management</CardTitle>
        <CardDescription>Add, remove, or update background images available to users.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backgrounds.map((bg) => (
              <TableRow key={bg.id}>
                <TableCell>
                    <Image src={bg.url} alt={bg.name} width={100} height={56} className="rounded-md object-cover" />
                </TableCell>
                <TableCell className="font-medium">{bg.name}</TableCell>
                <TableCell>
                    <a href={bg.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate w-32">
                        {bg.url}
                    </a>
                </TableCell>
                <TableCell className="text-right">
                    <Button variant="outline" size="sm" disabled>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
       <CardFooter className="border-t pt-6">
            <div className="w-full">
                <h3 className="text-lg font-semibold mb-2">Add New Background</h3>
                <div className="flex gap-2">
                    <Input placeholder="Background Name" className="max-w-xs" disabled />
                    <Input placeholder="Image URL" className="flex-grow" disabled />
                    <Button disabled>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add
                    </Button>
                </div>
                 <p className="text-sm text-muted-foreground mt-2">
                    Editing and adding backgrounds is disabled in this demo.
                </p>
            </div>
      </CardFooter>
    </Card>
  );
}
