import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.33.208", // твой локальный клиент
    "localhost",      // стандартный доступ
    "127.0.0.1"       // запасной
  ],
};

export default nextConfig;
