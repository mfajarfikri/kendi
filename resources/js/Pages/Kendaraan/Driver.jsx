import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import { useState, useEffect, Fragment } from "react";
import { router } from "@inertiajs/react";
import { Dialog, Transition } from "@headlessui/react";
import {
    FaEdit,
    FaTrash,
    FaUserPlus,
    FaUser,
    FaSearch,
    FaChevronLeft,
    FaChevronRight,
    FaEllipsisH,
    FaEllipsisV,
    FaPhone,
    FaCheck,
    FaExclamationTriangle,
    FaTimes,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Menu } from "@headlessui/react";

export default function Driver({ drivers: initialDrivers }) {
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [data, setData] = useState({
        id: "",
        name: "",
        phone_number: "",
        status: "Tersedia",
    });
    const [errors, setErrors] = useState({});
    const [drivers, setDrivers] = useState(initialDrivers);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [driverToDelete, setDriverToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Konfigurasi toast
    const toastConfig = {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);
        let isMounted = true;

        if (isEdit) {
            router.put(`/driver/${data.id}`, data, {
                onSuccess: () => {
                    if (!isMounted) return;

                    // Update data lokal setelah berhasil edit
                    setDrivers((prevDrivers) =>
                        prevDrivers.map((driver) =>
                            driver.id === data.id
                                ? { ...driver, ...data }
                                : driver
                        )
                    );

                    setShowModal(false);
                    setIsEdit(false);
                    setData({
                        id: "",
                        name: "",
                        phone_number: "",
                        status: "Tersedia",
                    });
                    toast.success("Data berhasil diperbarui", toastConfig);
                },
                onError: (errors) => {
                    if (!isMounted) return;
                    setErrors(errors);
                    toast.error("Gagal memperbarui data", toastConfig);
                },
                onFinish: () => {
                    if (!isMounted) return;
                    setIsSubmitting(false);
                },
            });
        } else {
            router.post("/driver", data, {
                onSuccess: (response) => {
                    if (!isMounted) return;

                    // Gunakan callback untuk update state
                    router.reload();
                    setShowModal(false);
                    setData({
                        id: "",
                        name: "",
                        phone_number: "",
                        status: "Tersedia",
                    });
                    toast.success("Data berhasil ditambahkan", toastConfig);
                },
                onError: (errors) => {
                    if (!isMounted) return;
                    setErrors(errors);
                    toast.error("Gagal menambahkan data", toastConfig);
                },
                onFinish: () => {
                    if (!isMounted) return;
                    setIsSubmitting(false);
                },
            });
        }

        // Cleanup function
        return () => {
            isMounted = false;
        };
    };

    const handleEdit = (driver) => {
        setIsEdit(true);
        setData({
            id: driver.id,
            name: driver.name,
            phone_number: driver.phone_number,
            status: driver.status,
        });
        setShowModal(true);
    };

    const confirmDelete = (driver) => {
        setDriverToDelete(driver);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        if (!driverToDelete) return;

        setIsDeleting(true);
        let isMounted = true;

        router.delete(`/driver/${driverToDelete.id}`, {
            onSuccess: () => {
                if (!isMounted) return;

                // Gunakan callback untuk update state
                router.reload();
                setShowDeleteModal(false);
                setDriverToDelete(null);
                toast.success("Data berhasil dihapus", toastConfig);
            },
            onError: () => {
                if (!isMounted) return;
                toast.error("Gagal menghapus data", toastConfig);
            },
            onFinish: () => {
                if (!isMounted) return;
                setIsDeleting(false);
            },
        });

        // Cleanup function
        return () => {
            isMounted = false;
        };
    };

    // Filter data berdasarkan pencarian
    const filteredDrivers = drivers.filter(
        (driver) =>
            driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.phone_number
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            driver.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Hitung total halaman
    const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);

    // Get current items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDrivers.slice(
        indexOfFirstItem,
        indexOfLastItem
    );

    // Fungsi untuk pagination
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Reset halaman saat pencarian
    useEffect(() => {
        if (searchTerm !== "") {
            setCurrentPage(1);
        }
    }, [searchTerm]);

    // Fungsi untuk generate nomor halaman
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

            if (start > 2) pages.push("...");

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 1) pages.push("...");
            if (totalPages > 1) pages.push(totalPages);
        }
        return pages;
    };

    // Hitung statistik driver
    const totalDriver = drivers.length;
    const driverTersedia = drivers.filter(
        (d) => d.status === "Tersedia"
    ).length;
    const driverBertugas = drivers.filter(
        (d) => d.status === "Sedang Bertugas"
    ).length;
    const driverCuti = drivers.filter((d) => d.status === "Cuti").length;

    return (
        <>
            <Head title="Driver" />
            <DashboardLayout>
                <div className="py-0">
                    <div className="w-full mx-auto sm:px-6 lg:px-0">
                        {/* Statistik Card */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:scale-105">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                                        <FaUser className="text-blue-500 dark:text-blue-400 text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-gray-500 dark:text-gray-400 text-sm">
                                            Total Driver
                                        </h3>
                                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                            {totalDriver}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:scale-105">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-full">
                                        <FaUser className="text-emerald-500 dark:text-emerald-400 text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-gray-500 dark:text-gray-400 text-sm">
                                            Driver Tersedia
                                        </h3>
                                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                            {driverTersedia}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:scale-105">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
                                        <FaUser className="text-amber-500 dark:text-amber-400 text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-gray-500 dark:text-gray-400 text-sm">
                                            Driver Bertugas
                                        </h3>
                                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                            {driverBertugas}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:scale-105">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-rose-100 dark:bg-rose-900 p-3 rounded-full">
                                        <FaUser className="text-rose-500 dark:text-rose-400 text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-gray-500 dark:text-gray-400 text-sm">
                                            Tidak Hadir
                                        </h3>
                                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                            {driverCuti}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="relative w-full md:w-auto">
                                        <input
                                            type="text"
                                            placeholder="Cari driver..."
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                        />
                                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                    </div>
                                    <div className="flex flex-col md:flex-row items-center gap-4">
                                        <button
                                            onClick={() => {
                                                setIsEdit(false);
                                                setShowModal(true);
                                                setErrors({});
                                                setData({
                                                    id: "",
                                                    name: "",
                                                    phone_number: "",
                                                    status: "Tersedia",
                                                });
                                            }}
                                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                                        >
                                            <FaUserPlus className="text-lg" />
                                            <span>Tambah Driver</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                {currentItems.length === 0 ? (
                                    <div className="text-center py-10">
                                        <div className="text-gray-500 dark:text-gray-400">
                                            Tidak ada data yang sesuai dengan
                                            pencarian
                                        </div>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700/60">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    No
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Nama
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    No. Telepon
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {currentItems.map(
                                                (driver, index) => (
                                                    <tr
                                                        key={driver.id}
                                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                            {indexOfFirstItem +
                                                                index +
                                                                1}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                            {driver.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                            {
                                                                driver.phone_number
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-md ${
                                                                    driver.status ===
                                                                    "Tersedia"
                                                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                                        : driver.status ===
                                                                          "Sedang Bertugas"
                                                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                                                        : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                                                                }`}
                                                            >
                                                                {driver.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <Menu
                                                                as="div"
                                                                className="relative inline-block text-left"
                                                            >
                                                                <Menu.Button className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-1.5 rounded-lg shadow-sm hover:shadow-md">
                                                                    <FaEllipsisV className="w-4 h-4" />
                                                                </Menu.Button>

                                                                <Transition
                                                                    as={
                                                                        Fragment
                                                                    }
                                                                    enter="transition ease-out duration-100"
                                                                    enterFrom="transform opacity-0 scale-95"
                                                                    enterTo="transform opacity-100 scale-100"
                                                                    leave="transition ease-in duration-75"
                                                                    leaveFrom="transform opacity-100 scale-100"
                                                                    leaveTo="transform opacity-0 scale-95"
                                                                >
                                                                    <Menu.Items
                                                                        anchor="bottom end"
                                                                        className="w-48 z-50 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 focus:outline-none [--anchor-gap:8px]"
                                                                    >
                                                                        <div className="py-1">
                                                                            <Menu.Item>
                                                                                {({
                                                                                    active,
                                                                                }) => (
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleEdit(
                                                                                                driver
                                                                                            )
                                                                                        }
                                                                                        className={`${
                                                                                            active
                                                                                                ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                                                                : "text-gray-700 dark:text-gray-200"
                                                                                        } w-full text-left px-4 py-2 text-sm flex items-center gap-2`}
                                                                                    >
                                                                                        <FaEdit className="text-blue-500" />
                                                                                        <span>
                                                                                            Edit
                                                                                            Driver
                                                                                        </span>
                                                                                    </button>
                                                                                )}
                                                                            </Menu.Item>
                                                                            <Menu.Item>
                                                                                {({
                                                                                    active,
                                                                                }) => (
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            confirmDelete(
                                                                                                driver
                                                                                            )
                                                                                        }
                                                                                        className={`${
                                                                                            active
                                                                                                ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                                                                : "text-gray-700 dark:text-gray-200"
                                                                                        } w-full text-left px-4 py-2 text-sm flex items-center gap-2`}
                                                                                    >
                                                                                        <FaTrash className="text-red-500" />
                                                                                        <span>
                                                                                            Hapus
                                                                                            Driver
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
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    Showing{" "}
                                    <span className="font-medium mx-1">
                                        {indexOfFirstItem + 1}
                                    </span>
                                    to{" "}
                                    <span className="font-medium mx-1">
                                        {Math.min(
                                            indexOfLastItem,
                                            filteredDrivers.length
                                        )}
                                    </span>
                                    of{" "}
                                    <span className="font-medium mx-1">
                                        {filteredDrivers.length}
                                    </span>{" "}
                                    entries
                                </div>

                                <div className="flex items-center space-x-2">
                                    {/* Previous Button */}
                                    <button
                                        onClick={() =>
                                            paginate(currentPage - 1)
                                        }
                                        disabled={currentPage === 1}
                                        className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                            currentPage === 1
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        } transition-colors duration-200`}
                                    >
                                        <FaChevronLeft className="w-4 h-4" />
                                    </button>

                                    {/* Page Numbers */}
                                    <div className="flex items-center space-x-1">
                                        {getPaginationNumbers().map(
                                            (page, index) => (
                                                <React.Fragment key={index}>
                                                    {page === "..." ? (
                                                        <span className="flex items-center justify-center w-10 h-10">
                                                            <FaEllipsisV className="w-4 h-4 text-gray-400" />
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                paginate(page)
                                                            }
                                                            className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                                                currentPage ===
                                                                page
                                                                    ? "bg-blue-500 text-white"
                                                                    : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            } transition-colors duration-200`}
                                                        >
                                                            {page}
                                                        </button>
                                                    )}
                                                </React.Fragment>
                                            )
                                        )}
                                    </div>

                                    {/* Next Button */}
                                    <button
                                        onClick={() =>
                                            paginate(currentPage + 1)
                                        }
                                        disabled={currentPage === totalPages}
                                        className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                            currentPage === totalPages
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        } transition-colors duration-200`}
                                    >
                                        <FaChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Form dengan Headless UI */}
                <Transition appear show={showModal} as={Fragment}>
                    <Dialog
                        as="div"
                        className="relative z-50"
                        onClose={() => setShowModal(false)}
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-gray-500 dark:bg-gray-700 dark:bg-opacity-70 backdrop-blur-sm bg-opacity-70" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4 flex items-center"
                                        >
                                            <FaUserPlus className="mr-2 text-blue-500" />
                                            {isEdit
                                                ? "Edit Driver"
                                                : "Tambah Driver Baru"}
                                        </Dialog.Title>

                                        <form
                                            onSubmit={handleSubmit}
                                            className="space-y-4"
                                        >
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Nama Driver
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <FaUser className="text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={data.name}
                                                        onChange={(e) =>
                                                            setData({
                                                                ...data,
                                                                name: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                                        placeholder="Masukkan nama driver"
                                                        required
                                                    />
                                                </div>
                                                {errors.name && (
                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                        {errors.name}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Nomor Telepon
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <FaPhone className="text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={
                                                            data.phone_number
                                                        }
                                                        onChange={(e) =>
                                                            setData({
                                                                ...data,
                                                                phone_number:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                                        placeholder="Contoh: 081234567890"
                                                        required
                                                    />
                                                </div>
                                                {errors.phone_number && (
                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                        {errors.phone_number}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Status
                                                </label>
                                                <select
                                                    value={data.status}
                                                    onChange={(e) =>
                                                        setData({
                                                            ...data,
                                                            status: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                                    required
                                                >
                                                    <option value="Tersedia">
                                                        Tersedia
                                                    </option>
                                                    <option value="Sedang Bertugas">
                                                        Sedang Bertugas
                                                    </option>
                                                    <option value="Cuti">
                                                        Cuti
                                                    </option>
                                                </select>
                                                {errors.status && (
                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                        {errors.status}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowModal(false);
                                                        setIsEdit(false);
                                                        setErrors({});
                                                        setData({
                                                            id: "",
                                                            name: "",
                                                            phone_number: "",
                                                            status: "Tersedia",
                                                        });
                                                    }}
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                                                >
                                                    Batal
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <svg
                                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <circle
                                                                    className="opacity-25"
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    stroke="currentColor"
                                                                    strokeWidth="4"
                                                                ></circle>
                                                                <path
                                                                    className="opacity-75"
                                                                    fill="currentColor"
                                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                ></path>
                                                            </svg>
                                                            <span>
                                                                Menyimpan...
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaCheck className="mr-2" />
                                                            <span>
                                                                {isEdit
                                                                    ? "Simpan Perubahan"
                                                                    : "Simpan"}
                                                            </span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

                {/* Modal Konfirmasi Hapus */}
                <Transition appear show={showDeleteModal} as={Fragment}>
                    <Dialog
                        as="div"
                        className="relative z-50"
                        onClose={() => setShowDeleteModal(false)}
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-gray-500 backdrop-blur-sm bg-opacity-70" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                                                <FaExclamationTriangle className="text-red-500 dark:text-red-400 text-xl" />
                                            </div>
                                        </div>

                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-center text-gray-900 dark:text-white mb-2"
                                        >
                                            Konfirmasi Hapus
                                        </Dialog.Title>

                                        <div className="mt-2">
                                            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                                                Apakah Anda yakin ingin
                                                menghapus driver{" "}
                                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                    {driverToDelete?.name}
                                                </span>
                                                ?
                                                <br />
                                                Tindakan ini tidak dapat
                                                dibatalkan.
                                            </p>
                                        </div>

                                        <div className="mt-6 flex justify-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowDeleteModal(false)
                                                }
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                                            >
                                                {isDeleting ? (
                                                    <>
                                                        <svg
                                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                            ></path>
                                                        </svg>
                                                        <span>
                                                            Menghapus...
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaTrash className="mr-2" />
                                                        <span>Hapus</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
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
                theme="light"
            />
        </>
    );
}
