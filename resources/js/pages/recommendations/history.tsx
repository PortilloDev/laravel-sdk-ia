import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { history as historyRoute } from '@/routes/recommendations';
import { store as storeUserBook, destroy as destroyUserBook, index as userBooksIndex } from '@/routes/user-books';
import { dashboard } from '@/routes';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type BookItem = {
    title: string;
    author: string;
    description: string;
    reason: string;
};

type RecommendationEntry = {
    id: number;
    query: string;
    response: BookItem[];
    created_at: string;
};

type SavedBook = {
    id: number;
    title: string;
    author: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Recomendador', href: dashboard().url },
    { title: 'Historial', href: historyRoute() },
];

export default function RecommendationsHistory({
    recommendations,
}: {
    recommendations: RecommendationEntry[];
}) {
    const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
    const [savingKey, setSavingKey] = useState<string | null>(null);

    const getXsrfToken = () =>
        decodeURIComponent(
            document.cookie
                .split('; ')
                .find((row) => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1] ?? '',
        );

    const handleSaveBook = async (book: BookItem) => {
        const key = `${book.title}__${book.author}`;
        setSavingKey(key);
        try {
            const response = await fetch(storeUserBook.url(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': getXsrfToken(),
                },
                body: JSON.stringify({
                    title: book.title,
                    author: book.author,
                    description: book.description,
                    reason: book.reason,
                }),
            });
            const data = await response.json();
            if (data.userBook) {
                setSavedBooks((prev) => [...prev, { id: data.userBook.id, title: book.title, author: book.author }]);
            }
        } catch {
            // silently fail
        } finally {
            setSavingKey(null);
        }
    };

    const handleRemoveBook = async (book: BookItem) => {
        const saved = savedBooks.find((b) => b.title === book.title && b.author === book.author);
        if (!saved) return;
        try {
            await fetch(destroyUserBook.url({ userBook: saved.id }), {
                method: 'DELETE',
                headers: { Accept: 'application/json', 'X-XSRF-TOKEN': getXsrfToken() },
            });
            setSavedBooks((prev) => prev.filter((b) => b.id !== saved.id));
        } catch {
            // silently fail
        }
    };

    const isBookSaved = (book: BookItem) =>
        savedBooks.some((b) => b.title === book.title && b.author === book.author);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historial de recomendaciones" />

            <div className="flex flex-col gap-6 p-6 lg:p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Historial</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Tus últimas {recommendations.length} búsquedas guardadas.
                        </p>
                    </div>
                    <Link
                        href={userBooksIndex()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-sidebar-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                    >
                        <BookmarkIcon className="h-3.5 w-3.5" />
                        Mi biblioteca
                    </Link>
                </div>

                {/* Empty state */}
                {recommendations.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-sidebar-border bg-card/50 py-16 text-center">
                        <ClockIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                        <p className="text-sm font-medium text-muted-foreground">Aún no has hecho ninguna búsqueda</p>
                        <Link
                            href={dashboard().url}
                            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#5B3DFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#4a31d4]"
                        >
                            Ir al recomendador
                        </Link>
                    </div>
                )}

                {/* Recommendation entries */}
                <div className="flex flex-col gap-8">
                    {recommendations.map((entry) => (
                        <div key={entry.id} className="rounded-2xl border border-sidebar-border bg-card">
                            {/* Query header */}
                            <div className="flex items-center justify-between border-b border-sidebar-border px-6 py-4">
                                <div>
                                    <p className="text-sm font-medium">"{entry.query}"</p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>
                                </div>
                                <span className="rounded-full bg-[#5B3DFF]/10 px-2.5 py-1 text-xs font-medium text-[#5B3DFF]">
                                    {entry.response.length} libros
                                </span>
                            </div>

                            {/* Books grid */}
                            <div className="grid gap-px bg-sidebar-border md:grid-cols-3">
                                {entry.response.map((book, idx) => (
                                    <div key={idx} className="flex flex-col bg-card p-5">
                                        <h3 className="font-semibold leading-tight">{book.title}</h3>
                                        <p className="mb-2 text-xs text-muted-foreground">{book.author}</p>
                                        <p className="flex-1 text-xs leading-relaxed text-foreground/70">{book.description}</p>
                                        <p className="mt-3 text-xs text-[#5B3DFF] dark:text-[#7c63ff]">
                                            <span className="font-semibold">Por qué: </span>
                                            {book.reason}
                                        </p>
                                        <div className="mt-3">
                                            {isBookSaved(book) ? (
                                                <button
                                                    onClick={() => handleRemoveBook(book)}
                                                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
                                                >
                                                    <TrashIcon className="h-3 w-3" />
                                                    Quitar
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleSaveBook(book)}
                                                    disabled={savingKey === `${book.title}__${book.author}`}
                                                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#5B3DFF]/30 bg-[#5B3DFF]/5 px-3 py-1.5 text-xs font-medium text-[#5B3DFF] transition-colors hover:bg-[#5B3DFF]/10 disabled:opacity-50"
                                                >
                                                    {savingKey === `${book.title}__${book.author}` ? (
                                                        <SpinnerIcon className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <BookmarkIcon className="h-3 w-3" />
                                                    )}
                                                    Guardar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

function BookmarkIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
    );
}

function ClockIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function TrashIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
    );
}

function SpinnerIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
