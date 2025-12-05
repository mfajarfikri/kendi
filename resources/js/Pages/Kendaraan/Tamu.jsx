import ModalNew from "@/Components/ModalNew";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router } from "@inertiajs/react";
import dateFormat, { masks } from "dateformat";
import React, { useState, useEffect, useRef } from "react";
import {
    FaCar,
    FaArrowRight,
    FaArrowLeft,
    FaParking,
    FaSearch,
    FaPlus,
    FaCheck,
    FaChevronRight,
    FaChevronLeft,
    FaTimes,
    FaFileExcel,
    FaGlobe,
    FaEllipsisV,
    FaEllipsisH,
    FaEye,
    FaCarSide,
    FaCalendarAlt,
    FaInfo,
    FaClock,
    FaImage,
    FaCamera,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Menu, Transition, RadioGroup, Listbox } from "@headlessui/react";
import { Fragment } from "react";
import * as XLSX from "xlsx";
import "react-datepicker/dist/react-datepicker.css";

const toastConfig = {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
};

export default function Tamu({ tamus: initialsTamus, auth }) {
    const [tamus, setTamus] = useState(initialsTamus || []);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [previewPhotos, setPreviewPhotos] = useState([]);
    const [photos, setPhotos] = useState([]);
    const fileInputRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        plat_kendaraan: "",
        waktu_kedatangan: dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM"),
        foto_kendaraan: [],
        lokasi: auth.user.lokasi,
    });
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportDate, setExportDate] = useState(new Date());
    const [exportType, setExportType] = useState("month");
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTamu, setSelectedTamu] = useState(null);
    const [closeKendaraan, setCloseKendaraan] = useState(false);
    const fileInputRefClose = useRef(null);
    const [isClosingTamu, setIsClosingTamu] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const filteredTamus = Array.isArray(tamus)
        ? tamus.filter((tamu) => {
              // Filter by lokasi user if lokasi is not empty
              if (auth.user.lokasi && auth.user.lokasi.trim() !== "") {
                  if (tamu.lokasi !== auth.user.lokasi) {
                      return false;
                  }
              }
              const matchesText = tamu?.plat_kendaraan
                  ?.toLowerCase()
                  ?.includes(searchTerm.toLowerCase());

              if (!startDate && !endDate) return matchesText;

              const arr = tamu?.waktu_kedatangan
                  ? new Date(tamu.waktu_kedatangan)
                  : null;
              if (!arr) return false;

              const startBound = startDate
                  ? new Date(`${startDate}T00:00:00`)
                  : null;
              const endBound = endDate ? new Date(`${endDate}T23:59:59`) : null;

              if (startBound && arr < startBound) return false;
              if (endBound && arr > endBound) return false;

              return matchesText;
          })
        : [];

    // Pagination
    const totalPages = Math.ceil(filteredTamus.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTamus.slice(indexOfFirstItem, indexOfLastItem);

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

    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        // Validasi form
        if (!formData.plat_kendaraan) {
            toast.error("No Polisi wajib diisi!", toastConfig);
            return;
        }

        if (photos.length === 0) {
            toast.error("Foto kendaraan wajib diupload!", toastConfig);
            return;
        }

        try {
            setIsSubmitting(true);

            // Buat FormData object
            const submitFormData = new FormData();
            submitFormData.append("plat_kendaraan", formData.plat_kendaraan);
            submitFormData.append(
                "waktu_kedatangan",
                formData.waktu_kedatangan
            );
            submitFormData.append("lokasi", formData.lokasi);

            // Append setiap foto dengan nama field yang konsisten
            photos.forEach((photo) => {
                submitFormData.append("foto_kendaraan[]", photo);
            });

            // Log untuk debugging
            console.log("Submitting form data:", {
                plat_kendaraan: formData.plat_kendaraan,
                waktu_kedatangan: formData.waktu_kedatangan,
                lokasi: formData.lokasi,
                photos: photos.map((p) => ({
                    name: p.name,
                    type: p.type,
                    size: p.size,
                })),
            });

            // Kirim data menggunakan Inertia
            router.post(route("tamu.store"), submitFormData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    toast.success(
                        `Kendaraan ${formData.plat_kendaraan} berhasil ditambahkan!`,
                        toastConfig
                    );

                    // Update state tamus dengan data terbaru
                    if (page.props.tamus) {
                        setTamus(page.props.tamus);
                    }

                    // Reset form
                    setFormData({
                        plat_kendaraan: "",
                        waktu_kedatangan: dateFormat(
                            new Date(),
                            "yyyy-mm-dd'T'HH:MM"
                        ),
                        foto_kendaraan: [],
                    });
                    setPhotos([]);
                    setPreviewPhotos([]);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                    // Tutup modal
                    setShowPopup(false);
                },
                onError: (errors) => {
                    Object.keys(errors).forEach((key) => {
                        toast.error(errors[key], toastConfig);
                    });
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Terjadi kesalahan saat mengirim data", toastConfig);
            setIsSubmitting(false);
        }
    };

    // Tambahkan fungsi untuk mengecek apakah file sudah ada
    const isFileExists = (newFile) => {
        return photos.some(
            (existingFile) =>
                existingFile.name === newFile.name &&
                existingFile.size === newFile.size &&
                existingFile.lastModified === newFile.lastModified
        );
    };

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

    // Perbaikan fungsi handleFileUpload
    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files || e.dataTransfer?.files || []);

        if (files.length === 0) return;

        // Validasi jumlah foto
        if (photos.length + files.length > 5) {
            toast.error("Maksimal 5 foto yang dapat diunggah!", toastConfig);
            return;
        }

        // Tampilkan loading toast
        const loadingToastId = toast.loading("Memproses foto...", toastConfig);

        try {
            // Proses setiap file
            const processedFiles = [];

            for (const file of files) {
                try {
                    // Log informasi file untuk debugging
                    console.log("File original:", {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                    });

                    // Cek apakah file sudah ada
                    if (isFileExists(file)) {
                        toast.warning(
                            `File "${file.name}" sudah dipilih!`,
                            toastConfig
                        );
                        continue;
                    }

                    // Kompresi dan konversi gambar
                    const processedFile = await compressAndConvertImage(file);
                    processedFiles.push(processedFile);

                    // Log file yang sudah diproses
                    console.log("File processed:", {
                        name: processedFile.name,
                        type: processedFile.type,
                        size: processedFile.size,
                    });
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

    // Fungsi untuk menangani drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFileUpload(e);
    };

    // Fungsi untuk menghapus foto
    const removePhoto = (index) => {
        setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
        setPreviewPhotos((prevPreviews) =>
            prevPreviews.filter((_, i) => i !== index)
        );
        toast.info("Foto berhasil dihapus!", toastConfig);
    };

    // Fungsi untuk export ke Excel berdasarkan bulan atau semua data
    const exportToExcel = () => {
        try {
            let dataToExport = [];
            let fileName = "";

            if (exportType === "month") {
                // Filter data berdasarkan bulan yang dipilih
                const year = exportDate.getFullYear();
                const month = exportDate.getMonth();

                dataToExport = Array.isArray(tamus)
                    ? tamus.filter((tamu) => {
                          const tamuDate = new Date(tamu.waktu_kedatangan);
                          return (
                              tamuDate.getFullYear() === year &&
                              tamuDate.getMonth() === month
                          );
                      })
                    : [];

                if (dataToExport.length === 0) {
                    toast.warning(
                        `Tidak ada data untuk bulan ${month + 1}/${year}`
                    );
                    return;
                }

                // Set nama file dengan bulan dan tahun
                const monthName = exportDate.toLocaleString("id-ID", {
                    month: "long",
                });
                fileName = `Data_Kendaraan_Tamu_${monthName}_${year}.xlsx`;
            } else {
                // Export semua data
                dataToExport = tamus || [];

                if (dataToExport.length === 0) {
                    toast.warning("Tidak ada data untuk diexport");
                    return;
                }

                // Set nama file dengan tanggal hari ini
                fileName = `Data_Kendaraan_Tamu_All_${dateFormat(
                    new Date(),
                    "dd-mm-yyyy"
                )}.xlsx`;
            }

            // Format data untuk Excel
            const formattedData = dataToExport.map((tamu, index) => ({
                No: index + 1,
                "No Polisi": tamu.plat_kendaraan,
                "Waktu Kedatangan": dateFormat(
                    tamu.waktu_kedatangan,
                    "dd/mm/yyyy HH:MM:ss"
                ),
                "Waktu Kepergian": tamu.waktu_kepergian
                    ? dateFormat(tamu.waktu_kepergian, "dd/mm/yyyy HH:MM:ss")
                    : "-",
                Status: tamu.status,
            }));

            // Buat workbook dan worksheet
            const worksheet = XLSX.utils.json_to_sheet(formattedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Kendaraan Tamu");

            // Atur lebar kolom
            const colWidths = [
                { wch: 5 }, // No
                { wch: 15 }, // No Polisi
                { wch: 20 }, // Waktu Kedatangan
                { wch: 20 }, // Waktu Kepergian
                { wch: 10 }, // Status
            ];
            worksheet["!cols"] = colWidths;

            // Generate file Excel
            XLSX.writeFile(workbook, fileName);

            // Tampilkan pesan sukses
            if (exportType === "month") {
                const year = exportDate.getFullYear();
                const monthName = exportDate.toLocaleString("id-ID", {
                    month: "long",
                });
                toast.success(
                    `Data berhasil diexport ke Excel untuk bulan ${monthName} ${year}`
                );
            } else {
                toast.success("Semua data berhasil diexport ke Excel");
            }

            setShowExportModal(false);
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            toast.error("Terjadi kesalahan saat mengexport data");
        }
    };

    // Tambahkan fungsi untuk menampilkan detail tamu
    const showTamuDetail = (tamu) => {
        setSelectedTamu(tamu);
        setShowDetailModal(true);
    };

    // Perbaikan fungsi handleCloseTamu
    const handleCloseTamu = async (e) => {
        e.preventDefault();

        if (!selectedTamu) return;

        // Validasi foto
        if (photos.length === 0) {
            toast.error("Foto kendaraan wajib diupload!", toastConfig);
            return;
        }

        try {
            setIsClosingTamu(true);

            // Buat FormData object
            const formData = new FormData();
            formData.append(
                "waktu_kepergian",
                dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss")
            );

            // Append setiap foto dengan nama field yang konsisten
            photos.forEach((photo) => {
                formData.append("foto_kepergian[]", photo);
            });

            // Log untuk debugging
            console.log("Closing tamu data:", {
                waktu_kepergian: dateFormat(
                    new Date(),
                    "yyyy-mm-dd'T'HH:MM:ss"
                ),
                photos: photos.map((p) => ({
                    name: p.name,
                    type: p.type,
                    size: p.size,
                })),
            });

            // Kirim data menggunakan Inertia
            router.post(route("tamu.close", selectedTamu.id), formData, {
                forceFormData: true,
                preserveScroll: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                    "X-Requested-With": "XMLHttpRequest",
                    Accept: "application/json",
                },
                onSuccess: (page) => {
                    toast.success(
                        `Kendaraan ${selectedTamu.plat_kendaraan} berhasil ditutup!`,
                        toastConfig
                    );

                    // Update state tamus dengan data terbaru
                    if (page.props.tamus) {
                        setTamus(page.props.tamus);
                    }

                    // Reset form
                    setPhotos([]);
                    setPreviewPhotos([]);
                    if (fileInputRefClose.current) {
                        fileInputRefClose.current.value = "";
                    }

                    // Tutup modal
                    setCloseKendaraan(false);
                    setSelectedTamu(null);
                },
                onError: (errors) => {
                    Object.keys(errors).forEach((key) => {
                        toast.error(errors[key], toastConfig);
                    });
                },
                onFinish: () => {
                    setIsClosingTamu(false);
                },
            });
        } catch (error) {
            console.error("Error closing tamu:", error);
            toast.error(
                "Terjadi kesalahan saat menutup data tamu",
                toastConfig
            );
            setIsClosingTamu(false);
        }
    };

    // Perbaikan fungsi handleGalleryUploadClose
    const handleGalleryUploadClose = () => {
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

    // Perbaikan fungsi handleCameraCaptureClose
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

    // Perbaikan fungsi handleFileUploadClose
    const handleFileUploadClose = async (e) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) return;

        // Validasi jumlah foto
        if (photos.length + files.length > 5) {
            toast.error("Maksimal 5 foto yang dapat diunggah!", toastConfig);
            return;
        }

        // Tampilkan loading toast
        const loadingToastId = toast.loading("Memproses foto...", toastConfig);

        try {
            // Proses setiap file
            const processedFiles = [];

            for (const file of files) {
                try {
                    // Log informasi file untuk debugging
                    console.log("File original:", {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                    });

                    // Cek apakah file sudah ada
                    if (isFileExists(file)) {
                        toast.warning(
                            `File "${file.name}" sudah dipilih!`,
                            toastConfig
                        );
                        continue;
                    }

                    // Kompresi dan konversi gambar
                    const processedFile = await compressAndConvertImage(file);
                    processedFiles.push(processedFile);

                    // Log file yang sudah diproses
                    console.log("File processed:", {
                        name: processedFile.name,
                        type: processedFile.type,
                        size: processedFile.size,
                    });
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

    return (
        <>
            <Head title="Tamu" />
            <DashboardLayout>
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
                                    {tamus.length}
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
                                    Kendaraan Masuk
                                </h3>
                                <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                                    {
                                        tamus.filter(
                                            (tamu) => tamu.status === "New"
                                        ).length
                                    }
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
                                    Kendaraan Keluar
                                </h3>
                                <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                                    {
                                        tamus.filter(
                                            (tamu) => tamu.status === "Trip"
                                        ).length
                                    }
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
                                    Total Tamu
                                </h3>
                                <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {tamus.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1f2937] rounded-xl shadow-lg overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
                            <div className="max-w-full sm:w-full sm:col-span-1">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Cari kendaraan..."
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:col-span-1">
                                <div className="relative w-full">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => {
                                            setStartDate(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                        aria-label="Tanggal mulai kedatangan"
                                    />
                                    <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    –
                                </span>
                                <div className="relative w-full">
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => {
                                            setEndDate(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                        aria-label="Tanggal akhir kedatangan"
                                    />
                                    <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                            <div className="flex items-center sm:col-span-1 justify-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 shadow-sm">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    Tampilkan
                                </span>
                                <div className="ml-3 relative">
                                    <Listbox
                                        value={itemsPerPage}
                                        onChange={(val) =>
                                            handleItemsPerPageChange(val)
                                        }
                                        aria-label="Tampilkan per halaman"
                                    >
                                        <div className="relative">
                                            <Listbox.Button className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md text-sm font-medium px-3 py-1.5 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                                {itemsPerPage} baris/halaman
                                            </Listbox.Button>
                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-100"
                                                enterFrom="opacity-0 scale-95"
                                                enterTo="opacity-100 scale-100"
                                                leave="transition ease-in duration-100"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <Listbox.Options className="absolute top-full left-0 z-[9999] mt-1 w-44 overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                    {[8, 16].map((opt) => (
                                                        <Listbox.Option
                                                            key={opt}
                                                            value={opt}
                                                            className={({
                                                                active,
                                                            }) =>
                                                                `${
                                                                    active
                                                                        ? "bg-blue-50 dark:bg-blue-900/30"
                                                                        : ""
                                                                } cursor-pointer select-none relative py-2 pl-3 pr-3 text-gray-800 dark:text-gray-200`
                                                            }
                                                        >
                                                            {opt} baris
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:col-span-1 sm:justify-center">
                                {/* Button Tambah Data */}
                                <button
                                    onClick={() => setShowPopup(true)}
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md w-full sm:w-auto"
                                >
                                    <FaCar className="text-lg" />
                                    <span>Kendaraan Masuk</span>
                                </button>

                                {/* Dropdown Export */}
                                {auth.user.role === "admin" && (
                                    <button
                                        onClick={() => setShowExportModal(true)}
                                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md w-full sm:w-auto"
                                    >
                                        <FaFileExcel className="text-lg" />
                                        <span>Export Excel</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <TableSkeleton />
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/60">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            No
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            No Polisi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Waktu Kedatangan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Waktu Kepergian
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        {auth.user.role === "admin" && (
                                            <>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Lokasi
                                                </th>
                                            </>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                {indexOfFirstItem + index + 1}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                                                    {item.plat_kendaraan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                {dateFormat(
                                                    item.waktu_kedatangan,
                                                    "dd mmmm yyyy, HH:MM:ss"
                                                )}{" "}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                {item.waktu_kepergian
                                                    ? dateFormat(
                                                          item.waktu_kepergian,
                                                          "dd mmmm yyyy, HH:MM:ss"
                                                      )
                                                    : "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.status === "New" ? (
                                                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 items-center w-auto inline-flex">
                                                        <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></span>
                                                        {item.status}
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 items-center w-auto inline-flex">
                                                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                                                        {item.status}
                                                    </span>
                                                )}
                                            </td>
                                            {auth.user.role === "admin" && (
                                                <>
                                                    <td>
                                                        <span
                                                            className={`${
                                                                item.lokasi ===
                                                                "Karawang"
                                                                    ? "bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 hover:bg-rose-200 dark:hover:bg-rose-800"
                                                                    : "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800"
                                                            } px-2 py-1 rounded-md text-sm font-medium transition-colors`}
                                                        >
                                                            {item.lokasi}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Menu
                                                    as="div"
                                                    className="relative inline-block text-left"
                                                >
                                                    <Menu.Button className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-1.5 rounded-lg shadow-sm hover:shadow-md">
                                                        <FaEllipsisV className="w-4 h-4" />
                                                    </Menu.Button>

                                                    <Transition
                                                        as={Fragment}
                                                        enter="transition ease-out duration-100"
                                                        enterFrom="transform opacity-0 scale-95"
                                                        enterTo="transform opacity-100 scale-100"
                                                        leave="transition ease-in duration-75"
                                                        leaveFrom="transform opacity-100 scale-100"
                                                        leaveTo="transform opacity-0 scale-95"
                                                    >
                                                        <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                                                            <div className="py-1">
                                                                {item.status ===
                                                                "New" ? (
                                                                    <Menu.Item>
                                                                        {({
                                                                            active,
                                                                        }) => (
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedTamu(
                                                                                        item
                                                                                    );
                                                                                    setCloseKendaraan(
                                                                                        true
                                                                                    );
                                                                                }}
                                                                                className={`${
                                                                                    active
                                                                                        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                                                        : "text-gray-700 dark:text-gray-200"
                                                                                } w-full text-left px-4 py-2 text-sm flex items-center gap-2`}
                                                                            >
                                                                                <FaCarSide className="text-teal-500" />
                                                                                <span>
                                                                                    Tutup
                                                                                    Tamu
                                                                                </span>
                                                                            </button>
                                                                        )}
                                                                    </Menu.Item>
                                                                ) : (
                                                                    <Menu.Item>
                                                                        {({
                                                                            active,
                                                                        }) => (
                                                                            <div
                                                                                className={`${
                                                                                    active
                                                                                        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                                                        : "text-gray-700 dark:text-gray-200"
                                                                                } px-4 py-2 text-sm flex items-center gap-2`}
                                                                            >
                                                                                <FaCheck className="text-blue-500" />
                                                                                <span>
                                                                                    Trip
                                                                                    Selesai
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </Menu.Item>
                                                                )}

                                                                <Menu.Item>
                                                                    {({
                                                                        active,
                                                                    }) => (
                                                                        <button
                                                                            onClick={() => {
                                                                                showTamuDetail(
                                                                                    item
                                                                                );
                                                                            }}
                                                                            className={`${
                                                                                active
                                                                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                                                    : "text-gray-700 dark:text-gray-200"
                                                                            } w-full text-left px-4 py-2 text-sm flex items-center gap-2`}
                                                                        >
                                                                            <FaEye className="text-blue-500" />
                                                                            <span>
                                                                                Lihat
                                                                                Detail
                                                                            </span>
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                            </div>
                                                        </Menu.Items>
                                                    </Transition>
                                                </Menu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {/* Pagination baru yang lebih modern */}
                        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f2937] sticky bottom-0 left-0 right-0 shadow-md overflow-visible">
                            {/* Info showing entries - Responsive text size */}
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left mb-4 sm:mb-0">
                                Showing{" "}
                                <span className="font-medium mx-1">
                                    {indexOfFirstItem + 1}
                                </span>
                                to{" "}
                                <span className="font-medium mx-1">
                                    {Math.min(indexOfLastItem, tamus.length)}
                                </span>
                                of{" "}
                                <span className="font-medium mx-1">
                                    {tamus.length}
                                </span>{" "}
                                entries
                            </div>

                            {/* Items per page selector - Centered on desktop */}

                            <div className="flex items-center space-x-4">
                                {/* Previous Button - Responsive sizing */}
                                <button
                                    onClick={() => paginate(currentPage - 1)}
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
                                                            currentPage === page
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
                                    onClick={() => paginate(currentPage + 1)}
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
            </DashboardLayout>
            {/* Modal Tambah Data */}
            <ModalNew
                isOpen={showPopup}
                onClose={() => setShowPopup(false)}
                title="Tambah Data"
            >
                <div className="max-h-[85vh] overflow-y-auto px-1">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    No Polisi
                                </label>
                                <input
                                    type="text"
                                    value={formData.plat_kendaraan}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            plat_kendaraan: e.target.value,
                                        })
                                    }
                                    className="block w-full px-3 py-2 uppercase disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:shadow-none dark:disabled:border-gray-700 dark:disabled:bg-[#616161]/20 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#515151] dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm"
                                    placeholder="T 1234 ABC"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Waktu Kedatangan
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.waktu_kedatangan}
                                    disabled
                                    className="block w-full cursor-not-allowed px-3 py-2 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:shadow-none dark:disabled:border-gray-700 dark:disabled:bg-[#616161]/20 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#515151] dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm"
                                    placeholder="Masukkan Waktu Kedatangan"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Foto Kendaraan
                                </label>
                                <div
                                    className="mt-1 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg p-4"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    {previewPhotos.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center space-y-3 py-5">
                                            <svg
                                                className="mx-auto h-12 w-12 text-gray-400"
                                                stroke="currentColor"
                                                fill="none"
                                                viewBox="0 0 48 48"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                    strokeWidth={2}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                                <label
                                                    htmlFor="file-upload"
                                                    className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                                >
                                                    <span className="px-2">
                                                        Upload file
                                                    </span>
                                                    <input
                                                        id="file-upload"
                                                        name="file-upload"
                                                        type="file"
                                                        className="sr-only"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={
                                                            handleFileUpload
                                                        }
                                                        ref={fileInputRef}
                                                    />
                                                </label>
                                                <p className="pl-1">
                                                    atau drag and drop
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                PNG atau JPG hingga 5MB
                                                (Maksimal 5 foto)
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {previewPhotos.map(
                                                (preview, index) => (
                                                    <div
                                                        key={index}
                                                        className="relative group"
                                                    >
                                                        <img
                                                            src={preview}
                                                            alt={`Preview ${
                                                                index + 1
                                                            }`}
                                                            className="w-full h-32 object-cover rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removePhoto(
                                                                    index
                                                                )
                                                            }
                                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                        >
                                                            <FaTimes className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                            {previewPhotos.length < 5 && (
                                                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={
                                                            handleFileUpload
                                                        }
                                                        ref={fileInputRef}
                                                    />
                                                    <FaPlus className="w-6 h-6 text-gray-400" />
                                                    <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                        Tambah Foto
                                                    </span>
                                                </label>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {photos.length > 0 && (
                                    <div className="mt-2 flex items-center justify-between">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {photos.length} foto terpilih (
                                            {photos.length}/5)
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPhotos([]);
                                                setPreviewPhotos([]);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value =
                                                        "";
                                                }
                                            }}
                                            className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            Hapus Semua
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({
                                        plat_kendaraan: "",
                                        waktu_kedatangan: new Date()
                                            .toISOString()
                                            .slice(0, 16),
                                        foto_kendaraan: [],
                                    });
                                    setPhotos([]);
                                    setPreviewPhotos([]);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = "";
                                    }
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                disabled={isSubmitting}
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center space-x-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg
                                            className="animate-spin h-5 w-5 mr-2"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Simpan Data</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </ModalNew>

            {/* Export Data ke Excel */}
            <ModalNew
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
                                            className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#515151] text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2 shadow-sm hover:shadow-md"
                        >
                            <FaFileExcel className="w-4 h-4" />
                            <span>Export Excel</span>
                        </button>
                    </div>
                </div>
            </ModalNew>

            {/* Modal Detail Kendaraan */}
            <ModalNew
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Detail Kendaraan Tamu"
            >
                {selectedTamu && (
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Informasi Kendaraan */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                    <FaCar className="mr-2 text-blue-500" />
                                    Informasi Kendaraan
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            No. Polisi
                                        </p>
                                        <p className="text-base font-medium text-gray-800 dark:text-white">
                                            {selectedTamu.plat_kendaraan}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Status
                                        </p>
                                        <span
                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-md ${
                                                selectedTamu.status === "Close"
                                                    ? "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300"
                                                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                            }`}
                                        >
                                            {selectedTamu.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Informasi Waktu */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                    <FaClock className="mr-2 text-blue-500" />
                                    Informasi Waktu
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Waktu Kedatangan
                                        </p>
                                        <p className="text-base font-medium text-gray-800 dark:text-white">
                                            {dateFormat(
                                                selectedTamu.waktu_kedatangan,
                                                "dd mmmm yyyy, HH:MM:ss"
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Waktu Kepergian
                                        </p>
                                        <p className="text-base font-medium text-gray-800 dark:text-white">
                                            {selectedTamu.waktu_kepergian
                                                ? dateFormat(
                                                      selectedTamu.waktu_kepergian,
                                                      "dd mmmm yyyy, HH:MM:ss"
                                                  )
                                                : "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Foto Kendaraan */}
                        <div className="mb-6">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                    <FaImage className="mr-2 text-blue-500" />
                                    Foto Kedatangan
                                </h4>
                                {selectedTamu.foto_kedatangan &&
                                selectedTamu.foto_kedatangan.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {JSON.parse(
                                            selectedTamu.foto_kedatangan
                                        ).map((foto, index) => (
                                            <div
                                                key={index}
                                                className="relative group"
                                            >
                                                <img
                                                    src={`/storage/${foto}`}
                                                    alt={`Foto kedatangan ${
                                                        index + 1
                                                    }`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                                <a
                                                    href={`/storage/${foto}`}
                                                    target="_blank"
                                                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                                >
                                                    <FaSearch className="text-white text-xl" />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 italic">
                                        Tidak ada foto kedatangan
                                    </p>
                                )}
                            </div>

                            {selectedTamu.foto_kepergian && (
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm mt-4">
                                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                        <FaImage className="mr-2 text-blue-500" />
                                        Foto Kepergian
                                    </h4>
                                    {selectedTamu.foto_kepergian &&
                                    selectedTamu.foto_kepergian.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {JSON.parse(
                                                selectedTamu.foto_kepergian
                                            ).map((foto, index) => (
                                                <div
                                                    key={index}
                                                    className="relative group"
                                                >
                                                    <img
                                                        src={`/storage/${foto}`}
                                                        alt={`Foto kepergian ${
                                                            index + 1
                                                        }`}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    <a
                                                        href={`/storage/${foto}`}
                                                        target="_blank"
                                                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                                    >
                                                        <FaSearch className="text-white text-xl" />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 italic">
                                            Tidak ada foto kepergian
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </ModalNew>

            {/* Modal Tutup Tamu */}
            <ModalNew
                isOpen={closeKendaraan}
                onClose={() => {
                    setCloseKendaraan(false);
                    setSelectedTamu(null);
                    setPhotos([]);
                    setPreviewPhotos([]);
                }}
                title="Tutup Kendaraan Tamu"
            >
                {selectedTamu && (
                    <form onSubmit={handleCloseTamu} className="space-y-6 p-4">
                        <div className="space-y-6">
                            {/* Detail Tamu */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        No Polisi
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedTamu.plat_kendaraan}
                                        className="block w-full px-4 py-3 rounded-lg bg-gray-100 cursor-not-allowed border-gray-300 dark:border-gray-600 dark:bg-[#717171] dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Waktu Kedatangan
                                    </label>
                                    <input
                                        type="text"
                                        value={dateFormat(
                                            selectedTamu.waktu_kedatangan,
                                            "dd mmmm yyyy, HH:MM:ss"
                                        )}
                                        className="block w-full px-4 py-3 rounded-lg border-gray-300 bg-gray-100 cursor-not-allowed dark:border-gray-600 dark:bg-[#717171] dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                        disabled
                                    />
                                </div>
                            </div>

                            {/* Waktu Kepergian */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Waktu Kepergian
                                </label>
                                <input
                                    type="text"
                                    value={dateFormat(
                                        new Date(),
                                        "dd mmmm yyyy, HH:MM:ss"
                                    )}
                                    className="block w-full px-4 py-3 rounded-lg border-gray-300 bg-gray-100 cursor-not-allowed dark:border-gray-600 dark:bg-[#717171] dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                    disabled
                                />
                            </div>

                            {/* Foto Kendaraan Keluar */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Foto Kendaraan Keluar
                                </label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                                    {previewPhotos.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full space-y-4 w-full min-h-[200px]">
                                            <div className="text-center space-y-2 flex flex-col items-center justify-center">
                                                <FaImage className="h-12 w-12 text-gray-400" />
                                                <div className="text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium">
                                                        Pilih foto atau ambil
                                                        gambar
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleGalleryUploadClose
                                                    }
                                                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                >
                                                    <FaPlus className="mr-2" />
                                                    Galeri
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleCameraCaptureClose
                                                    }
                                                    className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                >
                                                    <FaCamera className="mr-2" />
                                                    Kamera
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-4">
                                            {previewPhotos.map(
                                                (preview, index) => (
                                                    <div
                                                        key={index}
                                                        className="relative group"
                                                    >
                                                        <img
                                                            src={preview}
                                                            alt={`Foto ${
                                                                index + 1
                                                            }`}
                                                            className="w-full h-48 object-cover rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removePhoto(
                                                                    index
                                                                )
                                                            }
                                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                            {previewPhotos.length < 5 && (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleGalleryUploadClose
                                                    }
                                                    className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                                                >
                                                    <FaPlus className="text-gray-400 w-4 h-4 mb-1" />
                                                    <span className="text-gray-600 dark:text-gray-400 text-xs">
                                                        Tambah
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Input file tersembunyi */}
                            <input
                                type="file"
                                ref={fileInputRefClose}
                                className="hidden"
                                onChange={handleFileUploadClose}
                                multiple
                                accept="image/*"
                            />
                        </div>

                        {/* Tombol Submit */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => {
                                    setCloseKendaraan(false);
                                    setSelectedTamu(null);
                                    setPhotos([]);
                                    setPreviewPhotos([]);
                                }}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isClosingTamu}
                                className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center space-x-2"
                            >
                                {isClosingTamu ? (
                                    <>
                                        <svg
                                            className="animate-spin h-5 w-5 mr-2"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <span>Tutup Kendaraan</span>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </ModalNew>

            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </>
    );
}
