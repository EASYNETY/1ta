'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

export default function CorporateManagementPage() {
    const [view, setView] = useState<'dashboard' | 'students' | 'courses'>('dashboard');

    return (
        <main className="min-h-screen px-4 md:px-10 py-6 space-y-6">
            <section className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Corporate Management</h1>
                <div className="space-x-2">
                    <Button variant={view === 'dashboard' ? 'default' : 'outline'} onClick={() => setView('dashboard')}>Dashboard</Button>
                    <Button variant={view === 'students' ? 'default' : 'outline'} onClick={() => setView('students')}>Students</Button>
                    <Button variant={view === 'courses' ? 'default' : 'outline'} onClick={() => setView('courses')}>Courses</Button>
                </div>
            </section>

            <Separator />

            <section>
                {view === 'dashboard' && (
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-lg font-medium mb-2">Overview</h2>
                            <p className="text-muted-foreground">Corporate account stats, student count, course usage, etc.</p>
                        </CardContent>
                    </Card>
                )}

                {view === 'students' && (
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-lg font-medium mb-2">Manage Students</h2>
                            <p className="text-muted-foreground">Assign students to courses, manage profiles, etc.</p>
                        </CardContent>
                    </Card>
                )}

                {view === 'courses' && (
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-lg font-medium mb-2">Manage Courses</h2>
                            <p className="text-muted-foreground">Assign courses to students, set limits, etc.</p>
                        </CardContent>
                    </Card>
                )}
            </section>
        </main>
    );
}
