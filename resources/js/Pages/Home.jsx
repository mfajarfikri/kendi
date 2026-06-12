import ApplicationLogo from "@/Components/ApplicationLogo";
import { Head, Link } from "@inertiajs/react";
import React, { memo, useEffect, useMemo, useState } from "react";

const PrimaryLink = memo(function PrimaryLink({ href, icon, children }) {
    return (
        <Link
            href={href}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
        >
            {icon && (
                <span className="mr-2 inline-flex h-4 w-4 items-center justify-center text-white/90">
                    {icon}
                </span>
            )}
            {children}
        </Link>
    );
});

const SecondaryLink = memo(function SecondaryLink({ href, icon, children }) {
    return (
        <Link
            href={href}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-offset-gray-950"
        >
            {icon && (
                <span className="mr-2 inline-flex h-4 w-4 items-center justify-center text-gray-700 dark:text-gray-200">
                    {icon}
                </span>
            )}
            {children}
        </Link>
    );
});

const FeatureCard = memo(function FeatureCard({ title, description, icon }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {icon}
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {description}
            </p>
        </div>
    );
});

const QuickLinkCard = memo(function QuickLinkCard({
    href,
    title,
    description,
    icon,
}) {
    return (
        <Link
            href={href}
            className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:border-gray-800 dark:bg-gray-900 dark:focus:ring-offset-gray-950"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {icon}
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {title}
                        </p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            {description}
                        </p>
                    </div>
                </div>
                <span className="rounded-lg bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700 transition-colors group-hover:bg-blue-50 group-hover:text-blue-700 dark:bg-gray-800 dark:text-gray-200 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-300">
                    Buka
                </span>
            </div>
        </Link>
    );
});

