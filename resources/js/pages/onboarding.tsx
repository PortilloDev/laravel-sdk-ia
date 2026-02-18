import { Head, Form } from '@inertiajs/react';
import { useState } from 'react';
import { store } from '@/routes/onboarding';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

const GENRES = [
    { id: 'sci-fi', label: 'Ciencia Ficción', emoji: '🚀' },
    { id: 'fantasy', label: 'Fantasía', emoji: '🧙' },
    { id: 'mystery', label: 'Misterio', emoji: '🔍' },
    { id: 'thriller', label: 'Thriller', emoji: '😱' },
    { id: 'romance', label: 'Romance', emoji: '❤️' },
    { id: 'history', label: 'Historia', emoji: '📜' },
    { id: 'horror', label: 'Terror', emoji: '👻' },
    { id: 'classics', label: 'Clásicos', emoji: '📖' },
    { id: 'non-fiction', label: 'No ficción', emoji: '💡' },
    { id: 'adventure', label: 'Aventura', emoji: '🗺️' },
    { id: 'philosophy', label: 'Filosofía', emoji: '🤔' },
    { id: 'poetry', label: 'Poesía', emoji: '🌿' },
];

export default function Onboarding() {
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

    const toggleGenre = (id: string) => {
        setSelectedGenres((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
        );
    };

    return (
        <>
            <Head title="Cuéntanos tus gustos — BookMind" />

            <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAF8] px-4 py-12 text-[#1b1b18] dark:bg-[#0c0c0a] dark:text-[#EDEDEC]">
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <div className="mb-10 text-center">
                        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5B3DFF]/10">
                            <BookIcon className="h-7 w-7 text-[#5B3DFF]" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            ¿Qué te gusta leer?
                        </h1>
                        <p className="mt-2 text-[#706f6c] dark:text-[#A1A09A]">
                            Selecciona al menos un género para personalizar tus recomendaciones.
                        </p>
                    </div>

                    <Form
                        {...store.form()}
                        className="space-y-8"
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Hidden inputs for selected genres */}
                                {selectedGenres.map((genre) => (
                                    <input
                                        key={genre}
                                        type="hidden"
                                        name="genres[]"
                                        value={genre}
                                    />
                                ))}

                                {/* Genre grid */}
                                <div>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                        {GENRES.map((genre) => {
                                            const isSelected = selectedGenres.includes(genre.id);
                                            return (
                                                <button
                                                    key={genre.id}
                                                    type="button"
                                                    onClick={() => toggleGenre(genre.id)}
                                                    className={[
                                                        'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all',
                                                        isSelected
                                                            ? 'border-[#5B3DFF] bg-[#5B3DFF]/10 text-[#5B3DFF] dark:bg-[#5B3DFF]/15'
                                                            : 'border-[#e3e3e0] bg-white hover:border-[#5B3DFF]/40 hover:bg-[#5B3DFF]/5 dark:border-[#3E3E3A] dark:bg-[#161615] dark:hover:border-[#5B3DFF]/40',
                                                    ].join(' ')}
                                                >
                                                    <span className="text-2xl">{genre.emoji}</span>
                                                    <span>{genre.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <InputError message={errors.genres} className="mt-2" />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label
                                        htmlFor="notes"
                                        className="mb-2 block text-sm font-medium"
                                    >
                                        ¿Algo más que debamos saber?{' '}
                                        <span className="font-normal text-[#706f6c] dark:text-[#A1A09A]">
                                            (opcional)
                                        </span>
                                    </label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        rows={3}
                                        placeholder='Ej: "Me gusta la ciencia ficción filosófica, tipo Blade Runner pero más optimista"'
                                        className="w-full rounded-xl border border-[#e3e3e0] bg-white px-4 py-3 text-sm placeholder-[#A1A09A] transition-colors focus:border-[#5B3DFF] focus:outline-none focus:ring-2 focus:ring-[#5B3DFF]/20 dark:border-[#3E3E3A] dark:bg-[#161615] dark:placeholder-[#706f6c]"
                                    />
                                    <InputError message={errors.notes} className="mt-1" />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing || selectedGenres.length === 0}
                                    className="w-full rounded-xl bg-[#5B3DFF] py-3 text-sm font-semibold text-white shadow-lg shadow-[#5B3DFF]/25 transition-all hover:bg-[#4a31d4] disabled:opacity-50"
                                >
                                    {processing && <Spinner />}
                                    {selectedGenres.length === 0
                                        ? 'Selecciona al menos un género'
                                        : 'Guardar preferencias y continuar'}
                                </Button>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

function BookIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    );
}
