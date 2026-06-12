import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import React, { useMemo } from "react";

function StatCard({ label, value, helper, icon }) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {label}
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-gray-900">
                        {value}
                    </div>
                    {helper ? (
                        <div className="mt-1 text-sm text-gray-600">
                            {helper}
                        </div>
                    ) : null}
                </div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-700">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function ActionCard({ href, title, description, icon }) {
    return (
        <Link
            href={href}
            className="group rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
            <div className="flex items-start gap-4">
                <div className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    {icon}
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900">
                        {title}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                        {description}
                    </div>
                </div>
                <div className="ml-auto pt-1 text-gray-400 transition-colors group-hover:text-gray-600">
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
                </div>
            </div>
        </Link>
    );
}

export default function Dashboard(props) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const tripStats = props?.tripStats;
    const vehicleStats = props?.vehicleStats;
    const driverStats = props?.driverStats;
    const recentTrips = Array.isArray(props?.recentTrips)
        ? props.recentTrips
        : [];

    const formattedDate = useMemo(() => {
        try {
            return new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return "";
        }
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Dashboard
                    </h2>
                    <div className="text-sm text-gray-500">{formattedDate}</div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="text-sm text-gray-600">
                                    Selamat datang
                                </div>
                                <div className="text-lg font-semibold text-gray-900">
                                    {user?.name || "Pengguna"}
                                </div>
                                <div className="mt-1 text-sm text-gray-500">
                                    {user?.role
                                        ? `Role: ${user.role}`
                                        : "Role: -"}
                                    {user?.lokasi
                                        ? ` • Lokasi: ${user.lokasi}`
                                        : ""}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Link
                                    href="/trip"
                                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Lihat Trip
                                </Link>
                                <Link
                                    href="/trips/add"
                                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Buat Trip
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            label="Trip Berjalan"
                            value={tripStats?.activeTrips ?? "—"}
                            helper="Status: Sedang Berjalan"
                            icon={
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
                                        d="M12 6v6l4 2"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 22a10 10 0 110-20 10 10 0 010 20z"
                                    />
                                </svg>
                            }
                        />
                        <StatCard
                            label="Total Trip"
                            value={tripStats?.totalTrips ?? "—"}
                            helper="Semua data trip"
                            icon={
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
                            }
                        />
                        <StatCard
                            label="Total Kendaraan"
                            value={vehicleStats?.totalVehicles ?? "—"}
                            helper="Armada terdaftar"
                            icon={
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
                                </svg>
                            }
                        />
                        <StatCard
                            label="Total Driver"
                            value={driverStats?.totalDrivers ?? "—"}
                            helper="Driver terdaftar"
                            icon={
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
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                                <div className="border-b border-gray-100 px-6 py-4">
                                    <div className="text-sm font-semibold text-gray-900">
                                        Trip terbaru
                                    </div>
                                    <div className="mt-1 text-sm text-gray-600">
                                        Ringkasan aktivitas terakhir.
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-100">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Kode Trip
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Tujuan
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Kendaraan
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {recentTrips.length > 0 ? (
                                                recentTrips.map((trip) => (
                                                    <tr
                                                        key={
                                                            trip.code_trip ||
                                                            trip.id
                                                        }
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="whitespace-nowrap px-6 py-3 text-sm font-semibold text-gray-900">
                                                            {trip.code_trip ||
                                                                "-"}
                                                        </td>
                                                        <td className="px-6 py-3 text-sm text-gray-700">
                                                            {trip.tujuan || "-"}
                                                        </td>
                                                        <td className="px-6 py-3 text-sm text-gray-700">
                                                            {trip.kendaraan
                                                                ?.plat_kendaraan ||
                                                                "-"}
                                                        </td>
                                                        <td className="px-6 py-3 text-sm">
                                                            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                                                                {trip.status ||
                                                                    "-"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="px-6 py-8 text-center text-sm text-gray-500"
                                                    >
                                                        Tidak ada data trip
                                                        terbaru.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex items-center justify-between px-6 py-4">
                                    <div className="text-sm text-gray-600">
                                        Buka halaman Trip untuk detail lengkap.
                                    </div>
                                    <Link
                                        href="/trip"
                                        className="text-sm font-semibold text-blue-700 hover:underline"
                                    >
                                        Lihat semua
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="text-sm font-semibold text-gray-900">
                                    Aksi cepat
                                </div>
                                <div className="mt-4 grid grid-cols-1 gap-3">
                                    <ActionCard
                                        href="/kendaraan"
                                        title="Kendaraan"
                                        description="Kelola armada dan status."
                                        icon={
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
                                            </svg>
                                        }
                                    />
                                    <ActionCard
                                        href="/driver"
                                        title="Driver"
                                        description="Kelola driver dan kontak."
                                        icon={
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
                                        }
                                    />
                                    <ActionCard
                                        href="/tamu"
                                        title="Kendaraan Tamu"
                                        description="Pencatatan pengunjung."
                                        icon={
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
                                        }
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="text-sm font-semibold text-gray-900">
                                    Catatan
                                </div>
                                <div className="mt-2 text-sm leading-relaxed text-gray-600">
                                    Gunakan fitur edit untuk koreksi data yang
                                    keliru. Setiap perubahan tercatat untuk
                                    audit.
                                </div>
                                <div className="mt-4">
                                    <Link
                                        href="/trip"
                                        className="text-sm font-semibold text-blue-700 hover:underline"
                                    >
                                        Buka modul Trip
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
