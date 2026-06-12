import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";

vi.mock("@/Layouts/DashboardLayout", () => ({
    default: ({ children }) => children,
}));

vi.mock("@inertiajs/react", async () => {
    const React = (await import("react")).default;
    return {
        Head: () => null,
        Link: ({ href, children, ...props }) =>
            React.createElement("a", { href, ...props }, children),
        router: {
            post: vi.fn(),
            get: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
        },
    };
});

import DetailTrip from "../Pages/Kendaraan/DetailTrip.jsx";

describe("DetailTrip Edit Feature", () => {
    beforeAll(() => {
        global.route = (name) => `/${String(name).replace(/\./g, "/")}`;
    });

    const trip = {
        code_trip: "TEST12345",
        km_awal: 1000,
        km_akhir: 1200,
        jarak: 200,
        tujuan: "GI Kosambi Baru",
        waktu_keberangkatan: "2025-12-02T08:00",
        waktu_kembali: "2025-12-02T10:00",
        foto_berangkat: JSON.stringify([]),
        foto_kembali: JSON.stringify([]),
        kendaraan: { id: 1, plat_kendaraan: "B 1234 CD", merek: "Toyota" },
        driver: { id: 1, name: "Andi", phone_number: "08123456789" },
    };
    const auth = { user: { role: "admin" } };
    const allVehicles = [
        { id: 1, plat_kendaraan: "B 1234 CD", merek: "Toyota" },
        { id: 2, plat_kendaraan: "D 5678 EF", merek: "Honda" },
    ];
    const allDrivers = [
        { id: 1, name: "Andi", phone_number: "08123456789" },
        { id: 2, name: "Budi", phone_number: "08129876543" },
    ];

    test("opens edit panel and shows driver combobox", async () => {
        render(
            <DetailTrip
                trip={trip}
                auth={auth}
                allVehicles={allVehicles}
                allDrivers={allDrivers}
            />,
        );
        const editBtn = screen.getByRole("button", { name: /Edit Trip/i });
        fireEvent.click(editBtn);
        const driverInput = await screen.findByPlaceholderText(
            /Cari atau pilih driver/i,
        );
        expect(driverInput).toBeTruthy();
    });

    test("autosave draft to localStorage when edit data changes", async () => {
        vi.useFakeTimers();
        render(
            <DetailTrip
                trip={trip}
                auth={auth}
                allVehicles={allVehicles}
                allDrivers={allDrivers}
            />,
        );
        const editBtn = screen.getByRole("button", { name: /Edit Trip/i });
        fireEvent.click(editBtn);
        const catatanInput = document.querySelector('textarea[name="catatan"]');
        expect(catatanInput).toBeTruthy();
        await act(async () => {
            fireEvent.change(catatanInput, {
                target: { value: "Catatan uji" },
            });
        });
        await act(async () => {
            vi.advanceTimersByTime(700);
        });
        await act(async () => {});
        const raw = localStorage.getItem(`trip:${trip.code_trip}:editDraft`);
        const draft = JSON.parse(raw);
        expect(draft.catatan).toBe("Catatan uji");
        vi.useRealTimers();
    });
});
