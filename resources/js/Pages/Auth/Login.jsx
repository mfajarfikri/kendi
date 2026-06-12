import ApplicationLogo from "@/Components/ApplicationLogo";
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

export default function Login({ status, canResetPassword, oauthProviders = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const [touched, setTouched] = useState({ email: false, password: false });
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const clientErrors = useMemo(() => {
        const next = {};

        const email = String(data.email || "").trim();
        if (!email) {
            next.email = "Email wajib diisi.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            next.email = "Format email tidak valid.";
        }

        const password = String(data.password || "");
        if (!password) {
            next.password = "Password wajib diisi.";
        } else if (password.length < 6) {
            next.password = "Password minimal 6 karakter.";
        }

        return next;
    }, [data.email, data.password]);

    const showEmailError =
        (touched.email || submitAttempted) &&
        (clientErrors.email || errors.email);
    const showPasswordError =
        (touched.password || submitAttempted) &&
        (clientErrors.password || errors.password);

    const submit = (e) => {
        e.preventDefault();
        setSubmitAttempted(true);

        if (clientErrors.email || clientErrors.password) {
            toast.error("Periksa kembali email dan password Anda.", {
                position: "top-right",
                duration: 2500,
                style: {
                    background: "#EF4444",
                    color: "#fff",
                },
            });
            return;
        }

        post(route("login"), {
            onSuccess: () => {
                toast.success("Login berhasil!", {
                    position: "top-right",
                    duration: 3000,
                    style: {
                        background: "#22C55E",
                        color: "#fff",
                    },
                });
            },
            onFinish: () => reset("password"),
            onError: (errors) => {
                if (errors.email || errors.password) {
                    toast.error("Email atau password salah", {
                        position: "top-right",
                        duration: 3000,
                        style: {
                            background: "#EF4444",
                            color: "#fff",
                        },
                    });
                }
            },
        });
    };

    return (
        <>
            <Head title="Login" />
            <Toaster position="top-right" />

            <a
                href="#form-login"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-blue-700 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                Lewati ke form login
            </a>

            <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
                <div
                    className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1000px_500px_at_50%_0%,rgba(37,99,235,0.18),transparent_65%),radial-gradient(800px_400px_at_10%_20%,rgba(99,102,241,0.14),transparent_60%),radial-gradient(700px_350px_at_90%_25%,rgba(14,165,233,0.12),transparent_55%)]"
                    aria-hidden="true"
                />

                <div className="mx-auto flex min-h-screen max-w-7xl items-stretch px-4 py-10 sm:px-6 lg:px-8">
                    <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
                        <div className="lg:col-span-6">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950"
                                aria-label="Kembali ke beranda"
                            >
                                <ApplicationLogo className="h-10 w-auto" />
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                    Kendaraan Dinas PLN
                                </span>
                            </Link>

                            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                                Masuk untuk mengakses sistem
                            </h1>
                            <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
                                Gunakan akun yang terdaftar. Aktivitas dan
                                perubahan data dicatat untuk menjaga integritas
                                operasional.
                            </p>

                            <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Aman
                                    </dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                        Kontrol akses & audit trail
                                    </dd>
                                </div>
                                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Cepat
                                    </dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                        Akses modul trip & armada
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <div className="lg:col-span-6">
                            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                            Login
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                            Masukkan email dan password Anda.
                                        </p>
                                    </div>
                                </div>

                                {status && (
                                    <div
                                        className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300"
                                        role="status"
                                    >
                                        {status}
                                    </div>
                                )}

                                <form
                                    id="form-login"
                                    onSubmit={submit}
                                    className="mt-6 space-y-5"
                                    noValidate
                                >
                                    <div>
                                        <InputLabel
                                            htmlFor="email"
                                            value="Email"
                                            className="text-gray-900 dark:text-white"
                                        />

                                        <TextInput
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="mt-1 block w-full rounded-xl border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                                            autoComplete="username"
                                            inputMode="email"
                                            autoCorrect="off"
                                            autoCapitalize="none"
                                            spellCheck={false}
                                            isFocused={true}
                                            aria-invalid={
                                                showEmailError
                                                    ? "true"
                                                    : "false"
                                            }
                                            onBlur={() =>
                                                setTouched((p) => ({
                                                    ...p,
                                                    email: true,
                                                }))
                                            }
                                            onChange={(e) => {
                                                setData(
                                                    "email",
                                                    e.target.value,
                                                );
                                                if (!touched.email) {
                                                    setTouched((p) => ({
                                                        ...p,
                                                        email: true,
                                                    }));
                                                }
                                            }}
                                        />

                                        {(touched.email || submitAttempted) &&
                                            clientErrors.email && (
                                                <InputError
                                                    message={clientErrors.email}
                                                    className="mt-2"
                                                />
                                            )}
                                        <InputError
                                            message={errors.email}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel
                                            htmlFor="password"
                                            value="Password"
                                            className="text-gray-900 dark:text-white"
                                        />

                                        <div className="relative mt-1">
                                            <TextInput
                                                id="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="password"
                                                value={data.password}
                                                className="block w-full rounded-xl border-gray-300 bg-white pr-24 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                                                autoComplete="current-password"
                                                aria-invalid={
                                                    showPasswordError
                                                        ? "true"
                                                        : "false"
                                                }
                                                onBlur={() =>
                                                    setTouched((p) => ({
                                                        ...p,
                                                        password: true,
                                                    }))
                                                }
                                                onChange={(e) => {
                                                    setData(
                                                        "password",
                                                        e.target.value,
                                                    );
                                                    if (!touched.password) {
                                                        setTouched((p) => ({
                                                            ...p,
                                                            password: true,
                                                        }));
                                                    }
                                                }}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword((v) => !v)
                                                }
                                                className="absolute inset-y-0 right-2 my-1 inline-flex items-center rounded-lg px-3 text-xs font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200 dark:hover:bg-gray-700"
                                                aria-pressed={showPassword}
                                                aria-label={
                                                    showPassword
                                                        ? "Sembunyikan password"
                                                        : "Tampilkan password"
                                                }
                                            >
                                                {showPassword
                                                    ? "Sembunyikan"
                                                    : "Tampilkan"}
                                            </button>
                                        </div>

                                        {(touched.password ||
                                            submitAttempted) &&
                                            clientErrors.password && (
                                                <InputError
                                                    message={
                                                        clientErrors.password
                                                    }
                                                    className="mt-2"
                                                />
                                            )}
                                        <InputError
                                            message={errors.password}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <label className="flex items-center">
                                            <Checkbox
                                                name="remember"
                                                checked={data.remember}
                                                onChange={(e) =>
                                                    setData(
                                                        "remember",
                                                        e.target.checked,
                                                    )
                                                }
                                                className="h-5 w-5 rounded-md border-2 border-gray-300 text-blue-600 transition-colors duration-200 ease-in-out hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:text-blue-400 dark:focus:ring-offset-gray-900"
                                            />
                                            <span className="ms-2 text-sm text-gray-700 dark:text-gray-300">
                                                Ingat saya
                                            </span>
                                        </label>

                                        {canResetPassword && (
                                            <Link
                                                href={route("password.request")}
                                                className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                Lupa password?
                                            </Link>
                                        )}
                                    </div>

                                    <PrimaryButton
                                        className="w-full justify-center rounded-xl py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
                                        disabled={processing}
                                    >
                                        {processing ? "Memproses..." : "Masuk"}
                                    </PrimaryButton>

                                    {oauthProviders.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                    Atau masuk dengan
                                                </div>
                                                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                {oauthProviders.map((p) => (
                                                    <Link
                                                        key={p.href}
                                                        href={p.href}
                                                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
                                                    >
                                                        {p.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                                        Pastikan Anda tidak membagikan password
                                        kepada siapa pun.
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
