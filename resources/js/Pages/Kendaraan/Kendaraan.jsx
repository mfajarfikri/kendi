import React, { useState, Fragment } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import { Dialog, Transition } from "@headlessui/react";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaChevronLeft,
    FaChevronRight,
    FaCar,
    FaSearch,
    FaEllipsisV,
    FaExclamation,
    FaInbox,
    FaInfo,
    FaTachometerAlt,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Menu } from "@headlessui/react";

export default function Kendaraan({ kendaraans }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedKendaraan, setSelectedKendaraan] = useState(null);
    const [formData, setFormData] = useState({
        plat_kendaraan: "",
        merek: "",
        km_awal: "",
        status: "Tersedia",
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filteredKendaraans = Array.isArray(kendaraans)
        ? kendaraans.filter(
              (kendaraan) =>
                  kendaraan?.merek
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                  kendaraan?.plat_kendaraan
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                  kendaraan?.status
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()),
          )
        : [];

    const totalPages = Math.ceil(filteredKendaraans.length / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredKendaraans.slice(
        indexOfFirstItem,
        indexOfLastItem,
    );

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

    const totalKendaraan = kendaraans.length;

    const handleSubmit = (e) => {
        e.preventDefault();

        // Buat FormData object untuk menangani upload file
        const formDataToSend = new FormData();
        formDataToSend.append("plat_kendaraan", formData.plat_kendaraan);
        formDataToSend.append("merek", formData.merek);
        formDataToSend.append("km", formData.km_awal); // Sesuaikan dengan kolom di database
        formDataToSend.append("status", formData.status);

        if (formData.foto) {
            formDataToSend.append("foto", formData.foto);
        }

        if (isEdit) {
            router.post(
                `/kendaraan/${selectedKendaraan.id}`,
                {
                    _method: "PUT",
                    ...Object.fromEntries(formDataToSend),
                },
                {
                    onSuccess: () => {
                        toast.success("Kendaraan berhasil diperbarui", {
                            position: "top-right",
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        });
                    },
                    onError: (errors) => {
                        toast.error("Gagal memperbarui kendaraan", {
                            position: "top-right",
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        });
                        console.error(errors);
                    },
                },
            );
        } else {
            router.post("/kendaraan", formDataToSend, {
                onSuccess: () => {
                    toast.success("Kendaraan berhasil ditambahkan", {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                },
                onError: (errors) => {
                    toast.error("Gagal menambahkan kendaraan", {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    console.error(errors);
                },
            });
        }

        closeModal();
    };

    const handleDelete = (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus kendaraan ini?")) {
            router.delete(`/kendaraan/${id}`, {
                onSuccess: () => {
                    toast.success("Kendaraan berhasil dihapus", {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                },
                onError: () => {
                    toast.error("Gagal menghapus kendaraan", {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                },
            });
        }
    };

    const openModal = (kendaraan = null) => {
        if (kendaraan) {
            setIsEdit(true);
            setSelectedKendaraan(kendaraan);
            setFormData({
                plat_kendaraan: kendaraan.plat_kendaraan,
                merek: kendaraan.merek,
                km_awal: kendaraan.km, // Sesuaikan dengan kolom di database
                status: kendaraan.status,
            });
            setPreviewUrl(kendaraan.image);
        } else {
            setIsEdit(false);
            setSelectedKendaraan(null);
            setFormData({
                plat_kendaraan: "",
                merek: "",
                km_awal: "",
                status: "Tersedia",
            });
            setPreviewUrl(null);
        }
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setFormData({
            plat_kendaraan: "",
            merek: "",
            km_awal: "",
            status: "Tersedia",
        });
        setPreviewUrl(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, foto: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    return (
        <>
            <Head title="Kendaraan" />
            <DashboardLayout>
                <div className="py-0">
                    <div className="mb-4 text-white">
                        <h1 className="text-3xl font-bold mb-2 text-gray-500 dark:text-gray-400">
                            Pengelolaan Kendaraan
                        </h1>
                        <p className="opacity-90 text-gray-700 dark:text-gray-500">
                            Data kendaraan wilayah UPT Karawang
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:scale-105">
                            <div className="flex items-center space-x-4">
                                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                                    <FaCar className="text-blue-500 dark:text-blue-400 text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-gray-500 dark:text-gray-400 text-sm">
                                        Total Kendaraan
                                    </h3>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                        {totalKendaraan}
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
                                        placeholder="Cari kendaraan..."
                                        className="w-full md:w-80 pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                </div>
                                <div className="flex flex-col md:flex-row items-center gap-4">
                                    <button
                                        onClick={() => openModal()}
                                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                                    >
                                        <FaPlus className="text-lg" />
                                        <span>Tambah Kendaraan</span>
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
                                                Plat Nomor
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Merek
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                KM
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
                                            (kendaraan, index) => (
                                                <tr
                                                    key={kendaraan.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {indexOfFirstItem +
                                                            index +
                                                            1}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {
                                                            kendaraan.plat_kendaraan
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {kendaraan.merek}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {new Intl.NumberFormat(
                                                            "id-ID",
                                                        ).format(kendaraan.km)}
                                                        {" KM"}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-md ${
                                                                kendaraan.status ===
                                                                "Tersedia"
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                    : kendaraan.status ===
                                                                        "Digunakan"
                                                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                            }`}
                                                        >
                                                            {kendaraan.status}
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
                                                                as={Fragment}
                                                                enter="transition ease-out duration-100"
                                                                enterFrom="transform opacity-0 scale-95"
                                                                enterTo="transform opacity-100 scale-100"
                                                                leave="transition ease-in duration-75"
                                                                leaveFrom="transform opacity-100 scale-100"
                                                                leaveTo="transform opacity-0 scale-95"
                                                            >
                                                                <Menu.Items
                                                                    anchor="bottom end"
                                                                    className="w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700 [--anchor-gap:8px]"
                                                                >
                                                                    <div className="py-1">
                                                                        <Menu.Item>
                                                                            {({
                                                                                active,
                                                                            }) => (
                                                                                <button
                                                                                    onClick={() =>
                                                                                        openModal(
                                                                                            kendaraan,
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
                                                                                        handleDelete(
                                                                                            kendaraan.id,
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
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>

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
                                        filteredKendaraans.length,
                                    )}
                                </span>
                                of{" "}
                                <span className="font-medium mx-1">
                                    {filteredKendaraans.length}
                                </span>{" "}
                                entries
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                        currentPage === 1
                                            ? "text-gray-400 cursor-not-allowed"
                                            : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    } transition-colors duration-200`}
                                >
                                    <FaChevronLeft className="w-4 h-4" />
                                </button>

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
                                                            currentPage === page
                                                                ? "bg-blue-500 text-white"
                                                                : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        } transition-colors duration-200`}
                                                    >
                                                        {page}
                                                    </button>
                                                )}
                                            </React.Fragment>
                                        ),
                                    )}
                                </div>

                                <button
                                    onClick={() => paginate(currentPage + 1)}
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

                <Transition appear show={isOpen} as={Fragment}>
                    <Dialog
                        as="div"
                        className="relative z-50"
                        onClose={closeModal}
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
                            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm dark:bg-gray-900/80" />
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
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
                                        >
                                            {isEdit
                                                ? "Edit Kendaraan"
                                                : "Tambah Kendaraan Baru"}
                                        </Dialog.Title>

                                        <form
                                            onSubmit={handleSubmit}
                                            className="space-y-4"
                                        >
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Plat Kendaraan
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <FaCar className="text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={
                                                            formData.plat_kendaraan
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                plat_kendaraan:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="mt-1 pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                                        required
                                                        placeholder="Plat Kendaraan"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Merek
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <FaInfo className="text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={formData.merek}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                merek: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="mt-1 pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                                        required
                                                        placeholder="Merek kendaraan"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Kilometer
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <FaTachometerAlt className="text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="number"
                                                        value={formData.km_awal}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                km_awal:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="mt-1 pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                                        required
                                                        placeholder="Kilometer"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Status
                                                </label>
                                                <select
                                                    value={formData.status}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            status: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                                >
                                                    <option value="Tersedia">
                                                        Tersedia
                                                    </option>
                                                    <option value="Digunakan">
                                                        Digunakan
                                                    </option>
                                                    <option value="Dalam Perawatan">
                                                        Dalam Perawatan
                                                    </option>
                                                </select>
                                            </div>

                                            <div className="mt-6 flex justify-end space-x-3">
                                                <button
                                                    type="button"
                                                    className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
                                                    onClick={closeModal}
                                                >
                                                    Batal
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="inline-flex justify-center rounded-md border border-transparent bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
                                                >
                                                    {isEdit
                                                        ? "Simpan Perubahan"
                                                        : "Tambah Kendaraan"}
                                                </button>
                                            </div>
                                        </form>
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
