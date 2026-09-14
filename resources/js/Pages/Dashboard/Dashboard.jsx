import React, { useState, useEffect } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement,
    ArcElement,
    DoughnutController,
    Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Head, usePage, Link } from "@inertiajs/react";
import {
    FaCar,
    FaUserTie,
    FaRoute,
    FaCalendarCheck,
    FaChartLine,
    FaMapMarkerAlt,
    FaTachometerAlt,
    FaCalendarAlt,
    FaArrowUp,
    FaArrowDown,
    FaShieldAlt,
} from "react-icons/fa";

// Registrasi ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    DoughnutController,
    Title,
    Tooltip,
    Legend,
    Filler,
);

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

    const isAdmin = !!auth?.user?.isAdmin;
    const userLocation = auth?.user?.lokasi ? auth.user.lokasi.trim() : "";

    // Data recentTrips SUDAH difilter SERVER-SIDE (backend):
    //   - Admin: semua trip dengan status "Sedang Berjalan" (tanpa filter lokasi)
    //   - User biasa: hanya trip dengan status "Sedang Berjalan" DAN lokasi === user.lokasi
    // Tidak perlu filter client-side lagi.
    const filteredRecentTrips = recentTrips || [];

    // Update chart theme when dark mode changes
    useEffect(() => {
        const darkModeListener = () => {
            setIsDarkMode(localStorage.getItem("darkMode") === "true");
        };

        window.addEventListener("darkModeChanged", darkModeListener);
        return () => {
            window.removeEventListener("darkModeChanged", darkModeListener);
        };
    }, []);

    // Warna untuk chart - Modern color palette
    const chartColors = {
        primary: isDarkMode ? "rgba(129, 140, 248, 1)" : "rgba(79, 70, 229, 1)", // indigo
        primaryLight: isDarkMode
            ? "rgba(129, 140, 248, 0.2)"
            : "rgba(79, 70, 229, 0.2)",
        secondary: isDarkMode
            ? "rgba(52, 211, 153, 1)"
            : "rgba(16, 185, 129, 1)", // emerald
        secondaryLight: isDarkMode
            ? "rgba(52, 211, 153, 0.2)"
            : "rgba(16, 185, 129, 0.2)",
        warning: isDarkMode ? "rgba(251, 191, 36, 1)" : "rgba(245, 158, 11, 1)", // amber
        warningLight: isDarkMode
            ? "rgba(251, 191, 36, 0.2)"
            : "rgba(245, 158, 11, 0.2)",
        danger: isDarkMode ? "rgba(248, 113, 113, 1)" : "rgba(239, 68, 68, 1)", // red
        dangerLight: isDarkMode
            ? "rgba(248, 113, 113, 0.2)"
            : "rgba(239, 68, 68, 0.2)",
        purple: isDarkMode ? "rgba(167, 139, 250, 1)" : "rgba(139, 92, 246, 1)", // purple
        purpleLight: isDarkMode
            ? "rgba(167, 139, 250, 0.2)"
            : "rgba(139, 92, 246, 0.2)",
        text: isDarkMode ? "rgba(229, 231, 235, 0.9)" : "rgba(55, 65, 81, 0.9)",
        grid: isDarkMode ? "rgba(75, 85, 99, 0.2)" : "rgba(209, 213, 219, 0.2)",
    };

    // Opsi umum untuk chart
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
                    padding: 20,
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
        elements: {
            line: {
                tension: 0.4, // Smoother curves
            },
            point: {
                radius: 4,
                hoverRadius: 6,
            },
        },
    };

    // Data untuk Trip Activity Chart (Line Chart)
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
                tension: 0.4,
                fill: true,
                pointBackgroundColor: chartColors.primary,
            },
            {
                label: "Total Kilometer",
                data: tripStats?.dailyKilometers || [
                    120, 180, 150, 210, 160, 90, 110,
                ],
                borderColor: chartColors.secondary,
                backgroundColor: chartColors.secondaryLight,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: chartColors.secondary,
                yAxisID: "y1",
            },
        ],
    };

    // Opsi khusus untuk Trip Activity Chart
    const tripActivityOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            title: {
                display: true,
                text: "Aktivitas Trip Mingguan",
                color: chartColors.text,
                font: {
                    size: 16,
                    weight: "bold",
                    family: "'Inter', sans-serif",
                },
                padding: {
                    top: 10,
                    bottom: 20,
                },
            },
        },
        scales: {
            ...chartOptions.scales,
            y: {
                ...chartOptions.scales.y,
                title: {
                    display: true,
                    text: "Jumlah Trip",
                    color: chartColors.text,
                    font: {
                        weight: 500,
                    },
                    padding: {
                        bottom: 10,
                    },
                },
            },
            y1: {
                position: "right",
                title: {
                    display: true,
                    text: "Kilometer",
                    color: chartColors.text,
                    font: {
                        weight: 500,
                    },
                    padding: {
                        bottom: 10,
                    },
                },
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

    // Data untuk Vehicle Usage Chart (Bar Chart)
    const vehicleUsageData = {
        labels: vehicleStats?.labels || [
            "Avanza",
            "Innova",
            "Xenia",
            "Fortuner",
            "Alphard",
        ],
        datasets: [
            {
                label: "Jumlah Trip",
                data: vehicleStats?.tripCounts || [12, 8, 10, 5, 3],
                backgroundColor: [
                    chartColors.primary,
                    chartColors.secondary,
                    chartColors.warning,
                    chartColors.danger,
                    chartColors.purple,
                ],
                borderRadius: 8,
                borderWidth: 0,
                hoverOffset: 4,
            },
        ],
    };

    // Opsi khusus untuk Vehicle Usage Chart
    const vehicleUsageOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            title: {
                display: true,
                text: "Penggunaan Kendaraan",
                color: chartColors.text,
                font: {
                    size: 16,
                    weight: "bold",
                    family: "'Inter', sans-serif",
                },
                padding: {
                    top: 10,
                    bottom: 20,
                },
            },
        },
        scales: {
            ...chartOptions.scales,
            y: {
                ...chartOptions.scales.y,
                title: {
                    display: true,
                    text: "Jumlah Trip",
                    color: chartColors.text,
                    font: {
                        weight: 500,
                    },
                    padding: {
                        bottom: 10,
                    },
                },
            },
        },
    };

    // Format tanggal
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Format waktu
    const formatTime = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <>
            <Head title="Dashboard" />
            <DashboardLayout>
                <div className="p-0 md:px-0">
                    {/* Context Bar: Role & Location Indicator */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                                <FaTachometerAlt className="mr-2 text-indigo-600 dark:text-indigo-400" />
                                Dashboard
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Selamat datang, {auth?.user?.name || "Pengguna"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            {isAdmin ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm ring-1 ring-amber-500/20">
                                    <FaShieldAlt className="h-3.5 w-3.5" />
                                    Admin · Semua Lokasi
                                </span>
                            ) : userLocation ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm ring-1 ring-sky-500/20">
                                    <FaMapMarkerAlt className="h-3.5 w-3.5" />
                                    Hanya Lokasi: {userLocation}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 ring-1 ring-gray-200 dark:ring-gray-600">
                                    <FaMapMarkerAlt className="h-3.5 w-3.5" />
                                    Lokasi tidak ditentukan
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white dark:bg-[#1f2937] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 transition-all hover:shadow-md">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Total Trip
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {tripStats?.totalTrips || 0}
                                    </p>
                                </div>
                                <div className="bg-blue-100 dark:bg-blue-900/30 h-12 w-12 rounded-lg flex items-center justify-center">
                                    <FaRoute className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <span className="text-green-500 dark:text-green-400 flex items-center">
                                    <FaArrowUp className="h-3 w-3 mr-1" />
                                    {tripStats?.activeTrips || 0}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">
                                    Trip aktif saat ini
                                </span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1f2937] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 transition-all hover:shadow-md">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Total Jarak
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {tripStats?.totalKilometers?.toLocaleString() ||
                                            0}{" "}
                                        km
                                    </p>
                                </div>
                                <div className="bg-purple-100 dark:bg-purple-900/30 h-12 w-12 rounded-lg flex items-center justify-center">
                                    <FaChartLine className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <span className="text-green-500 dark:text-green-400 flex items-center">
                                    <FaArrowUp className="h-3 w-3 mr-1" />
                                    {tripStats?.weeklyKilometers?.toLocaleString() ||
                                        0}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">
                                    km dalam 7 hari terakhir
                                </span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1f2937] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 transition-all hover:shadow-md">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Total Kendaraan
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {vehicleStats?.totalVehicles || 0}
                                    </p>
                                </div>
                                <div className="bg-green-100 dark:bg-green-900/30 h-12 w-12 rounded-lg flex items-center justify-center">
                                    <FaCar className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <span className="text-green-500 dark:text-green-400 flex items-center">
                                    <FaArrowUp className="h-3 w-3 mr-1" />
                                    {vehicleStats?.availableVehicles || 0}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">
                                    kendaraan tersedia
                                </span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1f2937] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 transition-all hover:shadow-md">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Total Driver
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {driverStats?.totalDrivers || 0}
                                    </p>
                                </div>
                                <div className="bg-amber-100 dark:bg-amber-900/30 h-12 w-12 rounded-lg flex items-center justify-center">
                                    <FaUserTie className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <span className="text-green-500 dark:text-green-400 flex items-center">
                                    <FaArrowUp className="h-3 w-3 mr-1" />
                                    {driverStats?.availableDrivers || 0}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">
                                    driver tersedia
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Stats and Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white dark:bg-[#1f2937] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 transition-all hover:shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                                <FaCalendarAlt className="mr-2 text-blue-500 dark:text-blue-400" />
                                Statistik Bulanan
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-xl text-white">
                                    <p className="text-xs font-medium text-indigo-100 mb-1">
                                        Total Trip Bulan Ini
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {tripStats?.monthlyTrips || 0}
                                    </p>
                                    <div className="mt-2 text-xs flex items-center text-indigo-100">
                                        {tripStats?.monthlyTripGrowth >= 0 ? (
                                            <svg
                                                className="w-3 h-3 mr-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                                                ></path>
                                            </svg>
                                        ) : (
                                            <svg
                                                className="w-3 h-3 mr-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                                ></path>
                                            </svg>
                                        )}
                                        <span>
                                            {Math.abs(
                                                tripStats?.monthlyTripGrowth ||
                                                    0,
                                            )}
                                            % dari bulan lalu
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-xl text-white">
                                    <p className="text-xs font-medium text-emerald-100 mb-1">
                                        Jarak Tempuh Bulan Ini
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {tripStats?.monthlyKilometers?.toLocaleString() ||
                                            0}{" "}
                                        km
                                    </p>
                                    <div className="mt-2 text-xs flex items-center text-emerald-100">
                                        {tripStats?.monthlyKilometerGrowth >=
                                        0 ? (
                                            <svg
                                                className="w-3 h-3 mr-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                                                ></path>
                                            </svg>
                                        ) : (
                                            <svg
                                                className="w-3 h-3 mr-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                                ></path>
                                            </svg>
                                        )}
                                        <span>
                                            {Math.abs(
                                                tripStats?.monthlyKilometerGrowth ||
                                                    0,
                                            )}
                                            % dari bulan lalu
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-white dark:bg-[#1f2937] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 transition-all hover:shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                                <FaChartLine className="mr-2 text-blue-500 dark:text-blue-400" />
                                Aktivitas Trip 7 Hari Terakhir
                            </h3>
                            <div className="h-64">
                                <Bar
                                    data={tripActivityData}
                                    options={tripActivityOptions}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Recent Trips */}
                    <div className="bg-white dark:bg-[#1f2937] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 transition-all hover:shadow-md mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                            <FaRoute className="mr-2 text-blue-500 dark:text-blue-400" />
                            Trip Terbaru
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Kode Trip
                                        </th>
                                        <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Tujuan
                                        </th>
                                        <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Kendaraan
                                        </th>
                                        <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Driver
                                        </th>
                                        <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Waktu Berangkat
                                        </th>
                                        <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-[#1f2937] dark:divide-gray-700">
                                    {filteredRecentTrips &&
                                    filteredRecentTrips.length > 0 ? (
                                        filteredRecentTrips.map((trip) => (
                                            <tr
                                                key={trip.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {trip.code_trip}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {trip.tujuan}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {trip.kendaraan?.merek} (
                                                    {
                                                        trip.kendaraan
                                                            ?.plat_kendaraan
                                                    }
                                                    )
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {trip.driver?.name || "-"}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {new Date(
                                                        trip.waktu_keberangkatan,
                                                    ).toLocaleString("id-ID", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                        ${
                                                            trip.status ===
                                                            "Sedang Berjalan"
                                                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                                : trip.status ===
                                                                    "Selesai"
                                                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                        }`}
                                                    >
                                                        {trip.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                                            >
                                                Tidak ada data trip terbaru
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
