"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Gamepad2, Medal, ShieldCheck, Sparkles, Users, X } from "lucide-react";
import { TokaLoginButton } from "@/components/toka-login-button";
import { getSessionToken } from "@/services/auth.service";

export function LandingAccessPopup() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [loginComplete, setLoginComplete] = useState(false);

  useEffect(() => {
    const token = getSessionToken();
    setHasSession(Boolean(token));
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

  function handleContinue() {
    if (getSessionToken() || hasSession || loginComplete) {
      router.push("/dashboard");
      return;
    }

    router.push("/onboarding");
  }

  return (
    <main className="landing-gate">
      <div className="landing-gate__glow landing-gate__glow--one" aria-hidden="true" />
      <div className="landing-gate__glow landing-gate__glow--two" aria-hidden="true" />
      <div className="landing-gate__glow landing-gate__glow--three" aria-hidden="true" />

      <section className="landing-gate__modal" role="dialog" aria-modal="true" aria-labelledby="landing-gate-title" aria-describedby="landing-gate-desc">
        <button
          type="button"
          className="landing-gate__close"
          aria-label="Cerrar aviso"
          onClick={handleContinue}
        >
          <X size={16} />
        </button>

        <div className="landing-gate__header">
          <div className="landing-gate__badge">
            <Sparkles size={14} />
            <span>Qué es TokaTribe</span>
          </div>
          <p className="landing-gate__eyebrow">La liga social del entretenimiento dentro del ecosistema Toka</p>
        </div>

        <div className="landing-gate__copy">
          <h1 id="landing-gate-title">Juega, compite y sube con tu tribe</h1>
          <p id="landing-gate-desc">
            TokaTribe reúne retos, ranking y recompensas en una sola experiencia. El anuncio se queda fijo hasta que lo cierres con la X.
          </p>
        </div>

        <div className="landing-gate__feature-grid" aria-label="Resumen de experiencia">
          <article>
            <div className="landing-gate__feature-icon"><Gamepad2 size={18} /></div>
            <h2>Retos semanales</h2>
            <p>Participa en dinámicas rápidas y gana puntos para tu progreso.</p>
          </article>
          <article>
            <div className="landing-gate__feature-icon"><Users size={18} /></div>
            <h2>Tu tribe importa</h2>
            <p>Compite en equipo, compara avances y escala posiciones con tu grupo.</p>
          </article>
          <article>
            <div className="landing-gate__feature-icon"><Medal size={18} /></div>
            <h2>Recompensas Toka</h2>
            <p>Convierte tu actividad en beneficios dentro del ecosistema.</p>
          </article>
        </div>

        <div className="landing-gate__chips" aria-label="Beneficios del acceso">
          <span><ShieldCheck size={14} /> Sin registros extra</span>
          <span><ShieldCheck size={14} /> Sesión segura</span>
          <span><ShieldCheck size={14} /> Acceso manual</span>
        </div>

        <TokaLoginButton
          className="landing-gate__button"
          onSuccess={() => {
            setLoginComplete(true);
          }}
        >
          Iniciar sesión con Toka
        </TokaLoginButton>

        <p className="landing-gate__hint">
          Cuando cierres con la X, continuas al siguiente paso.
          <ArrowRight size={14} />
        </p>
      </section>
    </main>
  );
}