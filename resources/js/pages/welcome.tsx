import { Head, Link } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="BookMind — Tu recomendador de libros con IA">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-[#FAFAF8] text-[#1b1b18] dark:bg-[#0c0c0a] dark:text-[#EDEDEC]">
                {/* Nav */}
                <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
                    <div className="flex items-center gap-2">
                        <BookIcon className="h-7 w-7 text-[#5B3DFF]" />
                        <span className="text-lg font-semibold tracking-tight">BookMind</span>
                    </div>
                    <nav className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="rounded-lg bg-[#5B3DFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a31d4]"
                            >
                                Ir al recomendador
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-[#1b1b18] transition-colors hover:bg-[#f0f0ec] dark:text-[#EDEDEC] dark:hover:bg-[#1e1e1b]"
                                >
                                    Iniciar sesión
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="rounded-lg bg-[#5B3DFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a31d4]"
                                    >
                                        Registrarse gratis
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                {/* Hero */}
                <section className="mx-auto max-w-6xl px-6 py-20 text-center lg:py-32">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#5B3DFF]/20 bg-[#5B3DFF]/5 px-4 py-1.5 text-sm font-medium text-[#5B3DFF] dark:border-[#7c63ff]/30 dark:bg-[#7c63ff]/10">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5B3DFF] opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5B3DFF]" />
                        </span>
                        Impulsado por IA y búsqueda vectorial
                    </div>

                    <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight lg:text-7xl">
                        El libro perfecto
                        <br />
                        <span className="bg-gradient-to-r from-[#5B3DFF] to-[#FF6B6B] bg-clip-text text-transparent">
                            para cada momento
                        </span>
                    </h1>

                    <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                        Describe qué te apetece leer y nuestro bibliotecario IA encontrará joyas literarias
                        adaptadas a tus gustos personales.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#5B3DFF] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#5B3DFF]/25 transition-all hover:bg-[#4a31d4] hover:shadow-[#5B3DFF]/40"
                            >
                                Explorar recomendaciones
                                <ArrowRightIcon className="h-4 w-4" />
                            </Link>
                        ) : (
                            <>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#5B3DFF] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#5B3DFF]/25 transition-all hover:bg-[#4a31d4] hover:shadow-[#5B3DFF]/40"
                                    >
                                        Empezar gratis
                                        <ArrowRightIcon className="h-4 w-4" />
                                    </Link>
                                )}
                                <Link
                                    href={login()}
                                    className="inline-flex items-center gap-2 rounded-xl border border-[#e3e3e0] px-8 py-3.5 text-base font-medium transition-colors hover:bg-[#f0f0ec] dark:border-[#3E3E3A] dark:hover:bg-[#1e1e1b]"
                                >
                                    Ya tengo cuenta
                                </Link>
                            </>
                        )}
                    </div>
                </section>

                {/* Features */}
                <section className="mx-auto max-w-6xl px-6 py-16">
                    <div className="grid gap-6 md:grid-cols-3">
                        <FeatureCard
                            icon={<SparklesIcon className="h-6 w-6 text-[#5B3DFF]" />}
                            title="Recomendaciones personalizadas"
                            description="Cuéntanos qué géneros te gustan y el sistema adaptará cada sugerencia a tu perfil lector único."
                        />
                        <FeatureCard
                            icon={<SearchIcon className="h-6 w-6 text-[#FF6B6B]" />}
                            title="Búsqueda semántica"
                            description="Describe en tus propias palabras lo que buscas. La IA entiende el significado, no solo las palabras clave."
                        />
                        <FeatureCard
                            icon={<BookOpenIcon className="h-6 w-6 text-[#10b981]" />}
                            title="Joyas ocultas"
                            description="Descubre obras maestras y libros poco conocidos que no encontrarías en las listas de bestsellers habituales."
                        />
                    </div>
                </section>

                {/* How it works */}
                <section className="mx-auto max-w-6xl px-6 py-16">
                    <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
                        Cómo funciona
                    </h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            {
                                step: '01',
                                title: 'Crea tu perfil lector',
                                desc: 'Regístrate y selecciona los géneros literarios que más te apasionan.',
                            },
                            {
                                step: '02',
                                title: 'Describe lo que buscas',
                                desc: 'Escribe libremente: "algo como Blade Runner pero optimista" o "aventura épica para el verano".',
                            },
                            {
                                step: '03',
                                title: 'Recibe recomendaciones',
                                desc: 'El bibliotecario IA selecciona hasta 3 libros perfectos para ti con una explicación detallada.',
                            },
                        ].map(({ step, title, desc }) => (
                            <div key={step} className="flex gap-5">
                                <div className="shrink-0 text-4xl font-bold text-[#5B3DFF]/20">
                                    {step}
                                </div>
                                <div>
                                    <h3 className="mb-2 font-semibold">{title}</h3>
                                    <p className="text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                        {desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA footer */}
                {!auth.user && canRegister && (
                    <section className="mx-auto max-w-6xl px-6 py-16">
                        <div className="rounded-2xl bg-gradient-to-br from-[#5B3DFF] to-[#7c63ff] p-10 text-center text-white shadow-xl shadow-[#5B3DFF]/20">
                            <h2 className="mb-3 text-3xl font-bold">
                                ¿Listo para descubrir tu próximo libro favorito?
                            </h2>
                            <p className="mb-8 text-[#d4ccff]">
                                Únete gratis y empieza a recibir recomendaciones personalizadas.
                            </p>
                            <Link
                                href={register()}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-[#5B3DFF] shadow transition-all hover:bg-[#f0eeff]"
                            >
                                Crear cuenta gratis
                                <ArrowRightIcon className="h-4 w-4" />
                            </Link>
                        </div>
                    </section>
                )}

                <footer className="border-t border-[#e3e3e0] py-8 text-center text-sm text-[#706f6c] dark:border-[#3E3E3A] dark:text-[#A1A09A]">
                    <div className="flex items-center justify-center gap-2">
                        <BookIcon className="h-4 w-4" />
                        <span>BookMind — Tu biblioteca inteligente</span>
                    </div>
                </footer>
            </div>
        </>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-[#e3e3e0] bg-white p-7 transition-shadow hover:shadow-md dark:border-[#3E3E3A] dark:bg-[#161615]">
            <div className="mb-4 inline-flex rounded-xl bg-[#F5F5F2] p-3 dark:bg-[#1e1e1b]">
                {icon}
            </div>
            <h3 className="mb-2 font-semibold">{title}</h3>
            <p className="text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">{description}</p>
        </div>
    );
}

function BookIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    );
}

function ArrowRightIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    );
}

function SearchIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
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
