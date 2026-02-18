import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { store as storeRecommendation } from '@/routes/recommendations';
import { store as storeUserBook, destroy as destroyUserBook, index as userBooksIndex } from '@/routes/user-books';
import { history as recommendationsHistory } from '@/routes/recommendations';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, SharedData } from '@/types';

type BookPreferences = {
    genres: string[];
    notes?: string;
} | null;

type Recommendation = {
    title: string;
    author: string;
    description: string;
    reason: string;
};

type SavedBook = {
    id: number;
    title: string;
    author: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Recomendador', href: dashboard().url },
];

export default function Dashboard({ bookPreferences }: { bookPreferences: BookPreferences }) {
    const { auth } = usePage<SharedData>().props;
    const [query, setQuery] = useState('');
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [cached, setCached] = useState(false);
    const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
    const [savingBook, setSavingBook] = useState<string | null>(null);

    const getXsrfToken = () =>
        decodeURIComponent(
            document.cookie
                .split('; ')
                .find((row) => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1] ?? '',
        );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const response = await fetch(storeRecommendation.url(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': getXsrfToken(),
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                setError(data?.message ?? 'Error al obtener recomendaciones.');
                return;
            }

            const data = await response.json();
            setRecommendations(data.recommendations ?? []);
            setCached(data.cached ?? false);
            setSavedBooks([]);
        } catch {
            setError('Error de conexión. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBook = async (book: Recommendation) => {
        const key = `${book.title}__${book.author}`;
        setSavingBook(key);

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
            setSavingBook(null);
        }
    };

    const handleRemoveBook = async (book: Recommendation) => {
        const saved = savedBooks.find((b) => b.title === book.title && b.author === book.author);
        if (!saved) return;

        try {
            await fetch(destroyUserBook.url({ userBook: saved.id }), {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': getXsrfToken(),
                },
            });
            setSavedBooks((prev) => prev.filter((b) => b.id !== saved.id));
        } catch {
            // silently fail
        }
    };

    const isBookSaved = (book: Recommendation) =>
        savedBooks.some((b) => b.title === book.title && b.author === book.author);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Recomendador de libros" />

            <div className="flex flex-col gap-8 p-6 lg:p-8">
                {/* Header + nav */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Hola, {auth.user?.name?.split(' ')[0]} 👋
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Describe qué te apetece leer y te recomendaré el libro perfecto.
                            {bookPreferences?.genres?.length ? (
                                <span className="ml-1">
                                    Tus géneros favoritos:{' '}
                                    <span className="font-medium text-foreground">
                                        {bookPreferences.genres.join(', ')}
                                    </span>
                                    .
                                </span>
                            ) : null}
                        </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <Link
                            href={recommendationsHistory()}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-sidebar-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                        >
                            <ClockIcon className="h-3.5 w-3.5" />
                            Historial
                        </Link>
                        <Link
                            href={userBooksIndex()}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-sidebar-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                        >
                            <BookmarkIcon className="h-3.5 w-3.5" />
                            Mi biblioteca
                        </Link>
                    </div>
                </div>

                {/* Search form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder='"algo como Dune pero más accesible" o "una novela corta de terror psicológico"'
                        className="min-w-0 flex-1 rounded-xl border border-sidebar-border bg-background px-4 py-3 text-sm placeholder-muted-foreground transition-colors focus:border-[#5B3DFF] focus:outline-none focus:ring-2 focus:ring-[#5B3DFF]/20"
                    />
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#5B3DFF] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#5B3DFF]/20 transition-all hover:bg-[#4a31d4] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <SpinnerIcon className="h-4 w-4 animate-spin" />
                                Buscando...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="h-4 w-4" />
                                Recomendar
                            </>
                        )}
                    </button>
                </form>

                {/* Error */}
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* Cache badge */}
                {hasSearched && !loading && cached && (
                    <p className="text-xs text-muted-foreground">
                        ⚡ Resultado desde caché
                    </p>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <div className="grid gap-4 md:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse rounded-2xl border border-sidebar-border bg-card p-6">
                                <div className="mb-3 h-4 w-3/4 rounded bg-muted" />
                                <div className="mb-4 h-3 w-1/2 rounded bg-muted" />
                                <div className="space-y-2">
                                    <div className="h-3 rounded bg-muted" />
                                    <div className="h-3 rounded bg-muted" />
                                    <div className="h-3 w-4/5 rounded bg-muted" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Results */}
                {!loading && recommendations.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-3">
                        {recommendations.map((book, index) => (
                            <BookCard
                                key={index}
                                book={book}
                                isSaved={isBookSaved(book)}
                                isSaving={savingBook === `${book.title}__${book.author}`}
                                onSave={() => handleSaveBook(book)}
                                onRemove={() => handleRemoveBook(book)}
                            />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && hasSearched && recommendations.length === 0 && !error && (
                    <div className="rounded-2xl border border-sidebar-border bg-card py-16 text-center">
                        <BookOpenIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                            No encontré recomendaciones. Prueba con otra descripción.
                        </p>
                    </div>
                )}

                {/* Initial hint */}
                {!hasSearched && (
                    <div className="rounded-2xl border border-dashed border-sidebar-border bg-card/50 py-16 text-center">
                        <SparklesIcon className="mx-auto mb-3 h-10 w-10 text-[#5B3DFF]/30" />
                        <p className="text-sm font-medium text-muted-foreground">Tu próxima lectura favorita te espera</p>
                        <p className="mt-1 text-xs text-muted-foreground/60">
                            Escribe cualquier descripción, estado de ánimo o referencia arriba.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function BookCard({
    book,
    isSaved,
    isSaving,
    onSave,
    onRemove,
}: {
    book: Recommendation;
    isSaved: boolean;
    isSaving: boolean;
    onSave: () => void;
    onRemove: () => void;
}) {
    return (
        <div className="flex flex-col rounded-2xl border border-sidebar-border bg-card p-6 transition-shadow hover:shadow-md">
            <div className="mb-1">
                <h3 className="font-semibold leading-tight">{book.title}</h3>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">{book.author}</p>
            <p className="flex-1 text-sm leading-relaxed text-foreground/80">{book.description}</p>
            <div className="mt-4 border-t border-sidebar-border pt-4">
                <p className="text-xs leading-relaxed text-[#5B3DFF] dark:text-[#7c63ff]">
                    <span className="font-semibold">Por qué te encantará: </span>
                    {book.reason}
                </p>
            </div>
            <div className="mt-4">
                {isSaved ? (
                    <button
                        onClick={onRemove}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
                    >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Quitar de mi biblioteca
                    </button>
                ) : (
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#5B3DFF]/30 bg-[#5B3DFF]/5 px-3 py-2 text-xs font-medium text-[#5B3DFF] transition-colors hover:bg-[#5B3DFF]/10 disabled:opacity-50 dark:text-[#7c63ff]"
                    >
                        {isSaving ? (
                            <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <BookmarkIcon className="h-3.5 w-3.5" />
                        )}
                        {isSaving ? 'Guardando...' : 'Añadir a mi biblioteca'}
                    </button>
                )}
            </div>
        </div>
    );
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
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

function BookOpenIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
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
