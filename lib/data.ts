import type { LucideIcon } from "lucide-react";
import {
  Award,
  Banknote,
  BarChart3,
  Gamepad2,
  Home,
  Medal,
  ShieldCheck,
  SquareActivity,
  Trophy,
  Users,
} from "lucide-react";

// ===== FIGMA ASSET CONSTANTS =====
const AVATAR_FALLBACKS = [
  "/images/ajolotes_1.png",
  "/images/ajolote_2.png",
  "/images/ajolote_3.png",
  "/images/ajolote_4.png",
  "/images/mascota.png",
];

export const FIGMA_ASSETS = {
  // Landing Mobile & Desktop
  landing: {
    hero: "/images/ajolotes_1.png",
    background: "/images/Background_azul.png",
    playIcon: "",
    teamIcon: "",
    rewardIcon: "",
    settingsIcon: "",
  },

  // Dashboard
  dashboard: {
    tokaLogo: "",
    userPic: "/images/ajolote_2.png",
    navHomeIcon: "",
    navTribeIcon: "",
    navLeaderIcon: "",
    navRetosIcon: "",
    navRewardsIcon: "",
    navProfileIcon: "",
  },

  // Tribes Explorer
  explorador: {
    tribePhotos: [
      "/images/ajolotes_1.png",
      "/images/ajolote_2.png",
      "/images/ajolote_3.png",
      "/images/ajolote_4.png",
      "/images/mascota.png",
      "/images/ajolote_3.png",
    ],
  },

  // Alias de compatibilidad para vistas UI reutilizadas
  heroImage: "/images/ajolotes_1.png",
  heroBackground: "/images/Background_azul.png",
  playIcon: "",
  teamIcon: "",
  rewardIcon: "",
  settingsIcon: "",
  tokaLogo: "",
  andreaPic: "/images/ajolote_2.png",
  navHomeIcon: "",
  navTribeIcon: "",
  navLeaderIcon: "",
  navRetosIcon: "",
  navRewardsIcon: "",
  navProfileIcon: "",
  atlasAvatar:   AVATAR_FALLBACKS[0],
  apolloAvatar:  AVATAR_FALLBACKS[1],
  phoenixAvatar: AVATAR_FALLBACKS[2],
  zenAvatar:     AVATAR_FALLBACKS[3],
  vortexAvatar:  AVATAR_FALLBACKS[4],
  nexusAvatar:   AVATAR_FALLBACKS[0],
  voidAvatar:    AVATAR_FALLBACKS[1],
};

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/tribe", label: "Mi Tribe", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { href: "/retos", label: "Retos", icon: Gamepad2 },
  { href: "/recompensas", label: "Recompensas", icon: Award },
  { href: "/perfil", label: "Perfil", icon: ShieldCheck },
];

export const featureCards = [
  {
    icon: Users,
    title: "Tu Tribe importa",
    description: "Colabora con otros usuarios para alcanzar objetivos comunes y desbloquear niveles.",
  },
  {
    icon: Medal,
    title: "Todo en una temporada",
    description: "Cada tres meses reiniciamos el ranking con premios exclusivos para los líderes.",
  },
  {
    icon: Banknote,
    title: "Recompensas dentro de Toka",
    description: "Los puntos ganados son canjeables por beneficios reales en todo el ecosistema.",
  },
];

export const settingsItems = [
  { title: "Privacidad", description: "Controla el uso de tu perfil, actividad y visibilidad." },
  { title: "Notificaciones", description: "Ajusta avisos de retos, rachas y cierre de temporada." },
  { title: "Soporte", description: "Resuelve dudas de wallet, acceso y recompensa." },
  { title: "Términos", description: "Consulta las reglas del ecosistema y lineamientos del juego." },
];
