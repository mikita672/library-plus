import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function HeaderActionThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <MoonIcon className="w-6 h-6" />;

  const nextTheme = resolvedTheme === "light" ? "dark" : "light";

  return (
    <div
      title={`Switch to ${nextTheme} theme`}
      className="cursor-pointer transition-colors hover:text-gray-400"
      onClick={() => setTheme(nextTheme)}
    >
      {resolvedTheme === "light" ? (
        <MoonIcon className="w-6 h-6" />
      ) : (
        <SunIcon className="w-6 h-6" />
      )}
    </div>
  );
}

export default HeaderActionThemeToggle