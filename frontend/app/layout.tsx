import { Rubik } from "next/font/google";
import './globals.css';
import Header from "@/components/header/header";
import { CustomToaster } from "@/components/Toaster/CustomToaster";
import { Providers } from "@/components/providers";
import Footer from "@/components/Footer";

const rubik = Rubik({subsets:['latin'], variable:'--font-mono'});

function layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${rubik.variable} h-full antialiased`}
      suppressHydrationWarning
    >
        <body className="min-h-full flex flex-col gap-10 px-6 pb-10 text-sm">
          <Providers>
            <Header />

            {children}

            <Footer />
            
            <CustomToaster />
          </Providers>
        </body>
      </html>
  )
}

export default layout