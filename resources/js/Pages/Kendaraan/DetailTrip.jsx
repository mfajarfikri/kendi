import React, { useState, useEffect, Fragment } from "react";
import { Head, Link, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import dateFormat from "dateformat";
import {
    FaArrowLeft,
    FaCar,
    FaUser,
    FaUsers,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaClipboardList,
    FaTachometerAlt,
    FaCamera,
    FaGasPump,
    FaTimes,
    FaSave,
    FaMoneyBillWave,
    FaReceipt,
    FaCalendarDay,
    FaSpinner,
    FaGasPump as FaGasStation,
    FaCheck,
    FaInfo,
} from "react-icons/fa";
import { ToastContainer, toast, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Dialog, Transition, Combobox, RadioGroup } from "@headlessui/react";

// Tambahkan section untuk informasi BBM
const BbmInfoSection = ({ trip, auth }) => {
    if (auth.user.role !== "admin") return null;

    // Jika tidak ada data BBM, return null
    if (
        !trip.jenis_bbm &&
        !trip.jumlah_liter &&
        !trip.harga_per_liter &&
        !trip.total_harga_bbm
    ) {
        return null;
    }

    const getBbmStatusColor = (jenisBbm) => {
        const colors = {
            Pertalite:
                "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
            Pertamax:
                "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
            "Pertamax Turbo":
                "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
            Dexlite:
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
            Solar: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        };
        return (
            colors[jenisBbm] ||
            "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
        );
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-all hover:shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        <FaGasPump className="mr-2 text-blue-500" />
                        Informasi BBM
                    </h2>
                    <div className="flex items-center text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-md">
                        <FaInfo className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                        Hanya untuk admin
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Jenis BBM */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Jenis BBM
                        </p>
                        <span
                            className={`inline-block px-2 py-0.5 rounded-full text-sm font-medium ${getBbmStatusColor(
                                trip.jenis_bbm
                            )}`}
                        >
                            {trip.jenis_bbm || "-"}
                        </span>
                    </div>

                    {/* Jumlah Liter */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Jumlah
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                            {trip.jumlah_liter ? `${trip.jumlah_liter} L` : "-"}
                        </p>
                    </div>

                    {/* Harga per Liter */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Harga/Liter
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                            {trip.harga_per_liter
                                ? new Intl.NumberFormat("id-ID", {
                                      style: "currency",
                                      currency: "IDR",
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                  }).format(trip.harga_per_liter)
                                : "-"}
                        </p>
                    </div>

                    {/* Total Harga */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Total
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                            {trip.total_harga_bbm
                                ? new Intl.NumberFormat("id-ID", {
                                      style: "currency",
                                      currency: "IDR",
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                  }).format(trip.total_harga_bbm)
                                : "-"}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

const formatDateTimeForInput = (dateTimeString) => {
    if (!dateTimeString) return "";

    try {
        // 1. Buat objek Date dari string waktu (misalnya "2025-10-06 17:00:00")
        const date = new Date(dateTimeString);

        // 2. Tambahkan offset 7 jam (untuk mengatasi konversi browser yang berlebihan)
        // Kita geser maju 7 jam agar browser menariknya mundur 7 jam ke waktu yang benar.
        date.setHours(date.getHours() + 7);

        // 3. Konversi ke string ISO (yang akan diubah formatnya oleh browser)
        const isoString = date.toISOString();

        // 4. Potong string ke format YYYY-MM-DDTHH:MM
        return isoString.slice(0, 16);
    } catch (e) {
        return "";
    }
};

export default function DetailTrip({ trip, auth, allVehicles, allDrivers }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [showBbmModal, setShowBbmModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false); // Kontrol modal edit
    const [editData, setEditData] = useState({
        // Data yang diisi di form edit
        // Ambil nilai saat ini dari 'trip' sebagai nilai awal form
        penumpang: trip.penumpang || "",
        tujuan: trip.tujuan || "",
        waktu_keberangkatan: formatDateTimeForInput(trip.waktu_keberangkatan),
        waktu_kembali: formatDateTimeForInput(trip.waktu_kembali),
        catatan: trip.catatan || "",
        km_awal: trip.km_awal || "",
        km_akhir: trip.km_akhir || "",
        // Asumsi Anda mengirim ID driver dan kendaraan juga
        driver_id: trip.driver?.id || "",
        kendaraan_id: trip.kendaraan?.id || "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [bbmData, setBbmData] = useState({
        jumlah_liter: "",
        harga_per_liter: "",
        total_harga: "",
        jenis_bbm: "Pertalite", // Default jenis BBM
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [destinationQuery, setDestinationQuery] = useState("");
    const destinationOptions = [
        "Kantor Pusat",
        "Gudang Utama",
        "GI Kosambi Baru",
        "Workshop",
        "Pelabuhan",
        "Bandara",
    ];
    const [changeLevel, setChangeLevel] = useState("Minor");

    // Autosave draft ke localStorage
    const draftKey = `trip:${trip.code_trip}:editDraft`;
    const [autosaveTimer, setAutosaveTimer] = useState(null);

    // Load draft saat buka modal edit
    useEffect(() => {
        if (showEditModal) {
            try {
                const raw = localStorage.getItem(draftKey);
                if (raw) {
                    const saved = JSON.parse(raw);
                    setEditData((prev) => ({ ...prev, ...saved }));
                }
            } catch (e) {
                console.error("Gagal memuat draft edit:", e);
            }
        }
    }, [showEditModal]);

    // Simpan draft otomatis dengan debounce
    useEffect(() => {
        if (!showEditModal) return;
        if (autosaveTimer) clearTimeout(autosaveTimer);
        const t = setTimeout(() => {
            try {
                localStorage.setItem(draftKey, JSON.stringify(editData));
            } catch (e) {
                console.error("Gagal menyimpan draft edit:", e);
            }
        }, 500);
        setAutosaveTimer(t);
        return () => clearTimeout(t);
    }, [editData, showEditModal]);

    // Daftar jenis BBM
    const jenisBBMOptions = [
        { id: "pertalite", name: "Pertalite", color: "bg-green-500" },
        { id: "pertamax", name: "Pertamax", color: "bg-blue-500" },
        {
            id: "pertamax-turbo",
            name: "Pertamax Turbo",
            color: "bg-indigo-500",
        },
        { id: "dexlite", name: "Dexlite", color: "bg-yellow-500" },
        { id: "solar", name: "Solar", color: "bg-red-500" },
    ];

    // Format tanggal untuk tampilan yang lebih baik
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Extracting the status class into a separate variable
    let statusClass = "";
    let statusIcon = null;
    if (trip.status === "Sedang Berjalan") {
        statusClass =
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        statusIcon = (
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></span>
        );
    } else if (trip.status === "Selesai") {
        statusClass =
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        statusIcon = (
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
        );
    } else {
        statusClass =
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        statusIcon = (
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
        );
    }

    // Tambahkan fungsi untuk mengunduh foto
    const downloadImage = (imageUrl, fileName) => {
        // Buat elemen anchor untuk download
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = fileName || "foto-trip.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Tambahkan fungsi formatter
    const formatCurrency = (value) => {
        const number = value.replace(/[^\d]/g, "");
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(number);
    };

    // Modifikasi handleBbmInputChange
    const handleBbmInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "harga_per_liter") {
            // Hapus semua karakter non-digit
            const numericValue = value.replace(/[^\d]/g, "");
            const jumlahLiter = parseFloat(bbmData.jumlah_liter) || 0;
            const hargaPerLiter = parseFloat(numericValue) || 0;
            const totalHarga = jumlahLiter * hargaPerLiter;

            setBbmData({
                ...bbmData,
                harga_per_liter: numericValue,
                total_harga: totalHarga.toFixed(0),
            });
        } else if (name === "jumlah_liter") {
            const jumlahLiter = parseFloat(value) || 0;
            const hargaPerLiter = parseFloat(bbmData.harga_per_liter) || 0;
            const totalHarga = jumlahLiter * hargaPerLiter;

            setBbmData({
                ...bbmData,
                [name]: value,
                total_harga: totalHarga.toFixed(0),
            });
        } else {
            setBbmData({
                ...bbmData,
                [name]: value,
            });
        }
    };

    // Handle jenis BBM change
    const handleJenisBBMChange = (jenisBBM) => {
        setBbmData({
            ...bbmData,
            jenis_bbm: jenisBBM,
        });
    };

    // Modifikasi handleBbmSubmit
    const handleBbmSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(
            route("trips.update.bbm", trip.code_trip),
            {
                jenis_bbm: bbmData.jenis_bbm,
                jumlah_liter: parseFloat(bbmData.jumlah_liter),
                harga_per_liter: parseFloat(bbmData.harga_per_liter),
                total_harga: parseFloat(bbmData.total_harga),
            },
            {
                onSuccess: () => {
                    setIsSubmitting(false);
                    setShowBbmModal(false);
                    setBbmData({
                        jumlah_liter: "",
                        harga_per_liter: "",
                        total_harga: "",
                        jenis_bbm: "Pertalite",
                    });

                    // Tampilkan toast sukses
                    toast.success("Data BBM berhasil disimpan!", {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    // Tampilkan toast error
                    toast.error("Gagal menyimpan data BBM!", {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });
                },
            }
        );
    };

    // >> Mulai: Fungsi untuk memproses pengajuan edit trip
    const handleEditSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // NOTE: trips.request.edit adalah NAMA ROUTE LARAVEL yang sudah kita tentukan di backend
        router.post(
            route("trips.request.edit", trip.code_trip),
            editData, // Kirim semua data yang ada di state editData
            {
                onSuccess: () => {
                    setIsSubmitting(false);
                    setShowEditModal(false); // Tutup modal
                    try {
                        localStorage.removeItem(
                            `trip:${trip.code_trip}:editDraft`
                        );
                    } catch {}

                    // Tampilkan notifikasi sukses
                    toast.success(
                        "Permintaan perubahan berhasil diajukan! Menunggu persetujuan Admin.",
                        {
                            position: "top-right",
                            autoClose: 5000,
                            theme: "colored",
                        }
                    );
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    console.error(errors);
                    setValidationErrors(errors || {});
                    toast.error(
                        "Gagal mengajukan perubahan. Cek kembali data Anda!",
                        {
                            position: "top-right",
                            autoClose: 5000,
                            theme: "colored",
                        }
                    );
                },
            }
        );
    };
    // << Selesai: Fungsi untuk memproses pengajuan edit trip

    // Modifikasi fungsi renderPhotoSection untuk menambahkan tombol download
    const renderPhotoSection = (photos, title) => {
        // Pastikan photos adalah array dan tidak kosong
        let photoArray = [];

        try {
            if (typeof photos === "string") {
                photoArray = JSON.parse(photos);
            } else if (Array.isArray(photos)) {
                photoArray = photos;
            }
        } catch (e) {
            console.error("Error parsing photos:", e);
        }

        if (!photoArray || photoArray.length === 0) return null;

        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <FaCamera className="mr-2 text-blue-500" /> {title}
                    </h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Klik foto untuk melihat
                    </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photoArray.map((photo, index) => (
                        <div
                            key={`${title}-${index}`}
                            className="group relative aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <img
                                loading="lazy"
                                src={`/storage/${photo}`}
                                alt={`Foto ${title} ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                    console.error(
                                        `Error loading image: ${photo}`
                                    );
                                    e.target.src =
                                        "/path/to/fallback-image.jpg";
                                }}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-black/0 p-2 flex justify-between items-center">
                                <button
                                    onClick={() =>
                                        setSelectedImage(`/storage/${photo}`)
                                    }
                                    className="text-white text-xs flex items-center hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                                    aria-label={`Lihat foto ${title} ${
                                        index + 1
                                    }`}
                                >
                                    <FaCamera className="mr-1" /> Lihat
                                </button>
                                <button
                                    onClick={() =>
                                        downloadImage(
                                            `/storage/${photo}`,
                                            `${trip.code_trip}-${title}-${
                                                index + 1
                                            }.jpg`
                                        )
                                    }
                                    className="text-white text-xs flex items-center hover:text-green-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 rounded"
                                    aria-label={`Unduh foto ${title} ${
                                        index + 1
                                    }`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3 w-3 mr-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                        />
                                    </svg>{" "}
                                    Unduh
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <Head title={`Trip - ${trip.code_trip}`} />
            <DashboardLayout>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme={isDarkMode ? "dark" : "light"}
                    transition={Flip}
                />
                <div className="px-4 md:px-0">
                    {/* Header dengan tombol kembali */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4 md:mb-0">
                            <div className="flex items-center">
                                <Link
                                    href={route("trips.index")}
                                    className="mr-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    aria-label="Kembali ke daftar trip"
                                >
                                    <FaArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                </Link>
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md text-sm">
                                        {trip.code_trip}
                                    </span>
                                </h1>
                            </div>

                            <div className="mt-2 md:mt-0 md:ml-4">
                                <span
                                    className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${statusClass} inline-flex items-center justify-center w-auto max-w-full`}
                                >
                                    <span className="mr-1 flex-shrink-0">
                                        {statusIcon}
                                    </span>
                                    <span className="truncate">
                                        {trip.status}
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Tampilkan tombol edit jika user adalah Admin ATAU user yang membuat trip */}
                        <div className="flex items-center space-x-3">
                            {/* >> Tombol Edit Trip (BARU) */}
                            <button
                                className="text-sm font-medium text-blue-700 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900 px-4 py-2 rounded-md transition duration-300 shadow-sm flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={() => setShowEditModal(true)}
                                aria-label="Edit Trip"
                            >
                                <FaSave className="mr-2" /> Edit Trip
                            </button>

                            {/* Tombol Tambah BBM (Hanya untuk Admin) */}
                            {auth.user.role === "admin" && (
                                <button
                                    className="text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-4 py-2 rounded-md transition duration-300 shadow-sm flex items-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    onClick={() => setShowBbmModal(true)}
                                    aria-label="Tambah data BBM"
                                >
                                    <FaGasPump className="mr-2" /> Tambah BBM
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Informasi Trip */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Informasi Kendaraan dan Driver */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-md">
                            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white flex items-center">
                                <FaCar className="mr-2 text-blue-500" />{" "}
                                Informasi Kendaraan & Driver
                            </h2>
                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-full md:w-1/3 flex items-center">
                                        <FaCar className="mr-2 text-gray-400" />{" "}
                                        Kendaraan:
                                    </span>
                                    <span className="text-sm text-gray-900 dark:text-white w-full md:w-2/3 font-medium">
                                        {trip.kendaraan?.merek || "-"}{" "}
                                        <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-md ml-1 text-xs">
                                            {trip.kendaraan?.plat_kendaraan ||
                                                "-"}
                                        </span>
                                    </span>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-full md:w-1/3 flex items-center">
                                        <FaUser className="mr-2 text-gray-400" />{" "}
                                        Driver:
                                    </span>
                                    <span className="text-sm text-gray-900 dark:text-white w-full md:w-2/3 font-medium">
                                        {trip.driver?.name || "-"} -{" "}
                                        {trip.driver.phone_number || "-"}
                                    </span>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-full md:w-1/3 flex items-center">
                                        <FaUsers className="mr-2 text-gray-400" />{" "}
                                        Penumpang:
                                    </span>
                                    <span className="text-sm text-gray-900 dark:text-white w-full md:w-2/3 font-medium">
                                        {trip.penumpang || "-"}
                                    </span>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-full md:w-1/3 flex items-center">
                                        <FaUser className="mr-2 text-gray-400" />{" "}
                                        Dibuat Oleh:
                                    </span>
                                    <span className="text-sm text-gray-900 dark:text-white w-full md:w-2/3 font-medium">
                                        {trip.createdBy?.name || "-"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Informasi Perjalanan */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-md">
                            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white flex items-center">
                                <FaMapMarkerAlt className="mr-2 text-blue-500" />{" "}
                                Informasi Perjalanan
                            </h2>
                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-full md:w-1/3 flex items-center">
                                        <FaMapMarkerAlt className="mr-2 text-gray-400" />{" "}
                                        Tujuan:
                                    </span>
                                    <span className="text-sm text-gray-900 dark:text-white w-full md:w-2/3 font-medium">
                                        {trip.tujuan || "-"}
                                    </span>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-full md:w-1/3 flex items-center">
                                        <FaCalendarAlt className="mr-2 text-gray-400" />{" "}
                                        Waktu Berangkat:
                                    </span>
                                    <span className="text-sm text-gray-900 dark:text-white w-full md:w-2/3 font-medium">
                                        {formatDate(trip.waktu_keberangkatan)}
                                    </span>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-full md:w-1/3 flex items-center">
                                        <FaCalendarAlt className="mr-2 text-gray-400" />{" "}
                                        Waktu Kembali:
                                    </span>
                                    <span className="text-sm text-gray-900 dark:text-white w-full md:w-2/3 font-medium">
                                        {formatDate(trip.waktu_kembali) || "-"}
                                    </span>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-full md:w-1/3 flex items-center">
                                        <FaClipboardList className="mr-2 text-gray-400" />{" "}
                                        Catatan:
                                    </span>
                                    <span className="text-sm text-gray-900 dark:text-white w-full md:w-2/3 font-medium">
                                        {trip.catatan || "-"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informasi Kilometer */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-all hover:shadow-md">
                        <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white flex items-center">
                            <FaTachometerAlt className="mr-2 text-blue-500" />
                            Informasi Kilometer
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Kilometer Awal
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {String(trip.km_awal).replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            "."
                                        )}
                                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                            km
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Kilometer Akhir
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {String(trip.km_akhir).replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            "."
                                        )}
                                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                            km
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Jarak Tempuh
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {String(trip.jarak).replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            "."
                                        )}
                                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                            km
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tambahkan BbmInfoSection setelah Informasi Kilometer */}
                    {auth.user.role === "admin" && (
                        <BbmInfoSection trip={trip} auth={auth} />
                    )}

                    {/* Foto Berangkat */}
                    {renderPhotoSection(
                        trip.foto_berangkat,
                        "Foto Keberangkatan"
                    )}

                    {/* Foto Kembali */}
                    {renderPhotoSection(trip.foto_kembali, "Foto Kembali")}

                    {/* Lightbox untuk melihat foto */}
                    {selectedImage && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
                            onClick={() => setSelectedImage(null)}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Lihat foto"
                        >
                            <div className="relative max-w-4xl w-full">
                                <div className="absolute top-4 right-4 flex space-x-2">
                                    <button
                                        className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-all flex items-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            downloadImage(
                                                selectedImage,
                                                `foto-trip-${trip.code_trip}.jpg`
                                            );
                                        }}
                                        aria-label="Unduh foto"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImage(null);
                                        }}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <img
                                    loading="lazy"
                                    src={selectedImage}
                                    alt="Foto diperbesar"
                                    className="max-h-[85vh] max-w-full mx-auto object-contain rounded-lg shadow-xl"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                    )}

                    {/* Modal BBM di samping kanan */}
                    <div
                        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
                            showBbmModal ? "translate-x-0" : "translate-x-full"
                        } overflow-y-auto`}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                    <FaGasPump className="mr-2 text-blue-500" />{" "}
                                    Tambah Data BBM
                                </h2>
                                <button
                                    onClick={() => setShowBbmModal(false)}
                                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <FaTimes className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                </button>
                            </div>

                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start">
                                    <span className="bg-blue-100 dark:bg-blue-800 p-1 rounded-full mr-2 flex-shrink-0">
                                        <FaCar className="h-3 w-3 text-blue-500" />
                                    </span>
                                    <span>
                                        <span className="font-medium">
                                            {trip.kendaraan?.merek}
                                        </span>{" "}
                                        - {trip.kendaraan?.plat_kendaraan}
                                    </span>
                                </p>
                            </div>

                            <form
                                onSubmit={handleBbmSubmit}
                                className="space-y-4"
                            >
                                {/* Jenis BBM Radio Button */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Jenis BBM
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {jenisBBMOptions.map((option) => (
                                            <div
                                                key={option.id}
                                                onClick={() =>
                                                    handleJenisBBMChange(
                                                        option.name
                                                    )
                                                }
                                                className={`relative flex items-center p-3 rounded-lg cursor-pointer border transition-all duration-200 ${
                                                    bbmData.jenis_bbm ===
                                                    option.name
                                                        ? `border-2 ${option.color} bg-opacity-10 dark:bg-opacity-20 shadow-sm`
                                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                                }`}
                                            >
                                                <div className="flex items-center">
                                                    <div
                                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                            bbmData.jenis_bbm ===
                                                            option.name
                                                                ? `${option.color} border-transparent`
                                                                : "border-gray-400 dark:border-gray-500"
                                                        }`}
                                                    >
                                                        {bbmData.jenis_bbm ===
                                                            option.name && (
                                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                                        )}
                                                    </div>
                                                    <div className="ml-2 flex items-center">
                                                        <FaGasStation
                                                            className={`mr-1.5 ${
                                                                bbmData.jenis_bbm ===
                                                                option.name
                                                                    ? option.color.replace(
                                                                          "bg-",
                                                                          "text-"
                                                                      )
                                                                    : "text-gray-400"
                                                            }`}
                                                        />
                                                        <span
                                                            className={`text-sm ${
                                                                bbmData.jenis_bbm ===
                                                                option.name
                                                                    ? "font-medium text-gray-900 dark:text-white"
                                                                    : "text-gray-700 dark:text-gray-300"
                                                            }`}
                                                        >
                                                            {option.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Jumlah Liter
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                            <FaGasPump className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="jumlah_liter"
                                            value={bbmData.jumlah_liter}
                                            onChange={handleBbmInputChange}
                                            className="block w-full pl-10 pr-3 py-2 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                            placeholder="Contoh: 20.5"
                                            required
                                            min={0}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Harga Per Liter
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                            <FaMoneyBillWave className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="harga_per_liter"
                                            value={
                                                bbmData.harga_per_liter
                                                    ? formatCurrency(
                                                          bbmData.harga_per_liter
                                                      )
                                                    : ""
                                            }
                                            onChange={handleBbmInputChange}
                                            className="block w-full pl-10 pr-3 py-2 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                            placeholder="Rp 0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Total Harga
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                            <FaMoneyBillWave className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="total_harga"
                                            value={
                                                bbmData.total_harga
                                                    ? `Rp ${parseInt(
                                                          bbmData.total_harga
                                                      ).toLocaleString(
                                                          "id-ID"
                                                      )}`
                                                    : ""
                                            }
                                            className="block w-full pl-10 pr-3 py-2 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-600 cursor-not-allowed transition-colors"
                                            placeholder="Otomatis dihitung"
                                            readOnly
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Total harga dihitung otomatis
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex justify-center items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                                                <span>Menyimpan...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaSave className="mr-2 h-4 w-4" />
                                                <span>Simpan Data BBM</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Modal EDIT TRIP di samping kanan (BARU) */}
                    <div
                        className={`fixed top-0 right-0 h-full w-full md:w-1/3 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
                            showEditModal ? "translate-x-0" : "translate-x-full"
                        } overflow-y-auto`}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                    <FaSave className="mr-2 text-blue-500" />{" "}
                                    Ajukan Perubahan Trip
                                </h2>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <FaTimes className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleEditSubmit}
                                className="space-y-4"
                            >
                                {/* ------------------------- INFORMASI KENDARAAN & DRIVER ------------------------- */}
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <h3 className="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-2">
                                        Kendaraan & Driver
                                    </h3>

                                    {/* Input Kendaraan Combobox */}
                                    <div className="mb-3">
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Kendaraan
                                        </label>
                                        <Combobox
                                            value={
                                                allVehicles.find(
                                                    (k) =>
                                                        String(k.id) ===
                                                        String(
                                                            editData.kendaraan_id
                                                        )
                                                ) || null
                                            }
                                            onChange={(k) =>
                                                setEditData({
                                                    ...editData,
                                                    kendaraan_id: k.id,
                                                })
                                            }
                                            aria-label="Pilih kendaraan"
                                        >
                                            <div className="relative">
                                                <Combobox.Input
                                                    className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                                    placeholder="Cari atau pilih kendaraan"
                                                    displayValue={(k) =>
                                                        k
                                                            ? `${k.plat_kendaraan} - ${k.merek}`
                                                            : ""
                                                    }
                                                />
                                                <Transition
                                                    as={Fragment}
                                                    leave="transition ease-in duration-100"
                                                    leaveFrom="opacity-100"
                                                    leaveTo="opacity-0"
                                                >
                                                    <Combobox.Options className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                        {allVehicles.map(
                                                            (k) => (
                                                                <Combobox.Option
                                                                    key={k.id}
                                                                    value={k}
                                                                    className={({
                                                                        active,
                                                                    }) =>
                                                                        `${
                                                                            active
                                                                                ? "bg-blue-50 dark:bg-blue-900/30"
                                                                                : ""
                                                                        } cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-800 dark:text-gray-200`
                                                                    }
                                                                >
                                                                    {`${k.plat_kendaraan} - ${k.merek}`}
                                                                </Combobox.Option>
                                                            )
                                                        )}
                                                    </Combobox.Options>
                                                </Transition>
                                            </div>
                                        </Combobox>
                                    </div>

                                    {/* Input Driver Combobox */}
                                    <div className="mb-3">
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Driver
                                        </label>
                                        <Combobox
                                            value={
                                                allDrivers.find(
                                                    (d) =>
                                                        String(d.id) ===
                                                        String(
                                                            editData.driver_id
                                                        )
                                                ) || null
                                            }
                                            onChange={(d) =>
                                                setEditData({
                                                    ...editData,
                                                    driver_id: d.id,
                                                })
                                            }
                                            aria-label="Pilih driver"
                                        >
                                            <div className="relative">
                                                <Combobox.Input
                                                    className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                                    placeholder="Cari atau pilih driver"
                                                    displayValue={(d) =>
                                                        d
                                                            ? `${d.name} - ${d.phone_number}`
                                                            : ""
                                                    }
                                                />
                                                <Transition
                                                    as={Fragment}
                                                    leave="transition ease-in duration-100"
                                                    leaveFrom="opacity-100"
                                                    leaveTo="opacity-0"
                                                >
                                                    <Combobox.Options className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                        {allDrivers.map((d) => (
                                                            <Combobox.Option
                                                                key={d.id}
                                                                value={d}
                                                                className={({
                                                                    active,
                                                                }) =>
                                                                    `${
                                                                        active
                                                                            ? "bg-blue-50 dark:bg-blue-900/30"
                                                                            : ""
                                                                    } cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-800 dark:text-gray-200`
                                                                }
                                                            >
                                                                {`${d.name} - ${d.phone_number}`}
                                                            </Combobox.Option>
                                                        ))}
                                                    </Combobox.Options>
                                                </Transition>
                                            </div>
                                        </Combobox>
                                    </div>

                                    {/* Input Penumpang */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Nama Penumpang
                                        </label>
                                        <input
                                            type="text"
                                            name="penumpang"
                                            value={editData.penumpang}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    penumpang: e.target.value,
                                                })
                                            }
                                            className="block w-full py-2 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm"
                                        />
                                    </div>
                                </div>

                                {/* ------------------------- INFORMASI PERJALANAN ------------------------- */}
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <h3 className="font-semibold text-sm text-green-800 dark:text-green-300 mb-2">
                                        Informasi Perjalanan
                                    </h3>

                                    {/* Input Tujuan Combobox */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Tujuan
                                        </label>
                                        <Combobox
                                            value={editData.tujuan}
                                            onChange={(val) =>
                                                setEditData({
                                                    ...editData,
                                                    tujuan: val,
                                                })
                                            }
                                            aria-label="Pilih atau tulis tujuan"
                                        >
                                            <div className="relative">
                                                <Combobox.Input
                                                    className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                                    onChange={(e) =>
                                                        setDestinationQuery(
                                                            e.target.value
                                                        )
                                                    }
                                                    displayValue={(v) =>
                                                        v || ""
                                                    }
                                                    placeholder="Contoh: GI Kosambi Baru"
                                                />
                                                <Transition
                                                    as={Fragment}
                                                    leave="transition ease-in duration-100"
                                                    leaveFrom="opacity-100"
                                                    leaveTo="opacity-0"
                                                >
                                                    <Combobox.Options className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                        {(destinationQuery ===
                                                        ""
                                                            ? destinationOptions
                                                            : destinationOptions.filter(
                                                                  (o) =>
                                                                      o
                                                                          .toLowerCase()
                                                                          .includes(
                                                                              destinationQuery.toLowerCase()
                                                                          )
                                                              )
                                                        ).map((opt) => (
                                                            <Combobox.Option
                                                                key={opt}
                                                                value={opt}
                                                                className={({
                                                                    active,
                                                                }) =>
                                                                    `${
                                                                        active
                                                                            ? "bg-blue-50 dark:bg-blue-900/30"
                                                                            : ""
                                                                    } cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-800 dark:text-gray-200`
                                                                }
                                                            >
                                                                {opt}
                                                            </Combobox.Option>
                                                        ))}
                                                    </Combobox.Options>
                                                </Transition>
                                            </div>
                                        </Combobox>
                                    </div>

                                    {/* Input Catatan */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Catatan
                                        </label>
                                        <textarea
                                            name="catatan"
                                            value={editData.catatan}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    catatan: e.target.value,
                                                })
                                            }
                                            rows="3"
                                            className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm"
                                        ></textarea>
                                    </div>

                                    {/* Input Waktu Keberangkatan (Perlu Tipe datetime-local) */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Waktu Keberangkatan
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="waktu_keberangkatan"
                                            // Format ISO untuk input datetime-local agar nilai trip awal terisi dengan benar
                                            value={editData.waktu_keberangkatan}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    waktu_keberangkatan:
                                                        e.target.value,
                                                })
                                            }
                                            className="block w-full py-2 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm"
                                            required
                                        />
                                    </div>
                                    {/* Input Waktu Kembali (BARU) */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Waktu Kembali
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="waktu_kembali"
                                            // Format ISO untuk input datetime-local agar nilai trip awal terisi dengan benar
                                            value={editData.waktu_kembali}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    waktu_kembali:
                                                        e.target.value,
                                                })
                                            }
                                            className="block w-full py-2 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm"
                                        />
                                    </div>
                                </div>

                                {/* ------------------------- INFORMASI KILOMETER ------------------------- */}
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <h3 className="font-semibold text-sm text-red-800 dark:text-red-300 mb-2 flex items-center">
                                        <FaInfo className="mr-1.5" /> Kilometer
                                        (Butuh Persetujuan Admin)
                                    </h3>

                                    {/* Input KM Awal */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Kilometer Awal
                                        </label>
                                        <input
                                            type="number"
                                            name="km_awal"
                                            value={editData.km_awal}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    km_awal: e.target.value,
                                                })
                                            }
                                            className="block w-full py-2 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm"
                                            required
                                            min={0}
                                        />
                                    </div>

                                    {/* Input KM Akhir */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 mt-2">
                                            Kilometer Akhir
                                        </label>
                                        <input
                                            type="number"
                                            name="km_akhir"
                                            value={editData.km_akhir}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    km_akhir: e.target.value,
                                                })
                                            }
                                            className="block w-full py-2 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm"
                                            required
                                            min={editData.km_awal || 0}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex justify-center items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                                                <span>
                                                    Mengirim Permintaan...
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <FaSave className="mr-2 h-4 w-4" />
                                                <span>
                                                    Ajukan Perubahan Trip
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Overlay untuk menutup modal saat klik di luar */}
                    {showBbmModal && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                            onClick={() => setShowBbmModal(false)}
                        ></div>
                    )}
                    {showEditModal && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                            onClick={() => setShowEditModal(false)}
                        ></div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
