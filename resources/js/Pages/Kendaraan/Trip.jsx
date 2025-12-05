import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import React, { useState, useEffect, useRef } from "react";
import { Listbox, Transition } from "@headlessui/react";
import dateFormat, { masks } from "dateformat";
import {
    FaCar,
    FaArrowRight,
    FaArrowLeft,
    FaParking,
    FaTimes,
    FaSearch,
    FaFileExcel,
    FaChevronLeft,
    FaChevronRight,
    FaEllipsisH,
    FaPlus,
    FaCamera,
    FaCheck,
    FaCarSide,
    FaLock,
    FaIdCard,
    FaTachometerAlt,
    FaMapMarkerAlt,
    FaClock,
    FaUsers,
    FaInfo,
    FaUserTie,
    FaEdit,
    FaSave,
    FaSpinner,
    FaCalendarAlt,
    FaGlobe,
    FaEye,
    FaCalendarCheck,
    FaCalendarTimes,
    FaCalendarMinus,
    FaCalendarPlus,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import Modal from "@/Components/ModalNew";
import { RadioGroup } from "@headlessui/react";
import { ToastContainer, toast, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export default function Trip({
    trips: initialTrips,
    kendaraans,
    drivers,
    auth,
}) {
    const [trips, setTrips] = useState(initialTrips || []);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [showPopup, setShowPopup] = useState(false);
    const [closeKendaraan, setCloseKendaraan] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [isClosingTrip, setIsClosingTrip] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportType, setExportType] = useState("all");
    const [exportDate, setExportDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const toggleDropdown = (id) => {
        if (openDropdown === id) {
            setOpenDropdown(null);
        } else {
            setOpenDropdown(id);
        }
    };

    // Tambahkan useEffect untuk menutup dropdown ketika user mengklik di luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdown && !event.target.closest(".dropdown-container")) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openDropdown]);

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const fileInputRefClose = useRef(null);

    // Tambahkan state untuk multiple photos
    const [photos, setPhotos] = useState([]);
    const [previewPhotos, setPreviewPhotos] = useState([]);
    const data = {};
    const setData = () => {};
    const errors = {};
    const processing = false;
    const isSubmitting = false;
    const fileInputRef = useRef(null);
    const driversAvailable = [];

    const filteredTrips = Array.isArray(trips)
        ? trips.filter((trip) => {
              if (auth.user.lokasi && auth.user.lokasi.trim() !== "") {
                  if (trip.lokasi !== auth.user.lokasi) {
                      return false;
                  }
              }
              const matchesText =
                  trip?.kendaraan?.plat_kendaraan
                      ?.toLowerCase()
                      ?.includes(searchTerm.toLowerCase()) ||
                  trip?.code_trip
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                  trip?.tujuan
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                  trip?.driver?.name
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase());

              if (!startDate && !endDate) return matchesText;

              const dep = trip?.waktu_keberangkatan
                  ? new Date(trip.waktu_keberangkatan)
                  : null;
              if (!dep) return false;

              const startBound = startDate
                  ? new Date(`${startDate}T00:00:00`)
                  : null;
              const endBound = endDate ? new Date(`${endDate}T23:59:59`) : null;

              if (startBound && dep < startBound) return false;
              if (endBound && dep > endBound) return false;

              return matchesText;
          })
        : [];

    const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTrips.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Export ke Excel
    const exportToExcel = () => {
        try {
            let dataToExport = [];
            let fileName = "";

            if (exportType === "month") {
                // Validasi bulan yang dipilih
                const selectedMonth = exportDate
                    ? `${exportDate.getFullYear()}-${String(
                          exportDate.getMonth() + 1
                      ).padStart(2, "0")}`
                    : "";

                if (!selectedMonth) {
                    toast.error(
                        "Silakan pilih bulan terlebih dahulu!",
                        toastConfig
                    );
                    return;
                }

                // Filter data berdasarkan bulan yang dipilih
                const year = exportDate.getFullYear();
                const month = exportDate.getMonth(); // 0-indexed

                dataToExport = Array.isArray(trips)
                    ? trips.filter((trip) => {
                          const tripDate = new Date(trip.waktu_keberangkatan);
                          return (
                              tripDate.getFullYear() === year &&
                              tripDate.getMonth() === month
                          );
                      })
                    : [];

                if (dataToExport.length === 0) {
                    const monthName = exportDate.toLocaleString("id-ID", {
                        month: "long",
                    });
                    toast.warning(
                        `Tidak ada data untuk bulan ${monthName} ${year}`,
                        toastConfig
                    );
                    return;
                }

                // Set nama file dengan bulan dan tahun
                const monthName = exportDate.toLocaleString("id-ID", {
                    month: "long",
                });
                fileName = `Data Kendaraan Dinas ${monthName} ${year}.xlsx`;
            } else {
                // Export semua data
                dataToExport = trips || [];

                if (dataToExport.length === 0) {
                    toast.warning("Tidak ada data untuk diexport", toastConfig);
                    return;
                }

                // Set nama file dengan tanggal hari ini
                fileName = `Data Kendaraan Dinas All ${dateFormat(
                    new Date(),
                    "dd-mm-yyyy"
                )}.xlsx`;
            }

            // Format data untuk Excel dengan penanganan nilai null/undefined
            const formattedData = dataToExport.map((trip, index) => ({
                No: index + 1,
                "Kode Trip": trip.code_trip || "-",
                "Plat Kendaraan": trip.kendaraan?.plat_kendaraan || "-",
                "Merek Kendaraan": trip.kendaraan?.merek || "-",
                Driver: trip.driver?.name || "-",
                "Waktu Keberangkatan":
                    formatDate(trip.waktu_keberangkatan) || "-",
                "Waktu Kembali": formatDate(trip.waktu_kembali) || "-",
                "Km Awal": trip.km_awal || 0,
                "Km Akhir": trip.km_akhir || "-",
                Tujuan: trip.tujuan || "-",
                Jarak: trip.jarak ? trip.jarak + " KM" : "-",
                Penumpang: trip.penumpang || "-",
                "Jenis BBm": trip.jenis_bbm || "-",
                "Jumlah Liter": trip.jumlah_liter || "-",
                "Harga Per Liter": trip.harga_per_liter || "-",
                "Total Harga BBm": trip.total_harga_bbm || "-",
                Catatan: trip.catatan || "-",
                Status: trip.status || "-",
            }));

            // Buat workbook dan worksheet
            const worksheet = XLSX.utils.json_to_sheet(formattedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Data Trip Kendaraan"
            );

            // Atur lebar kolom
            const colWidths = [
                { wch: 5 }, // A - No
                { wch: 15 }, // B - Kode Trip
                { wch: 15 }, // C - Plat Kendaraan
                { wch: 20 }, // D - Merek Kendaraan
                { wch: 20 }, // E - Driver
                { wch: 25 }, // F - Waktu Keberangkatan
                { wch: 25 }, // G - Waktu Kembali
                { wch: 10 }, // H - Km Awal
                { wch: 10 }, // I - Km Akhir
                { wch: 25 }, // J - Tujuan
                { wch: 10 }, // K - Jarak
                { wch: 25 }, // L - Penumpang
                { wch: 25 }, // M - Jenis BBm
                { wch: 25 }, // N - Jumlah Liter
                { wch: 25 }, // O - Harga Per Liter
                { wch: 25 }, // P - Total Harga BBm
                { wch: 30 }, // M - Catatan
                { wch: 15 }, // N - Status
            ];
            worksheet["!cols"] = colWidths;

            // Generate file Excel
            XLSX.writeFile(workbook, fileName);

            // Tampilkan pesan sukses
            if (exportType === "month") {
                const monthName = exportDate.toLocaleString("id-ID", {
                    month: "long",
                });
                toast.success(
                    `Data berhasil diexport ke Excel untuk bulan ${monthName} ${exportDate.getFullYear()}`,
                    toastConfig
                );
            } else {
                toast.success(
                    "Semua data berhasil diexport ke Excel",
                    toastConfig
                );
            }

            setShowExportModal(false);
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            toast.error("Terjadi kesalahan saat mengexport data", toastConfig);
        }
    };

    const getPaginationNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(currentPage + 1, totalPages - 1);
            if (start > 2) {
                pages.push("...");
            }
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            if (end < totalPages - 1) {
                pages.push("...");
            }
            pages.push(totalPages);
        }
        return pages;
    };

    // Konfigurasi default untuk semua toast
    const toastConfig = {
        position: "top-right", // Ubah posisi ke pojok kanan atas
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    };

    // Hitung statistik kendaraan
    const totalKendaraan = kendaraans.length;
    const kendaraanTersedia = kendaraans.filter(
        (k) => k.status === "Tersedia"
    ).length;
    const kendaraanDigunakan = kendaraans.filter(
        (k) => k.status === "Digunakan"
    ).length;
    const kendaraanPerawatan = kendaraans.filter(
        (k) => k.status === "Dalam Perawatan"
    ).length;
    const kendaraanTersediaStatus = kendaraans.filter(
        (k) => k.status === "Tersedia"
    );

    // Tambahkan state untuk close trip
    const [kmAkhir, setKmAkhir] = useState("");
    const { processing: processingCloseTrip } = useForm();

    // Tambahkan fungsi untuk mengompres dan mengkonversi gambar
    const compressAndConvertImage = (file) => {
        return new Promise((resolve, reject) => {
            // Cek apakah file adalah gambar
            if (!file.type.startsWith("image/")) {
                reject(new Error("File bukan gambar"));
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Hitung dimensi baru (maksimal 1200px)
                    let width = img.width;
                    let height = img.height;
                    const MAX_SIZE = 1200;

                    if (width > height && width > MAX_SIZE) {
                        height = Math.round((height * MAX_SIZE) / width);
                        width = MAX_SIZE;
                    } else if (height > MAX_SIZE) {
                        width = Math.round((width * MAX_SIZE) / height);
                        height = MAX_SIZE;
                    }

                    // Buat canvas untuk kompresi
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;

                    // Gambar ke canvas
                    const ctx = canvas.getContext("2d");
                    ctx.fillStyle = "#FFFFFF"; // Tambahkan background putih untuk gambar transparan
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);

                    // Konversi ke JPEG dengan kualitas 75% (lebih rendah untuk mengurangi ukuran)
                    canvas.toBlob(
                        (blob) => {
                            // Buat file baru dengan tipe JPEG
                            const newFile = new File(
                                [blob],
                                `photo_${Date.now()}.jpg`,
                                {
                                    type: "image/jpeg",
                                    lastModified: Date.now(),
                                }
                            );
                            resolve(newFile);
                        },
                        "image/jpeg",
                        0.75
                    );
                };

                img.onerror = () => {
                    reject(new Error("Gagal memuat gambar"));
                };

                img.src = event.target.result;
            };

            reader.onerror = () => {
                reject(new Error("Gagal membaca file"));
            };

            reader.readAsDataURL(file);
        });
    };

    // Modifikasi handleFileUpload untuk menggunakan fungsi kompresi
    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) return;

        // Validasi jumlah foto
        if (photos.length + files.length > 5) {
            toast.error("Maksimal 5 foto yang dapat diunggah", toastConfig);
            return;
        }

        // Tampilkan loading toast
        const loadingToastId = toast.loading("Memproses foto...", toastConfig);

        try {
            // Proses setiap file
            const processedFiles = [];

            for (const file of files) {
                try {
                    // Kompresi dan konversi gambar
                    const processedFile = await compressAndConvertImage(file);
                    processedFiles.push(processedFile);
                } catch (error) {
                    console.error("Error processing file:", error);
                    toast.error(
                        `Gagal memproses file "${file.name}": ${error.message}`,
                        toastConfig
                    );
                }
            }

            if (processedFiles.length === 0) {
                toast.update(loadingToastId, {
                    render: "Tidak ada file valid untuk diunggah",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
                return;
            }

            // Update state dengan file yang valid
            setPhotos((prevPhotos) => [...prevPhotos, ...processedFiles]);

            // Generate preview untuk setiap file
            processedFiles.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviewPhotos((prevPreviews) => [
                        ...prevPreviews,
                        e.target.result,
                    ]);
                };
                reader.readAsDataURL(file);
            });

            // Reset input file
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
                fileInputRef.current.removeAttribute("capture");
            }

            // Update loading toast
            toast.update(loadingToastId, {
                render: `${processedFiles.length} foto berhasil diproses!`,
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Error in handleFileUpload:", error);
            toast.update(loadingToastId, {
                render: "Terjadi kesalahan saat memproses foto",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        }
    };

    // Fungsi untuk menghapus foto
    const removePhoto = (index) => {
        setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
        setPreviewPhotos((prevPreviews) =>
            prevPreviews.filter((_, i) => i !== index)
        );
        toast.info("Foto berhasil dihapus!", toastConfig);
    };

    // Modifikasi useEffect untuk menambahkan loading state
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(route("trips.index"));
                // Pastikan response.data.trips ada sebelum mengupdate state
                if (response.data && response.data.trips) {
                    setTrips(response.data.trips);
                } else {
                    console.warn("Data trips tidak ditemukan dalam response");
                    setTrips([]); // Set array kosong jika tidak ada data
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Gagal memuat data trips", toastConfig);
            } finally {
                setIsLoading(false);
            }
        };

        // Jika initialTrips kosong, fetch data dari server
        if (!initialTrips || initialTrips.length === 0) {
            fetchData();
        } else {
            setTrips(initialTrips);
            setIsLoading(false);
        }
    }, [initialTrips]);

    // Tambahkan komponen Skeleton
    const TableSkeleton = () => (
        <div className="animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-t-lg mb-4"></div>
            {[1, 2, 3, 4, 5].map((index) => (
                <div
                    key={index}
                    className="h-16 bg-gray-100 dark:bg-gray-800 mb-2 rounded-lg"
                ></div>
            ))}
        </div>
    );

    // Fungsi untuk upload file dari galeri untuk close trip
    const handleGalleryUploadClose = () => {
        if (fileInputRefClose.current) {
            fileInputRefClose.current.removeAttribute("capture");
            fileInputRefClose.current.setAttribute("accept", "image/*");
            fileInputRefClose.current.click();
        }
    };

    // Fungsi untuk mengambil foto dari kamera untuk close trip
    const handleCameraCaptureClose = () => {
        if (fileInputRefClose.current) {
            // Hapus atribut capture yang mungkin menyebabkan masalah pada beberapa perangkat
            fileInputRefClose.current.removeAttribute("capture");
            // Gunakan accept yang lebih spesifik untuk memastikan kompatibilitas
            fileInputRefClose.current.setAttribute(
                "accept",
                "image/jpeg,image/png,image/jpg"
            );
            fileInputRefClose.current.click();
        }
    };

    // Fungsi untuk menangani file yang diupload
    const handleFileUploadClose = async (e) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) return;

        // Validasi jumlah foto
        if (photos.length + files.length > 5) {
            toast.error("Maksimal 5 foto yang dapat diunggah", toastConfig);
            return;
        }

        // Tampilkan loading toast
        const loadingToastId = toast.loading("Memproses foto...", toastConfig);

        try {
            // Proses setiap file
            const processedFiles = [];

            for (const file of files) {
                try {
                    // Kompresi dan konversi gambar
                    const processedFile = await compressAndConvertImage(file);
                    processedFiles.push(processedFile);
                } catch (error) {
                    console.error("Error processing file:", error);
                    toast.error(
                        `Gagal memproses file "${file.name}": ${error.message}`,
                        toastConfig
                    );
                }
            }

            if (processedFiles.length === 0) {
                toast.update(loadingToastId, {
                    render: "Tidak ada file valid untuk diunggah",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
                return;
            }

            // Update state dengan file yang valid
            setPhotos((prevPhotos) => [...prevPhotos, ...processedFiles]);

            // Generate preview untuk setiap file
            processedFiles.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviewPhotos((prevPreviews) => [
                        ...prevPreviews,
                        e.target.result,
                    ]);
                };
                reader.readAsDataURL(file);
            });

            // Reset input file
            if (fileInputRefClose.current) {
                fileInputRefClose.current.value = "";
                fileInputRefClose.current.removeAttribute("capture");
            }

            // Update loading toast
            toast.update(loadingToastId, {
                render: `${processedFiles.length} foto berhasil diproses!`,
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Error in handleFileUploadClose:", error);
            toast.update(loadingToastId, {
                render: "Terjadi kesalahan saat memproses foto",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        }
    };

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

    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Deteksi mode gelap dari preferensi sistem atau HTML
        const darkModeMediaQuery = window.matchMedia(
            "(prefers-color-scheme: dark)"
        );
        const htmlElement = document.documentElement;

        const updateDarkMode = () => {
            const isDark =
                htmlElement.classList.contains("dark") ||
                darkModeMediaQuery.matches;
            setIsDarkMode(isDark);
        };

        // Panggil sekali untuk inisialisasi
        updateDarkMode();

        // Tambahkan listener untuk perubahan mode
        darkModeMediaQuery.addEventListener("change", updateDarkMode);

        // Tambahkan listener untuk perubahan class pada HTML
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "class") {
                    updateDarkMode();
                }
            });
        });

        observer.observe(htmlElement, { attributes: true });

        return () => {
            darkModeMediaQuery.removeEventListener("change", updateDarkMode);
            observer.disconnect();
        };
    }, []);

    // Tambahkan function untuk mengubah jumlah item per halaman
    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    };

    return (
        <>
            <Head title="Monitoring Kendaraan" />
            <DashboardLayout>
                <div className="py-0">
                    {/* Stats Cards dengan Animasi Hover */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                        <div className="bg-white dark:bg-[#1f2937] rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-full">
                                    <FaCar className="text-blue-600 dark:text-blue-400 text-lg sm:text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                                        Total Kendaraan
                                    </h3>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                                        {totalKendaraan}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1f2937] rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className="bg-green-100 dark:bg-green-900/30 p-2 sm:p-3 rounded-full">
                                    <FaArrowRight className="text-green-600 dark:text-green-400 text-lg sm:text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                                        Kendaraan Tersedia
                                    </h3>
                                    <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                                        {kendaraanTersedia}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1f2937] rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className="bg-red-100 dark:bg-red-900/30 p-2 sm:p-3 rounded-full">
                                    <FaArrowLeft className="text-red-600 dark:text-red-400 text-lg sm:text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                                        Sedang Digunakan
                                    </h3>
                                    <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                                        {kendaraanDigunakan}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1f2937] rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 sm:p-3 rounded-full">
                                    <FaParking className="text-purple-600 dark:text-purple-400 text-lg sm:text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                                        Dalam Perawatan
                                    </h3>
                                    <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {kendaraanPerawatan}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section dengan Search Bar dan Export Button */}
                    <div className="bg-white dark:bg-[#1f2937] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative grid grid-cols-1 sm:grid-cols-6 gap-4 items-center">
                                <div className="sm:col-span-1">
                                    <div className="max-w-full sm:w-full">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Cari kendaraan..."
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                                value={searchTerm}
                                                onChange={(e) =>
                                                    setSearchTerm(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                        </div>
                                    </div>
                                </div>
                                <div className="sm:col-span-1">
                                    <div className="relative w-full">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => {
                                                setStartDate(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                            aria-label="Tanggal mulai"
                                        />
                                        <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>
                                <div className="sm:col-span-1">
                                    <div className="relative w-full">
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => {
                                                setEndDate(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                            aria-label="Tanggal akhir"
                                        />
                                        <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>
                                <div className="sm:col-span-1">
                                    <div className="flex items-center sm:col-span-1 justify-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 shadow-sm">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                            Tampilkan
                                        </span>
                                        <div className="ml-3">
                                            <Listbox
                                                value={itemsPerPage}
                                                onChange={(val) =>
                                                    handleItemsPerPageChange(
                                                        val
                                                    )
                                                }
                                                aria-label="Tampilkan per halaman"
                                            >
                                                <div className="relative">
                                                    <Listbox.Button className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md text-sm font-medium px-3 py-1.5 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                                        {itemsPerPage}{" "}
                                                        baris/halaman
                                                    </Listbox.Button>
                                                    <Transition
                                                        as={React.Fragment}
                                                        enter="transition ease-out duration-100"
                                                        enterFrom="opacity-0 scale-95"
                                                        enterTo="opacity-100 scale-100"
                                                        leave="transition ease-in duration-100"
                                                        leaveFrom="opacity-100"
                                                        leaveTo="opacity-0"
                                                    >
                                                        <Listbox.Options className="absolute top-full left-0 z-[9999] mt-1 w-44 overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                            {[8, 16].map(
                                                                (opt) => (
                                                                    <Listbox.Option
                                                                        key={
                                                                            opt
                                                                        }
                                                                        value={
                                                                            opt
                                                                        }
                                                                        className={({
                                                                            active,
                                                                        }) =>
                                                                            `${
                                                                                active
                                                                                    ? "bg-blue-50 dark:bg-blue-900/30"
                                                                                    : ""
                                                                            } cursor-pointer select-none relative text-center py-2 pl-3 pr-3 text-gray-800 dark:text-gray-200`
                                                                        }
                                                                    >
                                                                        {opt}{" "}
                                                                        baris/halaman
                                                                    </Listbox.Option>
                                                                )
                                                            )}
                                                        </Listbox.Options>
                                                    </Transition>
                                                </div>
                                            </Listbox>
                                        </div>
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                                        {/* Button Tambah Data */}
                                        <Link href={route("trips.add")}>
                                            <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md w-full sm:w-auto">
                                                <FaCar className="text-lg" />
                                                <span>Trip Baru</span>
                                            </button>
                                        </Link>

                                        {/* Dropdown Export */}
                                        {auth.user.role === "admin" && (
                                            <button
                                                onClick={() =>
                                                    setShowExportModal(true)
                                                }
                                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md w-full sm:w-auto"
                                            >
                                                <FaFileExcel className="text-lg" />
                                                <span>Export Excel</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            {isLoading ? (
                                <TableSkeleton />
                            ) : (
                                <div className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <table className="min-w-full overflow-visible">
                                        <thead className="bg-gray-50 dark:bg-gray-700/60">
                                            <tr>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    No
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Berangkat
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Kembali
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    No Polisi
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Driver
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Tujuan
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    KM Awal
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    KM Akhir
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Jarak
                                                </th>
                                                {auth.user.role === "admin" && (
                                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Lokasi
                                                    </th>
                                                )}
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-[#1f2937] divide-y divide-gray-200 dark:divide-gray-700">
                                            {currentItems.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                                                >
                                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                        {indexOfFirstItem +
                                                            index +
                                                            1}
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                        <div className="flex items-center">
                                                            <FaCalendarAlt className="text-blue-500 dark:text-blue-400 mr-2 flex-shrink-0" />
                                                            <span>
                                                                {dateFormat(
                                                                    item.waktu_keberangkatan,
                                                                    "dd mmmm yyyy, HH:MM"
                                                                ) || "-"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                        <div className="flex items-center">
                                                            {/* <FaCalendarCheck className="text-green-500 dark:text-green-400 mr-2 flex-shrink-0" /> */}
                                                            <span>
                                                                {item.waktu_kembali ===
                                                                null ? (
                                                                    <>
                                                                        <div className="inline-flex">
                                                                            <FaCalendarMinus className="text-red-500 animate-pulse dark:text-red-400 mr-2 flex " />
                                                                            {
                                                                                " - - - , -:-"
                                                                            }
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="inline-flex">
                                                                            <FaCalendarCheck className="text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                                                                            {dateFormat(
                                                                                item.waktu_kembali,
                                                                                "dd mmmm yyyy, HH:MM"
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                        {
                                                            item.kendaraan
                                                                .plat_kendaraan
                                                        }
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                        {item.driver.name}
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                        <div className="flex items-center">
                                                            <FaMapMarkerAlt className="text-red-500 dark:text-red-400 mr-1 flex-shrink-0" />
                                                            <span>
                                                                {item.tujuan}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                        {new Intl.NumberFormat(
                                                            "id-ID"
                                                        ).format(item.km_awal)}
                                                        {" KM"}
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                        {item?.km_akhir ===
                                                            null ||
                                                        item?.km_akhir ===
                                                            undefined
                                                            ? "-"
                                                            : new Intl.NumberFormat(
                                                                  "id-ID"
                                                              ).format(
                                                                  item.km_akhir
                                                              ) + " KM"}
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                        {item.jarak === null ||
                                                        item.jarak === undefined
                                                            ? "-"
                                                            : item.jarak +
                                                              " KM"}
                                                    </td>
                                                    {auth.user.role ===
                                                        "admin" && (
                                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                            {item.lokasi ?? "-"}
                                                        </td>
                                                    )}
                                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                        {item.status ===
                                                        "Sedang Berjalan" ? (
                                                            <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 items-center w-auto inline-flex">
                                                                <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></span>
                                                                {item.status}
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 items-center w-auto inline-flex">
                                                                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                                                                {item.status}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <div className="dropdown-container relative">
                                                            <button
                                                                onClick={() =>
                                                                    toggleDropdown(
                                                                        item.id
                                                                    )
                                                                }
                                                                type="button"
                                                                className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-1.5 rounded-lg shadow-sm hover:shadow-md"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                                                    />
                                                                </svg>
                                                            </button>

                                                            {openDropdown ===
                                                                item.id && (
                                                                <div className="absolute right-0 mt-2 w-48 z-50 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-visible">
                                                                    <div className="py-1 divide-y divide-gray-200 dark:divide-gray-700">
                                                                        {item.status ===
                                                                        "Sedang Berjalan" ? (
                                                                            <button
                                                                                onClick={() => {
                                                                                    router.visit(
                                                                                        route(
                                                                                            "trips.close.form",
                                                                                            item.code_trip
                                                                                        )
                                                                                    );
                                                                                    setOpenDropdown(
                                                                                        null
                                                                                    );
                                                                                }}
                                                                                type="button"
                                                                                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors duration-200"
                                                                            >
                                                                                <FaCarSide className="text-teal-500 text-lg flex-shrink-0" />
                                                                                <span className="font-medium">
                                                                                    Tutup
                                                                                    Trip
                                                                                </span>
                                                                            </button>
                                                                        ) : (
                                                                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-3 bg-gray-50 dark:bg-gray-900">
                                                                                <FaCheck className="text-green-500 text-lg flex-shrink-0" />
                                                                                <span className="font-medium">
                                                                                    Trip
                                                                                    Selesai
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        <button
                                                                            onClick={() => {
                                                                                router.visit(
                                                                                    route(
                                                                                        "trips.show",
                                                                                        item.code_trip
                                                                                    )
                                                                                );
                                                                                setOpenDropdown(
                                                                                    null
                                                                                );
                                                                            }}
                                                                            type="button"
                                                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors duration-200"
                                                                        >
                                                                            <FaEye className="text-blue-500 text-lg flex-shrink-0" />
                                                                            <span className="font-medium">
                                                                                Lihat
                                                                                Detail
                                                                            </span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Di dalam tabel, sebelum pagination controls */}
                            <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f2937] sticky bottom-0 left-0 right-0 shadow-md overflow-visible">
                                {/* Info showing entries - Responsive text size */}
                                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left mb-4 sm:mb-0">
                                    Showing{" "}
                                    <span className="font-medium mx-1">
                                        {indexOfFirstItem + 1}
                                    </span>
                                    to{" "}
                                    <span className="font-medium mx-1">
                                        {Math.min(
                                            indexOfLastItem,
                                            filteredTrips.length
                                        )}
                                    </span>
                                    of{" "}
                                    <span className="font-medium mx-1">
                                        {filteredTrips.length}
                                    </span>{" "}
                                    entries
                                </div>

                                {/* Items per page selector - Centered on desktop */}

                                <div className="flex items-center space-x-4">
                                    {/* Previous Button - Responsive sizing */}
                                    <button
                                        onClick={() =>
                                            paginate(currentPage - 1)
                                        }
                                        disabled={currentPage === 1}
                                        className={`flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 rounded-md ${
                                            currentPage === 1
                                                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        } transition-colors duration-200`}
                                    >
                                        <FaChevronLeft className="w-3 sm:w-4 h-3 sm:h-4" />
                                    </button>

                                    {/* Page Numbers - Desktop View */}
                                    <div className="hidden sm:flex items-center mx-2">
                                        {getPaginationNumbers().map(
                                            (page, index) => (
                                                <React.Fragment key={index}>
                                                    {page === "..." ? (
                                                        <span className="flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10">
                                                            <FaEllipsisH className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400" />
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                paginate(page)
                                                            }
                                                            className={`flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 rounded-full mx-1 ${
                                                                currentPage ===
                                                                page
                                                                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                                                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            } transition-all duration-200`}
                                                        >
                                                            {page}
                                                        </button>
                                                    )}
                                                </React.Fragment>
                                            )
                                        )}
                                    </div>

                                    {/* Mobile Pagination Info */}
                                    <span className="mx-3 sm:hidden text-xs font-medium text-gray-600 dark:text-gray-300">
                                        {currentPage} / {totalPages}
                                    </span>

                                    {/* Next Button - Responsive sizing */}
                                    <button
                                        onClick={() =>
                                            paginate(currentPage + 1)
                                        }
                                        disabled={currentPage === totalPages}
                                        className={`flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 rounded-md ${
                                            currentPage === totalPages
                                                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        } transition-colors duration-200`}
                                    >
                                        <FaChevronRight className="w-3 sm:w-4 h-3 sm:h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>

            <Modal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                title="Export Data ke Excel"
            >
                <div className="p-4">
                    <div className="mb-6">
                        <div className="flex flex-col space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Pilih Jenis Export
                                </label>
                                <RadioGroup
                                    value={exportType}
                                    onChange={setExportType}
                                    className="space-y-3"
                                >
                                    <RadioGroup.Option value="month">
                                        {({ checked }) => (
                                            <div
                                                className={`
                                                relative flex items-center p-4 rounded-lg cursor-pointer transform transition-all duration-300 ease-in-out
                                                ${
                                                    checked
                                                        ? "bg-blue-50 border-2 border-blue-500 dark:bg-blue-900/30 dark:border-blue-500 shadow-md scale-102"
                                                        : "border border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400"
                                                }
                                            `}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center">
                                                        <div
                                                            className={`
                                                            rounded-full border-2 flex items-center justify-center w-5 h-5 mr-3 transition-colors duration-300
                                                            ${
                                                                checked
                                                                    ? "border-blue-500 bg-blue-500 transform scale-110"
                                                                    : "border-gray-400 dark:border-gray-500"
                                                            }
                                                        `}
                                                        >
                                                            {checked && (
                                                                <FaCheck className="w-3 h-3 text-white animate-fadeIn" />
                                                            )}
                                                        </div>
                                                        <div className="text-sm transition-all duration-300">
                                                            <RadioGroup.Label
                                                                as="p"
                                                                className={`font-medium transition-colors duration-300 ${
                                                                    checked
                                                                        ? "text-blue-600 dark:text-blue-400"
                                                                        : "text-gray-700 dark:text-gray-300"
                                                                }`}
                                                            >
                                                                Berdasarkan
                                                                Bulan
                                                            </RadioGroup.Label>
                                                            <RadioGroup.Description
                                                                as="span"
                                                                className={`inline transition-colors duration-300 ${
                                                                    checked
                                                                        ? "text-blue-500 dark:text-blue-400"
                                                                        : "text-gray-500 dark:text-gray-400"
                                                                }`}
                                                            >
                                                                Export data
                                                                untuk bulan
                                                                tertentu
                                                            </RadioGroup.Description>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`p-2 rounded-full transform transition-all duration-300 ${
                                                            checked
                                                                ? "bg-blue-100 dark:bg-blue-800 rotate-0 scale-110"
                                                                : "bg-gray-100 dark:bg-gray-700 rotate-0"
                                                        }`}
                                                    >
                                                        <FaCalendarAlt
                                                            className={`w-5 h-5 transition-colors duration-300 ${
                                                                checked
                                                                    ? "text-blue-500"
                                                                    : "text-gray-400"
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </RadioGroup.Option>

                                    <RadioGroup.Option value="all">
                                        {({ checked }) => (
                                            <div
                                                className={`
                                                relative flex items-center p-4 rounded-lg cursor-pointer transform transition-all duration-300 ease-in-out
                                                ${
                                                    checked
                                                        ? "bg-blue-50 border-2 border-blue-500 dark:bg-blue-900/30 dark:border-blue-500 shadow-md scale-102"
                                                        : "border border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400"
                                                }
                                            `}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center">
                                                        <div
                                                            className={`
                                                            rounded-full border-2 flex items-center justify-center w-5 h-5 mr-3 transition-colors duration-300
                                                            ${
                                                                checked
                                                                    ? "border-blue-500 bg-blue-500 transform scale-110"
                                                                    : "border-gray-400 dark:border-gray-500"
                                                            }
                                                        `}
                                                        >
                                                            {checked && (
                                                                <FaCheck className="w-3 h-3 text-white animate-fadeIn" />
                                                            )}
                                                        </div>
                                                        <div className="text-sm transition-all duration-300">
                                                            <RadioGroup.Label
                                                                as="p"
                                                                className={`font-medium transition-colors duration-300 ${
                                                                    checked
                                                                        ? "text-blue-600 dark:text-blue-400"
                                                                        : "text-gray-700 dark:text-gray-300"
                                                                }`}
                                                            >
                                                                Semua Data
                                                            </RadioGroup.Label>
                                                            <RadioGroup.Description
                                                                as="span"
                                                                className={`inline transition-colors duration-300 ${
                                                                    checked
                                                                        ? "text-blue-500 dark:text-blue-400"
                                                                        : "text-gray-500 dark:text-gray-400"
                                                                }`}
                                                            >
                                                                Export seluruh
                                                                data kendaraan
                                                                tamu
                                                            </RadioGroup.Description>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`p-2 rounded-full transform transition-all duration-300 ${
                                                            checked
                                                                ? "bg-blue-100 dark:bg-blue-800 rotate-0 scale-110"
                                                                : "bg-gray-100 dark:bg-gray-700 rotate-0"
                                                        }`}
                                                    >
                                                        <FaGlobe
                                                            className={`w-5 h-5 transition-colors duration-300 ${
                                                                checked
                                                                    ? "text-blue-500"
                                                                    : "text-gray-400"
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </RadioGroup.Option>
                                </RadioGroup>
                            </div>

                            <div
                                className="overflow-hidden transition-all duration-500 ease-in-out"
                                style={{
                                    maxHeight:
                                        exportType === "month" ? "200px" : "0",
                                    opacity: exportType === "month" ? 1 : 0,
                                    marginTop:
                                        exportType === "month" ? "1.5rem" : "0",
                                }}
                            >
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Pilih Bulan
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="month"
                                            value={`${exportDate.getFullYear()}-${String(
                                                exportDate.getMonth() + 1
                                            ).padStart(2, "0")}`}
                                            onChange={(e) => {
                                                const [year, month] =
                                                    e.target.value.split("-");
                                                const newDate = new Date(
                                                    year,
                                                    month - 1
                                                );
                                                setExportDate(newDate);
                                            }}
                                            className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <FaInfo className="w-4 h-4 mr-2 text-blue-500" />
                                        <p>
                                            Data akan difilter berdasarkan bulan
                                            yang dipilih
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="overflow-hidden transition-all duration-500 ease-in-out"
                                style={{
                                    maxHeight:
                                        exportType === "all" ? "200px" : "0",
                                    opacity: exportType === "all" ? 1 : 0,
                                    marginTop:
                                        exportType === "all" ? "1.5rem" : "0",
                                }}
                            >
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full mr-3">
                                            <FaFileExcel className="text-blue-500 w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                                Export Semua Data
                                            </h3>
                                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                                Semua data kendaraan tamu akan
                                                diexport ke file Excel
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => setShowExportModal(false)}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={exportToExcel}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg transition-colors flex items-center space-x-2 shadow-sm hover:shadow-md"
                        >
                            <FaFileExcel className="w-4 h-4" />
                            <span>Export Excel</span>
                        </button>
                    </div>
                </div>
            </Modal>

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
        </>
    );
}
