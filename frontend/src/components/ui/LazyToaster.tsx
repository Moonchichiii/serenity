import { lazy, Suspense, useEffect, useState } from "react";

const Toaster = lazy(() =>
    import("react-hot-toast").then((m) => ({ default: m.Toaster })),
);

export function LazyToaster() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const mount = () => {
            cleanup();
            setReady(true);
        };

        const events: Array<keyof WindowEventMap> = ["pointerdown", "scroll", "keydown"];

        events.forEach((e) => window.addEventListener(e, mount, { once: true, passive: true }));

        const fallback = setTimeout(mount, 8_000);

        function cleanup() {
            clearTimeout(fallback);
            events.forEach((e) => window.removeEventListener(e, mount));
        }

        return cleanup;
    }, []);

    if (!ready) return null;

    return (
        <Suspense fallback={null}>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: "#f7f6f4",
                        color: "#2e2e2e",
                        borderRadius: "1rem",
                        boxShadow: "0 4px 20px rgba(46, 46, 46, 0.1)",
                        border: "2px solid #dce5df",
                    },
                    success: {
                        iconTheme: { primary: "#6d9177", secondary: "#f7f6f4" },
                    },
                    error: {
                        iconTheme: { primary: "#e86a47", secondary: "#f7f6f4" },
                    },
                }}
            />
        </Suspense>
    );
}
