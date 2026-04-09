"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { TokaLoginButton } from "@/components/toka-login-button";
import { getSessionToken } from "@/services/auth.service";

export function LandingAccessPopup() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = getSessionToken();

    if (token) {
      router.replace("/dashboard");
      return;
    }

    setIsReady(true);
  }, [router]);

  if (!isReady) {
    return (
      <main className="landing-gate landing-gate--checking">
        <section className="landing-gate__modal" aria-label="Verificando sesión">
          <div className="landing-gate__badge">
            <Sparkles size={14} />
            <span>Acceso seguro</span>
          </div>
          <h1>Verificando tu sesión Toka</h1>
          <p>Estamos comprobando si ya tienes acceso activo.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="landing-gate">
      <div className="landing-gate__glow landing-gate__glow--one" aria-hidden="true" />
      <div className="landing-gate__glow landing-gate__glow--two" aria-hidden="true" />
      <div className="landing-gate__glow landing-gate__glow--three" aria-hidden="true" />

      <section className="landing-gate__modal" role="dialog" aria-modal="true" aria-labelledby="landing-gate-title" aria-describedby="landing-gate-desc">
        <div className="landing-gate__badge">
          <Sparkles size={14} />
          <span>Aviso de acceso</span>
        </div>

        <div className="landing-gate__copy">
          <h1 id="landing-gate-title">TokaTribe se abre con tu sesión Toka</h1>
          <p id="landing-gate-desc">
            El acceso se intentará automáticamente al cargar. Si el puente no responde, usa el botón para iniciar manualmente.
          </p>
        </div>

        <div className="landing-gate__chips" aria-label="Beneficios del acceso">
          <span><ShieldCheck size={14} /> Sin registros extra</span>
          <span><ShieldCheck size={14} /> Sesión segura</span>
          <span><ShieldCheck size={14} /> Auto inicio</span>
        </div>

        <TokaLoginButton autoStart className="landing-gate__button">
          Iniciar sesión con Toka
        </TokaLoginButton>

        <p className="landing-gate__hint">
          Si la sesión ya existe, te llevaremos directo al tablero.
          <ArrowRight size={14} />
        </p>
      </section>
    </main>
  );
}