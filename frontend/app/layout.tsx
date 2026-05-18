import './globals.css';
import { Rubik } from "next/font/google";
import Header from "@/components/header/Header";
import { CustomToaster } from "@/components/Toaster/CustomToaster";
import { Providers } from "@/components/providers";
import Footer from "@/components/Footer";

const rubik = Rubik({ subsets: ['latin'], variable: '--font-mono' });

function layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${rubik.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full! min-w-full! text-sm">
        <Providers>
          <div className="flex flex-col gap-4 px-6 pb-10 min-h-screen">
            <Header />

            {children}

            <Footer />

            <CustomToaster />
          </div>
        </Providers>
      </body>
    </html>
  )
}

export default layout