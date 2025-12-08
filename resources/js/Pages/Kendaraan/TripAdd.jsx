import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, router } from "@inertiajs/react";
import React, { useEffect, useRef, useState } from "react";
import dateFormat from "dateformat";
import {
    FaLock,
    FaClock,
    FaCarSide,
    FaCar,
    FaIdCard,
    FaTachometerAlt,
    FaInfo,
    FaMapMarkerAlt,
    FaUsers,
    FaUserTie,
    FaTimes,
    FaPlus,
    FaEdit,
    FaSave,
    FaSpinner,
} from "react-icons/fa";
import { toast, ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Listbox, Combobox, Transition } from "@headlessui/react";

export default function TripAdd({ kendaraans, drivers, auth }) {
    const toastConfig = { position: "top-right", autoClose: 4000 };

    const generateRandomCode = () => {
        const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let r = "";
        for (let i = 0; i < 10; i++)
            r += c.charAt(Math.floor(Math.random() * c.length));
        return r;
    };

    const { data, setData, processing, errors, reset } = useForm({
        code_trip: generateRandomCode(),
        kendaraan_id: "",
        driver_id: "",
        waktu_keberangkatan: dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM"),
        tujuan: "",
        catatan: "",
        km: "",
        merek: "",
        plat_kendaraan: "",
        status: "",
        lokasi: auth?.user?.lokasi ?? "",
        penumpang: "",
    });

    useEffect(() => {
        const t = setInterval(() => {
            setData(
                "waktu_keberangkatan",
                dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM")
            );
        }, 1000);
        return () => clearInterval(t);
    }, []);

    const fileInputRef = useRef(null);
    const [photos, setPhotos] = useState([]);
    const [previewPhotos, setPreviewPhotos] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigateTimerRef = useRef(null);
    const successToastIdRef = useRef(null);
    const [driverQuery, setDriverQuery] = useState("");

    const getInputSnapshot = () => ({
        code_trip: data.code_trip,
        kendaraan_id: data.kendaraan_id,
        driver_id: data.driver_id,
        waktu_keberangkatan: data.waktu_keberangkatan,
        tujuan: data.tujuan,
        catatan: data.catatan,
        km: (data.km || "").replace(/\./g, ""),
        penumpang: data.penumpang,
        lokasi: data.lokasi,
        photosCount: photos.length,
    });

    const logError = (type, error, extra = {}) => {
        const timestamp = new Date().toISOString();
        const message = error?.message || String(error);
        const payload = { ...extra, inputData: getInputSnapshot() };
        toast.error(
            "Error Log",
            { type, message, timestamp, payload },
            toastConfig
        );
    };

    const compressAndConvertImage = (file) => {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith("image/")) {
                logError("Invalid File Type", new Error("File bukan gambar"), {
                    fileName: file.name,
                    fileType: file.type,
                });
                reject(new Error("File bukan gambar"));
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    let w = img.width;
                    let h = img.height;
                    const MAX = 1200;
                    if (w > h && w > MAX) {
                        h = Math.round((h * MAX) / w);
                        w = MAX;
                    } else if (h > MAX) {
                        w = Math.round((w * MAX) / h);
                        h = MAX;
                    }
                    const canvas = document.createElement("canvas");
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext("2d");
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(0, 0, w, h);
                    ctx.drawImage(img, 0, 0, w, h);
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
                img.onerror = () => {
                    logError(
                        "Image Load Error",
                        new Error("Gagal memuat gambar"),
                        { fileName: file.name }
                    );
                    reject(new Error("Gagal memuat gambar"));
                };
                img.src = event.target.result;
            };
            reader.onerror = () => {
                logError("FileReader Error", new Error("Gagal membaca file"), {
                    fileName: file.name,
                });
                reject(new Error("Gagal membaca file"));
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileUpload = async (e) => {
        try {
            const files = Array.from(e.target.files || []);
            if (files.length === 0) return;
            if (photos.length + files.length > 5) {
                toast.error("Maksimal 5 foto yang dapat diunggah", toastConfig);
                return;
            }
            const processed = [];
            for (const f of files) {
                try {
                    const p = await compressAndConvertImage(f);
                    processed.push(p);
                } catch (err) {
                    logError("Image Processing Error", err, {
                        fileName: f.name,
                    });
                    toast.error(
                        `Gagal memproses file "${f.name}": ${err.message}`,
                        toastConfig
                    );
                }
            }
            if (processed.length === 0) return;
            setPhotos((prev) => [...prev, ...processed]);
            processed.forEach((f) => {
                const r = new FileReader();
                r.onload = (ev) =>
                    setPreviewPhotos((prev) => [...prev, ev.target.result]);
                r.readAsDataURL(f);
            });
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            logError("File Upload Error", err);
            toast.error("Terjadi kesalahan saat upload file", toastConfig);
        }
    };

    const removePhoto = (index) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
        setPreviewPhotos((prev) => prev.filter((_, i) => i !== index));
        toast.info("Foto berhasil dihapus!", toastConfig);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (photos.length === 0) {
                toast.error(
                    "Harap tambahkan minimal 1 foto kendaraan",
                    toastConfig
                );
                setIsSubmitting(false);
                return;
            }
            const formData = new FormData();
            formData.append("code_trip", data.code_trip);
            formData.append("kendaraan_id", data.kendaraan_id);
            formData.append("driver_id", data.driver_id);
            formData.append("waktu_keberangkatan", data.waktu_keberangkatan);
            formData.append("tujuan", data.tujuan);
            formData.append("catatan", data.catatan || "");
            formData.append("km", (data.km || "").replace(/\./g, ""));
            formData.append("penumpang", data.penumpang || "");
            formData.append("lokasi", data.lokasi);
            photos.forEach((p) => formData.append("foto_berangkat[]", p));
            try {
                const response = await axios.post(
                    route("trips.create"),
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            "X-Requested-With": "XMLHttpRequest",
                            Accept: "application/json",
                        },
                    }
                );
                if (navigateTimerRef.current) {
                    clearTimeout(navigateTimerRef.current);
                }
                const content = (
                    <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">
                            Trip {data.code_trip} berhasil ditambahkan
                        </span>
                        <button
                            onClick={() => {
                                if (navigateTimerRef.current) {
                                    clearTimeout(navigateTimerRef.current);
                                }
                                if (successToastIdRef.current) {
                                    toast.dismiss(successToastIdRef.current);
                                }
                                router.visit(
                                    route(
                                        "trips.show",
                                        response.data.trip.code_trip
                                    )
                                );
                            }}
                            className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            Lanjutkan
                        </button>
                    </div>
                );
                successToastIdRef.current = toast.success(content, {
                    ...toastConfig,
                    closeOnClick: true,
                    onClose: () => {
                        if (navigateTimerRef.current) {
                            clearTimeout(navigateTimerRef.current);
                            navigateTimerRef.current = null;
                        }
                    },
                });
                reset();
                setPhotos([]);
                setPreviewPhotos([]);
                navigateTimerRef.current = setTimeout(() => {
                    router.visit(
                        route("trips.show", response.data.trip.code_trip)
                    );
                    if (successToastIdRef.current) {
                        toast.dismiss(successToastIdRef.current);
                        successToastIdRef.current = null;
                    }
                }, 3000);
            } catch (error) {
                logError("Axios Error", error, {
                    status: error?.response?.status,
                    response: error?.response?.data,
                });
                toast.error(
                    error.response?.data?.message ||
                        "Gagal menambahkan trip: " +
                            (error.response?.data?.foto_berangkat ||
                                "Terjadi kesalahan"),
                    toastConfig
                );
            }
        } catch (err) {
            logError("Submit Error", err);
            toast.error("Terjadi kesalahan saat menambahkan trip", toastConfig);
        } finally {
            setIsSubmitting(false);
        }
    };

    const kendaraanTersediaStatus = Array.isArray(kendaraans)
        ? kendaraans
              .filter((k) => k.status === "Tersedia")
              .toSorted((a, b) => a.merek.localeCompare(b.merek))
        : [];
    const driversAvailable = Array.isArray(drivers)
        ? drivers
              .filter((d) => d.status === "Tersedia")
              .toSorted((a, b) => a.name.localeCompare(b.name))
        : [];

    return (
        <>
            <Head title="Tambah Trip" />
            <DashboardLayout>
                <div className="py-0">
                    <div className="max-h-[85vh] overflow-y-auto px-1">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                                Informasi Trip dan Kendaraan
                                            </h2>
                                            <span className="text-xs text-rose-500 dark:text-rose-400">
                                                * Pastikan data sesuai
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Kode Trip
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <FaLock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={data.code_trip}
                                                        className="block w-full pl-10 pr-3 py-2.5 disabled:border-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:shadow-none dark:disabled:border-gray-700 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors cursor-not-allowed text-base"
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Waktu
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <FaClock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="datetime-local"
                                                        value={
                                                            data.waktu_keberangkatan
                                                        }
                                                        className="block w-full pl-10 pr-3 py-2.5 disabled:border-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:shadow-none dark:disabled:border-gray-700 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors cursor-not-allowed text-base"
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Pilih Kendaraan
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <FaCarSide className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                                </div>
                                                <Listbox
                                                    value={
                                                        kendaraans.find(
                                                            (k) =>
                                                                k.id ===
                                                                parseInt(
                                                                    data.kendaraan_id
                                                                )
                                                        ) || null
                                                    }
                                                    onChange={(selected) => {
                                                        if (selected) {
                                                            setData({
                                                                ...data,
                                                                kendaraan_id:
                                                                    selected.id,
                                                                merek: selected.merek,
                                                                plat_kendaraan:
                                                                    selected.plat_kendaraan,
                                                                km:
                                                                    selected.km ||
                                                                    "",
                                                                status:
                                                                    selected.status ||
                                                                    "",
                                                            });
                                                        }
                                                    }}
                                                    aria-label="Pilih Kendaraan"
                                                >
                                                    <div className="relative">
                                                        <Listbox.Button className="block w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-left focus:border-blue-500 focus:ring-blue-500 transition-colors text-base">
                                                            {data.kendaraan_id
                                                                ? `${data.plat_kendaraan} - ${data.merek}`
                                                                : "Pilih Kendaraan"}
                                                        </Listbox.Button>
                                                        <Transition
                                                            leave="transition ease-in duration-100"
                                                            leaveFrom="opacity-100"
                                                            leaveTo="opacity-0"
                                                        >
                                                            <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                {kendaraanTersediaStatus.map(
                                                                    (k) => (
                                                                        <Listbox.Option
                                                                            key={
                                                                                k.id
                                                                            }
                                                                            value={
                                                                                k
                                                                            }
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
                                                                        </Listbox.Option>
                                                                    )
                                                                )}
                                                            </Listbox.Options>
                                                        </Transition>
                                                    </div>
                                                </Listbox>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Merek
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <FaCar className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={data.merek}
                                                        className="block w-full pl-10 pr-3 py-2.5 disabled:border-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:shadow-none dark:disabled:border-gray-700 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors cursor-not-allowed text-base"
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Plat Nomor
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <FaIdCard className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={
                                                            data.plat_kendaraan
                                                        }
                                                        className="block w-full pl-10 pr-3 py-2.5 disabled:border-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:shadow-none dark:disabled:border-gray-700 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors cursor-not-allowed text-base"
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Kilometer Awal
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <FaTachometerAlt className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={data.km}
                                                        onChange={(e) => {
                                                            const raw =
                                                                e.target.value;
                                                            const num =
                                                                raw.replace(
                                                                    /\D/g,
                                                                    ""
                                                                );
                                                            const fmt =
                                                                num.replace(
                                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                                    "."
                                                                );
                                                            setData("km", fmt);
                                                        }}
                                                        className="block w-full pl-10 pr-3 py-2.5 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors text-base"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Status
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <FaInfo className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={data.status}
                                                        className="block w-full pl-10 pr-3 py-2.5 disabled:border-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:shadow-none dark:disabled:border-gray-700 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors cursor-not-allowed text-base"
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Tujuan
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <FaMapMarkerAlt className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.tujuan}
                                                    onChange={(e) =>
                                                        setData(
                                                            "tujuan",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="block w-full pl-10 pr-3 py-2.5 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors text-base"
                                                    placeholder="Contoh : GI Kosambi Baru"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Penumpang
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <FaUsers className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.penumpang}
                                                    onChange={(e) =>
                                                        setData(
                                                            "penumpang",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="block w-full pl-10 pr-3 py-2.5 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors text-base"
                                                    placeholder="Masukkan nama penumpang"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Driver
                                            </label>
                                            <div className="relative">
                                                <Combobox
                                                    value={
                                                        driversAvailable.find(
                                                            (d) =>
                                                                String(d.id) ===
                                                                String(
                                                                    data.driver_id
                                                                )
                                                        ) || null
                                                    }
                                                    onChange={(d) =>
                                                        setData(
                                                            "driver_id",
                                                            d.id
                                                        )
                                                    }
                                                    aria-label="Pilih Driver"
                                                >
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                            <FaUserTie className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                                        </div>
                                                        <Combobox.Input
                                                            className="block w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors text-base"
                                                            placeholder="Cari atau pilih driver"
                                                            onChange={(e) =>
                                                                setDriverQuery(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            displayValue={(d) =>
                                                                d
                                                                    ? `${d.name} - ${d.phone_number}`
                                                                    : ""
                                                            }
                                                        />
                                                        <Transition
                                                            leave="transition ease-in duration-100"
                                                            leaveFrom="opacity-100"
                                                            leaveTo="opacity-0"
                                                        >
                                                            <Combobox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                {(driverQuery ===
                                                                ""
                                                                    ? driversAvailable
                                                                    : driversAvailable.filter(
                                                                          (d) =>
                                                                              d.name
                                                                                  .toLowerCase()
                                                                                  .includes(
                                                                                      driverQuery.toLowerCase()
                                                                                  ) ||
                                                                              String(
                                                                                  d.phone_number
                                                                              )
                                                                                  .toLowerCase()
                                                                                  .includes(
                                                                                      driverQuery.toLowerCase()
                                                                                  )
                                                                      )
                                                                ).map((d) => (
                                                                    <Combobox.Option
                                                                        key={
                                                                            d.id
                                                                        }
                                                                        value={
                                                                            d
                                                                        }
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
                                            {errors.driver_id && (
                                                <div className="text-red-500 text-xs mt-1">
                                                    {errors.driver_id}
                                                </div>
                                            )}
                                            {driversAvailable.length === 0 && (
                                                <div className="text-yellow-500 text-xs mt-1">
                                                    Tidak ada driver yang
                                                    tersedia saat ini
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                                Dokumentasi Kendaraan
                                            </h2>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Unggah 1–5 foto
                                            </span>
                                        </div>
                                        <div className="border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg p-4 bg-white dark:bg-gray-800">
                                            {previewPhotos.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center space-y-3 py-5">
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
                                                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                                        <label
                                                            htmlFor="file-upload"
                                                            className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
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
                                                                ref={
                                                                    fileInputRef
                                                                }
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
                                                                    src={
                                                                        preview
                                                                    }
                                                                    alt={`Preview ${
                                                                        index +
                                                                        1
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
                                                    {previewPhotos.length <
                                                        5 && (
                                                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-800">
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                multiple
                                                                onChange={
                                                                    handleFileUpload
                                                                }
                                                                ref={
                                                                    fileInputRef
                                                                }
                                                            />
                                                            <FaPlus className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                                            <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                                Tambah Foto
                                                            </span>
                                                        </label>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {photos.length > 0 && (
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {photos.length} foto
                                                    terpilih ({photos.length}/5)
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPhotos([]);
                                                        setPreviewPhotos([]);
                                                        if (
                                                            fileInputRef.current
                                                        )
                                                            fileInputRef.current.value =
                                                                "";
                                                    }}
                                                    className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    Hapus Semua
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                                Catatan Tambahan
                                            </h2>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Opsional
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute top-2 left-2">
                                                <FaEdit className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <textarea
                                                value={data.catatan}
                                                onChange={(e) =>
                                                    setData(
                                                        "catatan",
                                                        e.target.value
                                                    )
                                                }
                                                rows="3"
                                                className="block w-full pl-8 pr-3 py-2.5 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition-colors text-base"
                                                placeholder="Tambahkan catatan jika diperlukan..."
                                            />
                                        </div>
                                        {errors.catatan && (
                                            <div className="text-red-500 text-xs mt-1">
                                                {errors.catatan}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.visit(route("trips.index"))
                                    }
                                    className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || isSubmitting}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center space-x-2 text-sm"
                                >
                                    {processing || isSubmitting ? (
                                        <>
                                            <FaSpinner className="animate-spin w-4 h-4" />
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
                </div>
            </DashboardLayout>
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
