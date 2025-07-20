import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-br from-[#181a1b] to-[#232d23] dark:from-[#101112] dark:to-[#232d23]"
      style={{
        backgroundImage: 'url("/images/zryachiy-ritual.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="min-h-screen flex flex-col bg-black/50 dark:bg-black/50">
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <h1
            className="text-3xl md:text-4xl font-bold text-center mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
            style={{
              color: "#bfa94a",
              textShadow: "0 2px 8px #000, 0 0px 1px #bfa94a",
            }}
          >
            Tarkov Hub
          </h1>
          <p className="text-gray-200 text-center mb-10 max-w-xl">
            Seu centro de progresso para{" "}
            <b style={{ color: "#5a6b4a" }}>Hideout</b> e{" "}
            <b style={{ color: "#bfa94a" }}>Kappa</b> no Escape from Tarkov.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
            {/* Hideout Card */}
            <div
              className="bg-transparent border-2 rounded-xl shadow-2xl hover:shadow-green-400/20 transition-shadow duration-300 group flex flex-col min-h-[320px] border-[#5a6b4a] dark:border-[#5a6b4a]"
              style={{ backdropFilter: "blur(4px)" }}
            >
              <div className="flex flex-col flex-1 justify-between h-full p-6">
                <div>
                  <CardHeader className="flex flex-col items-center p-0 mb-4">
                    <img
                      src="/images/Banner_hideout.png"
                      alt="Hideout"
                      width={120}
                      height={120}
                      className="rounded-lg shadow-md border bg-background object-cover mb-2 group-hover:scale-105 transition-transform border-[#5a6b4a]"
                      style={{
                        width: 120,
                        height: 120,
                        borderWidth: 2,
                        borderStyle: "solid",
                      }}
                      loading="lazy"
                    />
                    <CardTitle
                      className="text-center drop-shadow"
                      style={{
                        color: "#5a6b4a",
                        textShadow:
                          "0 1px 3px rgba(0,0,0,0.8), 0 0 1px rgba(128,128,128,0.5)",
                        WebkitTextStroke: "0.5px rgba(128,128,128,0.3)",
                      }}
                    >
                      Hideout
                    </CardTitle>
                    <CardDescription className="text-center text-gray-200">
                      Gerencie o progresso das estações do Hideout, requisitos
                      de itens, traders e skills.
                    </CardDescription>
                  </CardHeader>
                </div>
                <div className="flex justify-center mt-6">
                  <Link href="/hideout" passHref legacyBehavior>
                    <Button
                      asChild
                      size="lg"
                      className="w-40 font-bold border-2 bg-[#5a6b4a] text-white border-[#5a6b4a] dark:bg-[#5a6b4a] dark:text-white dark:border-[#5a6b4a] hover:bg-[#4a5b3a] dark:hover:bg-[#4a5b3a]"
                    >
                      <a>Entrar</a>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            {/* Kappa Card */}
            <div
              className="bg-transparent border-2 rounded-xl shadow-2xl hover:shadow-yellow-400/20 transition-shadow duration-300 group flex flex-col min-h-[320px] border-[#bfa94a] dark:border-[#bfa94a]"
              style={{ backdropFilter: "blur(4px)" }}
            >
              <div className="flex flex-col flex-1 justify-between h-full p-6">
                <div>
                  <CardHeader className="flex flex-col items-center p-0 mb-4">
                    <img
                      src="/images/Secure_container_Kappa_image.gif"
                      alt="Kappa Container"
                      width={200}
                      height={200}
                      className="rounded-lg shadow-md border bg-background object-cover mb-2 group-hover:scale-105 transition-transform border-[#bfa94a]"
                      style={{
                        width: 120,
                        height: 120,
                        borderWidth: 2,
                        borderStyle: "solid",
                      }}
                      loading="lazy"
                    />
                    <CardTitle
                      className="text-center drop-shadow"
                      style={{
                        color: "#bfa94a",
                        textShadow:
                          "0 1px 3px rgba(0,0,0,0.8), 0 0 1px rgba(128,128,128,0.5)",
                        WebkitTextStroke: "0.5px rgba(128,128,128,0.3)",
                      }}
                    >
                      Kappa
                    </CardTitle>
                    <CardDescription className="text-center text-gray-200">
                      Acompanhe todos os itens necessários para conquistar o
                      Container Kappa no Escape from Tarkov.
                    </CardDescription>
                  </CardHeader>
                </div>
                <div className="flex justify-center mt-6">
                  <Link href="/kappa" passHref legacyBehavior>
                    <Button
                      asChild
                      size="lg"
                      className="w-40 font-bold border-2 bg-[#bfa94a] text-[#181a1b] border-[#bfa94a] dark:bg-[#bfa94a] dark:text-[#181a1b] dark:border-[#bfa94a] hover:bg-[#a68c2c] dark:hover:bg-[#a68c2c]"
                    >
                      <a>Entrar</a>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
