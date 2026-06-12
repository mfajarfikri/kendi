import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    BarElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Head, usePage, Link } from "@inertiajs/react";
import {
    FaCar,
    FaUserTie,
    FaRoute,
    FaChartLine,
    FaCalendarAlt,
    FaArrowUp,
    FaArrowDown,
} from "react-icons/fa";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

function formatNumber(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "0";
    return n.toLocaleString("id-ID");
}

function formatDateTime(dateString) {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function Card({ children, className }) {
    return (
        <div
            className={cx(
                "rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#1f2937]",
                className,
            )}
        >
            {children}
        </div>
    );
}

function CardHeader({ title, subtitle, right }) {
    return (
        <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {title}
                </h3>
                {subtitle ? (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {subtitle}
                    </p>
                ) : null}
            </div>
            {right ? <div className="shrink-0">{right}</div> : null}
        </div>
    );
}

function KpiCard({ label, value, helper, icon, accent }) {
    return (
        <Card className="p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {label}
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                        {value}
                    </div>
                    {helper ? (
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            {helper}
                        </div>
                    ) : null}
                </div>
                <div
                    className={cx(
                        "inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800",
                        accent,
                    )}
                    aria-hidden="true"
                >
                    {icon}
                </div>
            </div>
        </Card>
    );
}

function Badge({ status }) {
    const normalized = String(status || "").toLowerCase();
    const theme =
        normalized === "sedang berjalan"
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            : normalized === "selesai"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";

    return (
        <span
            className={cx(
                "inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
                theme,
            )}
        >
            {status || "-"}
        </span>
    );
}

export default function Dashboard({
    tripStats,
    vehicleStats,
    driverStats,
    recentTrips,
}) {
    const { auth } = usePage().props;
    const [isDarkMode, setIsDarkMode] = useState(
        localStorage.getItem("darkMode") === "true",
    );

    const safeRecentTrips = Array.isArray(recentTrips) ? recentTrips : [];

    const runningTrips = useMemo(() => {
        const base = safeRecentTrips.filter(
            (trip) => trip.status === "Sedang Berjalan",
        );

        if (auth?.user?.isAdmin) return base;
        const lokasi = auth?.user?.lokasi;
        if (!lokasi || String(lokasi).trim() === "") return base;

        return base.filter(
            (trip) =>
                trip.lokasi &&
                String(trip.lokasi).toLowerCase() ===
                    String(lokasi).toLowerCase(),
        );
    }, [safeRecentTrips, auth?.user?.lokasi, auth?.user?.isAdmin]);

    useEffect(() => {
        const darkModeListener = () => {
            setIsDarkMode(localStorage.getItem("darkMode") === "true");
        };

        window.addEventListener("darkModeChanged", darkModeListener);
        return () => {
            window.removeEventListener("darkModeChanged", darkModeListener);
        };
    }, []);

    const chartColors = {
        primary: isDarkMode ? "rgba(129, 140, 248, 1)" : "rgba(79, 70, 229, 1)",
        primaryLight: isDarkMode
            ? "rgba(129, 140, 248, 0.2)"
            : "rgba(79, 70, 229, 0.2)",
        secondary: isDarkMode
            ? "rgba(52, 211, 153, 1)"
            : "rgba(16, 185, 129, 1)",
        secondaryLight: isDarkMode
            ? "rgba(52, 211, 153, 0.2)"
            : "rgba(16, 185, 129, 0.2)",
        text: isDarkMode ? "rgba(229, 231, 235, 0.9)" : "rgba(55, 65, 81, 0.9)",
        grid: isDarkMode ? "rgba(75, 85, 99, 0.2)" : "rgba(209, 213, 219, 0.2)",
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                labels: {
                    color: chartColors.text,
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif",
                        weight: 500,
                    },
                    usePointStyle: true,
                    padding: 16,
                },
            },
            tooltip: {
                backgroundColor: isDarkMode
                    ? "rgba(30, 41, 59, 0.9)"
                    : "rgba(255, 255, 255, 0.95)",
                titleColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.95)"
                    : "rgba(17, 24, 39, 0.95)",
                bodyColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.8)"
                    : "rgba(55, 65, 81, 0.9)",
                borderColor: isDarkMode
                    ? "rgba(75, 85, 99, 0.2)"
                    : "rgba(209, 213, 219, 0.3)",
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                bodyFont: {
                    family: "'Inter', sans-serif",
                },
                cornerRadius: 8,
            },
        },
        scales: {
            x: {
                grid: {
                    color: chartColors.grid,
                    drawBorder: false,
                },
                ticks: {
                    color: chartColors.text,
                    font: {
                        family: "'Inter', sans-serif",
                        weight: 500,
                    },
                    padding: 10,
                },
            },
            y: {
                grid: {
                    color: chartColors.grid,
                    drawBorder: false,
                },
                ticks: {
                    color: chartColors.text,
                    font: {
                        family: "'Inter', sans-serif",
                        weight: 500,
                    },
                    padding: 10,
                },
                beginAtZero: true,
            },
        },
    };

    const tripActivityData = {
        labels: tripStats?.dailyLabels || [
            "Sen",
            "Sel",
            "Rab",
            "Kam",
            "Jum",
            "Sab",
            "Min",
        ],
        datasets: [
            {
                label: "Total Trip",
                data: tripStats?.dailyCounts || [5, 8, 6, 9, 7, 3, 4],
                borderColor: chartColors.primary,
                backgroundColor: chartColors.primaryLight,
                borderWidth: 1,
            },
            {
                label: "Total Kilometer",
                data: tripStats?.dailyKilometers || [
                    120, 180, 150, 210, 160, 90, 110,
                ],
                borderColor: chartColors.secondary,
                backgroundColor: chartColors.secondaryLight,
                borderWidth: 1,
                yAxisID: "y1",
            },
        ],
    };

    const tripActivityOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            title: { display: false },
        },
        scales: {
            ...chartOptions.scales,
            y: {
                ...chartOptions.scales.y,
                title: { display: false },
            },
            y1: {
                position: "right",
                title: { display: false },
                grid: {
                    drawOnChartArea: false,
                    color: chartColors.grid,
                    drawBorder: false,
                },
                ticks: {
                    color: chartColors.text,
                    font: {
                        family: "'Inter', sans-serif",
                        weight: 500,
                    },
                    padding: 10,
                },
                beginAtZero: true,
            },
        },
    };

    const monthlyTripGrowth = Number(tripStats?.monthlyTripGrowth || 0);
    const monthlyKmGrowth = Number(tripStats?.monthlyKilometerGrowth || 0);

    return (
        <>
            <Head title="Dashboard" />
            <DashboardLayout>
                <div className="p-0 md:px-0">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                Ringkasan operasional
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                                <span>{auth?.user?.name || "-"}</span>
                                {auth?.user?.lokasi ? (
                                    <span>• Lokasi: {auth.user.lokasi}</span>
                                ) : null}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Link
                                href="/trip"
                                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-800 dark:bg-[#1f2937] dark:text-gray-100 dark:hover:bg-gray-800"
                            >
                                Trip
                            </Link>
                            <Link
                                href="/kendaraan"
                                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-800 dark:bg-[#1f2937] dark:text-gray-100 dark:hover:bg-gray-800"
                            >
                                Kendaraan
                            </Link>
                            <Link
                                href="/driver"
                                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-800 dark:bg-[#1f2937] dark:text-gray-100 dark:hover:bg-gray-800"
                            >
                                Driver
                            </Link>
                            <Link
                                href="/tamu"
                                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-800 dark:bg-[#1f2937] dark:text-gray-100 dark:hover:bg-gray-800"
                            >
                                Tamu
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <KpiCard
                            label="Trip Berjalan"
                            value={formatNumber(tripStats?.activeTrips || 0)}
                            helper="Status: Sedang Berjalan"
                            icon={
                                <FaRoute className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            }
                        />
                        <KpiCard
                            label="Total Trip"
                            value={formatNumber(tripStats?.totalTrips || 0)}
                            helper="Seluruh data trip"
                            icon={
                                <FaCalendarAlt className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                            }
                        />
                        <KpiCard
                            label="Kendaraan"
                            value={formatNumber(
                                vehicleStats?.totalVehicles || 0,
                            )}
                            helper={`${formatNumber(vehicleStats?.availableVehicles || 0)} tersedia`}
                            icon={
                                <FaCar className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                            }
                        />
                        <KpiCard
                            label="Driver"
                            value={formatNumber(driverStats?.totalDrivers || 0)}
                            helper={`${formatNumber(driverStats?.availableDrivers || 0)} tersedia`}
                            icon={
                                <FaUserTie className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                            }
                        />
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <Card className="lg:col-span-2">
                            <CardHeader
                                title="Aktivitas 7 Hari"
                                subtitle="Total Trip dan Kilometer per hari."
                                right={
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Sumbu kanan: Kilometer
                                    </div>
                                }
                            />
                            <div className="h-72 px-5 py-4">
                                <Bar
                                    data={tripActivityData}
                                    options={tripActivityOptions}
                                />
                            </div>
                        </Card>

                        <Card>
                            <CardHeader
                                title="Ringkasan Bulanan"
                                subtitle="Perbandingan terhadap bulan sebelumnya."
                            />
                            <div className="space-y-3 px-5 py-4">
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Trip Bulan Ini
                                    </div>
                                    <div className="mt-2 flex items-end justify-between gap-3">
                                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                                            {formatNumber(
                                                tripStats?.monthlyTrips || 0,
                                            )}
                                        </div>
                                        <div
                                            className={cx(
                                                "inline-flex items-center text-xs font-semibold",
                                                monthlyTripGrowth >= 0
                                                    ? "text-green-600 dark:text-green-400"
                                                    : "text-red-600 dark:text-red-400",
                                            )}
                                        >
                                            {monthlyTripGrowth >= 0 ? (
                                                <FaArrowUp className="mr-1 h-3 w-3" />
                                            ) : (
                                                <FaArrowDown className="mr-1 h-3 w-3" />
                                            )}
                                            {Math.abs(monthlyTripGrowth)}%
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Kilometer Bulan Ini
                                    </div>
                                    <div className="mt-2 flex items-end justify-between gap-3">
                                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                                            {formatNumber(
                                                tripStats?.monthlyKilometers ||
                                                    0,
                                            )}{" "}
                                            km
                                        </div>
                                        <div
                                            className={cx(
                                                "inline-flex items-center text-xs font-semibold",
                                                monthlyKmGrowth >= 0
                                                    ? "text-green-600 dark:text-green-400"
                                                    : "text-red-600 dark:text-red-400",
                                            )}
                                        >
                                            {monthlyKmGrowth >= 0 ? (
                                                <FaArrowUp className="mr-1 h-3 w-3" />
                                            ) : (
                                                <FaArrowDown className="mr-1 h-3 w-3" />
                                            )}
                                            {Math.abs(monthlyKmGrowth)}%
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-[#1f2937]">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Total Kilometer
                                    </div>
                                    <div className="mt-2 flex items-center justify-between gap-3">
                                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatNumber(
                                                tripStats?.totalKilometers || 0,
                                            )}{" "}
                                            km
                                        </div>
                                        <div className="inline-flex items-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                                            <FaChartLine className="mr-1 h-3 w-3" />
                                            {formatNumber(
                                                tripStats?.weeklyKilometers ||
                                                    0,
                                            )}{" "}
                                            km / 7 hari
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card className="mt-6">
                        <CardHeader
                            title="Trip Sedang Berjalan"
                            subtitle="Menampilkan trip berjalan sesuai lokasi pengguna."
                            right={
                                <Link
                                    href="/trip"
                                    className="text-sm font-semibold text-blue-700 hover:underline dark:text-blue-400"
                                >
                                    Buka modul Trip
                                </Link>
                            }
                        />
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                            Kode
                                        </th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                            Tujuan
                                        </th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                            Kendaraan
                                        </th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                            Driver
                                        </th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                            Berangkat
                                        </th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                            Status
                                        </th>
                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-[#1f2937]">
                                    {runningTrips.length > 0 ? (
                                        runningTrips.map((trip) => (
                                            <tr
                                                key={trip.id || trip.code_trip}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <td className="whitespace-nowrap px-5 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                                                    {trip.code_trip || "-"}
                                                </td>
                                                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                    {trip.tujuan || "-"}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                    {trip.kendaraan
                                                        ?.plat_kendaraan || "-"}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                    {trip.driver?.name || "-"}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                    {formatDateTime(
                                                        trip.waktu_keberangkatan,
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-sm">
                                                    <Badge
                                                        status={trip.status}
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-right text-sm">
                                                    {trip.code_trip ? (
                                                        <Link
                                                            href={`/trips/${trip.code_trip}`}
                                                            className="font-semibold text-blue-700 hover:underline dark:text-blue-400"
                                                        >
                                                            Detail
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-400">
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                                            >
                                                Tidak ada trip yang sedang
                                                berjalan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </DashboardLayout>
        </>
    );
}
