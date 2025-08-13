import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import ThemeProvider from "../components/layout/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });
const notoSansKr = localFont({
  src: [
    { path: "../assets/fonts/NotoSansKR-VariableFont_wght.ttf", weight: "100 900", style: "normal" },
  ],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BeMore - AI 감정 분석 및 CBT 피드백",
  description: "멀티모달 감정 분석을 통한 개인화된 CBT 피드백 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* MediaPipe 라이브러리: 전역 주입 제거 (필요 페이지에서 지연 로드) */}
      </head>
      <body className={`${inter.className} ${notoSansKr.variable}`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