export default function Home() {
    const [renderBelowFold, setRenderBelowFold] = useState(false);

    useEffect(() => {
        const id = window.requestAnimationFrame(() => setRenderBelowFold(true));
        return () => window.cancelAnimationFrame(id);
    }, []);

    const icons = useMemo(
        () => ({
            dashboard: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                    className="h-5 w-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 19h16M6 16V8m6 8V5m6 11v-7"
                    />
                </svg>
            ),
            trip: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                    className="h-5 w-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 7h14M5 17h14M7 7v10m10-10v10"
                    />
                </svg>
            ),
            kendaraan: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                    className="h-5 w-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13l2-6h14l2 6"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13h14v5H5z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 18h.01M17 18h.01"
                    />
                </svg>
            ),
            driver: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                    className="h-5 w-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 20a7.5 7.5 0 0115 0"
                    />
                </svg>
            ),
            tamu: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                    className="h-5 w-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 7h10M7 11h6M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"
                    />
                </svg>
            ),
            login: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                    className="h-5 w-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 11V7a3 3 0 10-6 0v4"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 11h10a2 2 0 012 2v7H6v-9z"
                    />
                </svg>
            ),
            arrowRight: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                    className="h-4 w-4"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            ),
            shield: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                    className="h-4 w-4"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3l7 4v6c0 5-3 8-7 9-4-1-7-4-7-9V7l7-4z"
                    />
                </svg>
            ),
            clock: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                    className="h-4 w-4"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 7v5l3 2"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 22a10 10 0 110-20 10 10 0 010 20z"
                    />
                </svg>
            ),
            users: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                    className="h-4 w-4"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 11c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 20a5 5 0 0110 0"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 20a5 5 0 0110 0"
                    />
                </svg>
            ),
        }),
        [],
    );

    const quickLinks = useMemo(
        () => [
            {
                href: "/dashboard",
                title: "Dashboard",
                description: "Ringkasan aktivitas dan statistik operasional.",
                icon: icons.dashboard,
            },
            {
                href: "/trip",
                title: "Trip Kendaraan",
                description: "Cari, pantau, dan kelola perjalanan kendaraan.",
                icon: icons.trip,
            },
            {
                href: "/kendaraan",
                title: "Kendaraan",
                description: "Manajemen armada, status, dan detail kendaraan.",
                icon: icons.kendaraan,
            },
            {
                href: "/driver",
                title: "Driver",
                description: "Kelola data driver dan status ketersediaan.",
                icon: icons.driver,
            },
            {
                href: "/tamu",
                title: "Kendaraan Tamu",
                description: "Pencatatan kendaraan tamu dan pengunjung.",
                icon: icons.tamu,
            },
            {
                href: "/login",
                title: "Masuk",
                description: "Akses fitur internal dengan akun terdaftar.",
                icon: icons.login,
            },
        ],
        [icons],
    );

    const features = useMemo(
        () => [
            {
                title: "Pencatatan Digital",
                description:
                    "Pencatatan trip dan penggunaan kendaraan yang rapi, mudah ditelusuri, dan siap audit.",
                icon: (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h6m-6 4h6M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H9l-2 2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                    </svg>
                ),
            },
            {
                title: "Kontrol & Kepatuhan",
                description:
                    "Akses berbasis peran, konfirmasi perubahan, dan riwayat aktivitas untuk menjaga integritas data.",
                icon: (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5.5 20a6.5 6.5 0 0113 0"
                        />
                    </svg>
                ),
            },
            {
                title: "Laporan Operasional",
                description:
                    "Mendukung pelacakan BBM, status trip, dan ringkasan penggunaan untuk pengambilan keputusan.",
                icon: (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 19h16M6 17V9m6 8V5m6 12v-6"
                        />
                    </svg>
                ),
            },
        ],
        [],
    );

    return (
        <>
            <Head title="Home" />
            <a
                href="#konten"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-blue-700 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                Lewati ke konten utama
            </a>

            <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
                <header className="border-b border-gray-100 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/70">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
                            aria-label="Beranda"
                        >
                            <ApplicationLogo className="h-9 w-auto" />
                            <span className="hidden text-sm font-semibold text-gray-800 dark:text-gray-100 sm:inline">
                                Kendaraan Dinas PLN
                            </span>
                        </Link>
                        <nav
                            className="flex items-center gap-2"
                            aria-label="Navigasi utama"
                        >
                            <SecondaryLink href="/login" icon={icons.login}>
                                Masuk
                            </SecondaryLink>
                            <PrimaryLink
                                href="/dashboard"
                                icon={icons.arrowRight}
                            >
                                Buka Dashboard
                            </PrimaryLink>
                        </nav>
                    </div>
                </header>

                <main id="konten" className="relative">
                    <picture aria-hidden="true">
                        <source
                            media="(min-width: 1024px)"
                            srcSet="/img/pattern.jpg"
                        />
                        <img
                            src="/img/patern.png"
                            alt=""
                            decoding="async"
                            className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover opacity-10 grayscale dark:opacity-[0.06]"
                        />
                    </picture>
                    <div
                        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1000px_500px_at_50%_0%,rgba(37,99,235,0.18),transparent_65%),radial-gradient(800px_400px_at_10%_20%,rgba(99,102,241,0.14),transparent_60%),radial-gradient(700px_350px_at_90%_25%,rgba(14,165,233,0.12),transparent_55%)]"
                        aria-hidden="true"
                    />

                    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
                        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
                            <div className="lg:col-span-7">
                                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
                                    Sistem monitoring kendaraan dinas yang rapi,
                                    cepat, dan siap audit
                                </h1>
                                <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
                                    Kelola trip, driver, kendaraan, dan
                                    pencatatan BBM dengan alur kerja yang jelas,
                                    kontrol akses, serta riwayat perubahan untuk
                                    menjaga akurasi data.
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <PrimaryLink
                                        href="/dashboard"
                                        icon={icons.arrowRight}
                                    >
                                        Mulai dari Dashboard
                                    </PrimaryLink>
                                    <SecondaryLink
                                        href="/trip"
                                        icon={icons.trip}
                                    >
                                        Lihat Trip Kendaraan
                                    </SecondaryLink>
                                </div>

                                <dl className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                        <dt className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            <span className="text-blue-600 dark:text-blue-300">
                                                {icons.clock}
                                            </span>
                                            Transparansi
                                        </dt>
                                        <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                            Riwayat perubahan & audit trail
                                        </dd>
                                    </div>
                                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                        <dt className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            <span className="text-blue-600 dark:text-blue-300">
                                                {icons.arrowRight}
                                            </span>
                                            Efisiensi
                                        </dt>
                                        <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                            Akses cepat ke fitur inti
                                        </dd>
                                    </div>
                                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                        <dt className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            <span className="text-blue-600 dark:text-blue-300">
                                                {icons.shield}
                                            </span>
                                            Kepatuhan
                                        </dt>
                                        <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                            Kontrol akses berbasis peran
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="lg:col-span-5">
                                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Akses cepat
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                        Pilih modul yang ingin Anda buka.
                                    </p>

                                    <div className="mt-5 grid grid-cols-1 gap-3">
                                        {quickLinks.slice(0, 4).map((item) => (
                                            <QuickLinkCard
                                                key={item.href}
                                                href={item.href}
                                                title={item.title}
                                                description={item.description}
                                                icon={item.icon}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {renderBelowFold && (
                        <>
                            <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
                                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            Modul aplikasi
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                            Navigasi yang konsisten dengan
                                            halaman internal untuk pengalaman
                                            yang mulus.
                                        </p>
                                    </div>
                                    <SecondaryLink href="/dashboard">
                                        Lihat ringkasan
                                    </SecondaryLink>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {quickLinks.map((item) => (
                                        <QuickLinkCard
                                            key={item.href}
                                            href={item.href}
                                            title={item.title}
                                            description={item.description}
                                            icon={item.icon}
                                        />
                                    ))}
                                </div>
                            </section>

                            <section className="border-t border-gray-100 bg-white py-14 dark:border-gray-800 dark:bg-gray-950">
                                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Mengapa aplikasi ini
                                    </h2>
                                    <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
                                        Dirancang untuk operasional: fokus pada
                                        akurasi, kontrol, dan kemudahan
                                        penggunaan.
                                    </p>

                                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {features.map((feature) => (
                                            <FeatureCard
                                                key={feature.title}
                                                title={feature.title}
                                                description={
                                                    feature.description
                                                }
                                                icon={feature.icon}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </main>

                <footer className="border-t border-gray-100 bg-white py-8 dark:border-gray-800 dark:bg-gray-950">
                    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 dark:text-gray-400">
                        <p>Sistem Monitoring Kendaraan Dinas PLN</p>
                        <p>© {new Date().getFullYear()} — Internal use</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
