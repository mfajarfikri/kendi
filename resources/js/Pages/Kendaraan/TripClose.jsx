import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router, usePage } from "@inertiajs/react";
import React, { useRef, useState } from "react";
import dateFormat from "dateformat";
import { FaCamera, FaTimes, FaPlus, FaSave } from "react-icons/fa";
import { toast, ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export default function TripClose({ trip }) {
    const toastConfig = { position: "top-right", autoClose: 2000 };
    const [kmAkhir, setKmAkhir] = useState("");
    const [isClosingTrip, setIsClosingTrip] = useState(false);
    const fileInputRefClose = useRef(null);
    const [photos, setPhotos] = useState([]);
    const [previewPhotos, setPreviewPhotos] = useState([]);

    const compressAndConvertImage = (file) => {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith("image/")) {
                reject(new Error("File bukan gambar"));
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
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
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob(
                        (blob) => {
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
                img.onerror = () => reject(new Error("Gagal memuat gambar"));
                img.src = event.target.result;
            };
            reader.onerror = () => reject(new Error("Gagal membaca file"));
            reader.readAsDataURL(file);
        });
    };

    const handleFileUploadClose = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        if (photos.length + files.length > 5) {
            toast.error("Maksimal 5 foto yang dapat diunggah", toastConfig);
            return;
        }
        const processedFiles = [];
        for (const file of files) {
            try {
                const processedFile = await compressAndConvertImage(file);
                processedFiles.push(processedFile);
            } catch (error) {
                toast.error(
                    `Gagal memproses file "${file.name}": ${error.message}`,
                    toastConfig
                );
            }
        }
        if (processedFiles.length === 0) return;
        setPhotos((prevPhotos) => [...prevPhotos, ...processedFiles]);
        processedFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPreviewPhotos((prevPreviews) => [
                    ...prevPreviews,
                    ev.target.result,
                ]);
            };
            reader.readAsDataURL(file);
        });
        if (fileInputRefClose.current) fileInputRefClose.current.value = "";
    };

    const removePhoto = (index) => {
        setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
        setPreviewPhotos((prevPreviews) =>
            prevPreviews.filter((_, i) => i !== index)
        );
        toast.info("Foto berhasil dihapus!", toastConfig);
    };

    const handleCloseTrip = async (e) => {
        e.preventDefault();
        setIsClosingTrip(true);
        const kmAwal = trip.km_awal || trip.kendaraan?.km || 0;
        if (parseInt(kmAkhir) <= parseInt(kmAwal)) {
            toast.error(
                "Kilometer akhir harus lebih besar dari kilometer awal",
                toastConfig
            );
            setIsClosingTrip(false);
            return;
        }
        const jarak = parseInt(kmAkhir) - parseInt(kmAwal);
        const formData = new FormData();
        formData.append("km_akhir", kmAkhir);
        formData.append(
            "waktu_kembali",
            dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss")
        );
        formData.append("jarak", jarak);
        if (photos.length > 0) {
            photos.forEach((photo) => formData.append("foto_kembali[]", photo));
        }
        try {
            await axios.post(route("trips.close", trip.id), formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "X-Requested-With": "XMLHttpRequest",
                    Accept: "application/json",
                },
            });
            toast.success(
                `Trip ${trip.code_trip} berhasil ditutup`,
                toastConfig
            );
            router.visit(route("trips.show", trip.code_trip));
        } catch (error) {
            toast.error(
                "Gagal menutup trip: " +
                    (error.response?.data?.message || "Terjadi kesalahan"),
                toastConfig
            );
        } finally {
            setIsClosingTrip(false);
        }
    };

    return (
        <>
            <Head title={`Tutup Trip ${trip.code_trip}`} />
            <DashboardLayout>
                <div className="py-0">
                    <div className="p-4 sm:p-6 bg-white dark:bg-[#1f2937] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 mb-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                Tutup Trip
                            </h1>
                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                {trip.code_trip}
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Isi kilometer akhir dan unggah bukti foto kendaraan
                            kembali.
                        </p>
                    </div>
                    <form onSubmit={handleCloseTrip} className="space-y-6">
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-[#1f2937] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Kode Trip
                                        </label>
                                        <input
                                            type="text"
                                            value={trip.code_trip}
                                            className="block w-full px-4 py-3 rounded-lg bg-gray-100 cursor-not-allowed border border-gray-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-400 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Plat Kendaraan
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                trip.kendaraan?.plat_kendaraan
                                            }
                                            className="block w-full px-4 py-3 rounded-lg bg-gray-100 cursor-not-allowed border border-gray-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-400 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#1f2937] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Kilometer Awal
                                        </label>
                                        <input
                                            type="text"
                                            value={trip.km_awal}
                                            className="block w-full px-4 py-3 rounded-lg bg-gray-100 cursor-not-allowed border border-gray-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-400 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Kilometer Akhir
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={kmAkhir}
                                            onChange={(e) =>
                                                setKmAkhir(e.target.value)
                                            }
                                            className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                            required
                                            placeholder="Masukkan kilometer akhir"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#1f2937] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Foto Kendaraan Kembali
                                </label>
                                <div className="mt-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-5">
                                    {previewPhotos.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center space-y-4 py-6">
                                            <svg
                                                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
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
                                            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        fileInputRefClose.current?.click()
                                                    }
                                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-green-900/30 text-emerald-600 dark:text-green-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-green-800/50 transition-colors"
                                                >
                                                    <FaCamera className="w-4 h-4" />
                                                    <span>
                                                        Ambil/Upload Foto
                                                    </span>
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                PNG atau JPG hingga 5MB,
                                                maksimal 5 foto
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
                                                            className="w-full h-32 object-cover rounded-lg ring-1 ring-gray-200 dark:ring-gray-700"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removePhoto(
                                                                    index
                                                                )
                                                            }
                                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow"
                                                        >
                                                            <FaTimes className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                            {previewPhotos.length < 5 && (
                                                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-800/40">
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={
                                                            handleFileUploadClose
                                                        }
                                                        ref={fileInputRefClose}
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
                            </div>

                            <input
                                type="file"
                                ref={fileInputRefClose}
                                className="hidden"
                                onChange={handleFileUploadClose}
                                multiple
                                accept="image/jpeg,image/png,image/jpg"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() =>
                                    router.visit(
                                        route("trips.show", trip.code_trip)
                                    )
                                }
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isClosingTrip}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg disabled:opacity-50 transition-all shadow-sm hover:shadow flex items-center space-x-2"
                            >
                                {isClosingTrip ? (
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
                                        <FaSave className="w-4 h-4" />
                                        <span>Simpan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </DashboardLayout>
            <ToastContainer
                position="top-center"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                transition={Slide}
                style={{ zIndex: 9999 }}
                toastStyle={{
                    fontSize: "1rem",
                    lineHeight: 1.5,
                    padding: "12px 16px",
                }}
            />
        </>
    );
}
