import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { destroy as destroyUserBook } from '@/routes/user-books';
import { history as recommendationsHistory } from '@/routes/recommendations';
import { dashboard } from '@/routes';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type UserBook = {
    id: number;
    title: string;
    author: string;
    description: string;
    reason: string | null;
    created_at: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Recomendador', href: dashboard().url },
    { title: 'Mi biblioteca', href: '/my-library' },
];

export default function UserBooksIndex({ userBooks }: { userBooks: UserBook[] }) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [books, setBooks] = useState<UserBook[]>(userBooks);

    const getXsrfToken = () =>
        decodeURIComponent(
            document.cookie
                .split('; ')
                .find((row) => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1] ?? '',
        );

    const handleDelete = async (book: UserBook) => {
        if (!confirm(`¿Quieres eliminar "${book.title}" de tu biblioteca?`)) return;

        setDeletingId(book.id);
        try {
            await fetch(destroyUserBook.url({ userBook: book.id }), {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': getXsrfToken(),
                },
            });
            setBooks((prev) => prev.filter((b) => b.id !== book.id));
        } catch {
            // silently fail
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mi biblioteca" />

            <div className="flex flex-col gap-6 p-6 lg:p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Mi biblioteca</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {books.length === 0
                                ? 'Todavía no has guardado ningún libro.'
                                : `${books.length} libro${books.length !== 1 ? 's' : ''} guardado${books.length !== 1 ? 's' : ''}.`}
                        </p>
                    </div>
                    <Link
                        href={recommendationsHistory()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-sidebar-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                    >
                        <ClockIcon className="h-3.5 w-3.5" />
                        Historial
                    </Link>
                </div>

                {/* Empty state */}
                {books.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-sidebar-border bg-card/50 py-16 text-center">
                        <BookmarkIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                        <p className="text-sm font-medium text-muted-foreground">Tu biblioteca está vacía</p>
                        <p className="mt-1 text-xs text-muted-foreground/60">Guarda libros desde el recomendador o el historial.</p>
                        <Link
                            href={dashboard().url}
                            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#5B3DFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#4a31d4]"
                        >
                            Ir al recomendador
                        </Link>
                    </div>
                )}

                {/* Books table */}
                {books.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-sidebar-border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border bg-muted/50">
                                    <th className="px-5 py-3 text-left font-medium text-muted-foreground">Título</th>
                                    <th className="px-5 py-3 text-left font-medium text-muted-foreground">Autor</th>
                                    <th className="hidden px-5 py-3 text-left font-medium text-muted-foreground md:table-cell">Por qué te gustará</th>
                                    <th className="hidden px-5 py-3 text-left font-medium text-muted-foreground sm:table-cell">Guardado</th>
                                    <th className="px-5 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border bg-card">
                                {books.map((book) => (
                                    <tr key={book.id} className="group transition-colors hover:bg-muted/30">
                                        <td className="px-5 py-4">
                                            <p className="font-semibold">{book.title}</p>
                                            <p className="mt-0.5 text-xs text-muted-foreground md:hidden">{book.author}</p>
                                        </td>
                                        <td className="hidden px-5 py-4 text-muted-foreground md:table-cell">{book.author}</td>
                                        <td className="hidden max-w-xs px-5 py-4 md:table-cell">
                                            {book.reason ? (
                                                <p className="line-clamp-2 text-xs text-muted-foreground">{book.reason}</p>
                                            ) : (
                                                <span className="text-xs text-muted-foreground/40">—</span>
                                            )}
                                        </td>
                                        <td className="hidden whitespace-nowrap px-5 py-4 text-xs text-muted-foreground sm:table-cell">
                                            {formatDate(book.created_at)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => handleDelete(book)}
                                                disabled={deletingId === book.id}
                                                title="Eliminar de mi biblioteca"
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 opacity-0 transition-all hover:bg-red-100 group-hover:opacity-100 disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
                                            >
                                                {deletingId === book.id ? (
                                                    <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <TrashIcon className="h-3.5 w-3.5" />
                                                )}
                                                Quitar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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
