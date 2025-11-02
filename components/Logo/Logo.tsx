import Image from "next/image";

/**
 * Компонент логотипа CentralDispatch
 * Только логотип без текста
 */
export default function Logo() {
  return (
      <Image
        src="/logo-central-dispatch.webp"
        alt="CentralDispatch Logo"
        width={80}
        height={40}
        className="object-contain"
        style={{ height: "40px", width: "auto" }}
      />
  );
}

