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
export const FIGMA_ASSETS = {
  // Landing Mobile & Desktop
  landing: {
    hero: "/images/ajolotes_1.png",
    background: "/images/Background_azul.png",
    playIcon: "http://localhost:3845/assets/4809826f163ef1bb59e982553d6f6179d2d22541.svg",
    teamIcon: "http://localhost:3845/assets/e2c20a5240252560bd355876e07efa8bfadcbbc7.svg",
    rewardIcon: "http://localhost:3845/assets/4878926560b244bce4461799d083356583efd18d.svg",
    settingsIcon: "http://localhost:3845/assets/c1dcc8206a80d6544ed04e6695f2de252afe1cb4.svg",
  },
  
  // Dashboard
  dashboard: {
    tokaLogo: "http://localhost:3845/assets/eb1e1e7df37a458100c36c9233d0485d4d2b7b2c.png",
    userPic: "http://localhost:3845/assets/4a0b3e93295344e8697b24a0b33ae93732fa95f1.png",
    navHomeIcon: "http://localhost:3845/assets/e2cb945bacadd3dba9fb65120d33a82e3841e792.svg",
    navTribeIcon: "http://localhost:3845/assets/b6d44f617c2cc12f03face7ca9bef29faf18545e.svg",
    navLeaderIcon: "http://localhost:3845/assets/12d42b0a70a722cb2e6125257993d3c0a9b9e9e1.svg",
    navRetosIcon: "http://localhost:3845/assets/db78caa2c5a8305a88202b2820f4c60cdd9043d3.svg",
    navRewardsIcon: "http://localhost:3845/assets/7d213925e7814bd0d2308827bd843ab1129d6dab.svg",
    navProfileIcon: "http://localhost:3845/assets/37d73412cf9f8d7a5b8b12278d762b805f14d230.svg",
  },
  
  // Tribes Explorer
  explorador: {
    tribePhotos: [
      "http://localhost:3845/assets/c5a1529dc3d3f794cf36cf54574bb20dbb09ba78.png", // Jaguares
      "http://localhost:3845/assets/1e6a36f4ffc3972ae9db117842f6a9b00f02dfbb.png", // Serpientes
      "http://localhost:3845/assets/3698294e97884779bdc01c81180a07cbc32d53ea.png", // Águilas
      "http://localhost:3845/assets/d02d74e13792904b10aea02ecaac3e856c0aa92c.png", // Pumas
      "http://localhost:3845/assets/1a03b4249d747e06214043db23d5b26f5f98814a.png", // Osos
      "http://localhost:3845/assets/dd5b185d914fa22e0e7dec5bd18a8bd5c3b6f6f6.png", // Leones
    ],
  },
  
  // Alias de compatibilidad para vistas UI reutilizadas
  heroImage: "http://localhost:3845/assets/5472da31c82a2fa3019d5f1f16ee3cef28ff3950.png",
  heroBackground: "http://localhost:3845/assets/0dd1e1027c794c131365f6a2e5950a975f62a72e.png",
  playIcon: "http://localhost:3845/assets/4809826f163ef1bb59e982553d6f6179d2d22541.svg",
  teamIcon: "http://localhost:3845/assets/e2c20a5240252560bd355876e07efa8bfadcbbc7.svg",
  rewardIcon: "http://localhost:3845/assets/4878926560b244bce4461799d083356583efd18d.svg",
  settingsIcon: "http://localhost:3845/assets/c1dcc8206a80d6544ed04e6695f2de252afe1cb4.svg",
  tokaLogo: "http://localhost:3845/assets/eb1e1e7df37a458100c36c9233d0485d4d2b7b2c.png",
  andreaPic: "http://localhost:3845/assets/4a0b3e93295344e8697b24a0b33ae93732fa95f1.png",
  navHomeIcon: "http://localhost:3845/assets/e2cb945bacadd3dba9fb65120d33a82e3841e792.svg",
  navTribeIcon: "http://localhost:3845/assets/b6d44f617c2cc12f03face7ca9bef29faf18545e.svg",
  navLeaderIcon: "http://localhost:3845/assets/12d42b0a70a722cb2e6125257993d3c0a9b9e9e1.svg",
  navRetosIcon: "http://localhost:3845/assets/db78caa2c5a8305a88202b2820f4c60cdd9043d3.svg",
  navRewardsIcon: "http://localhost:3845/assets/7d213925e7814bd0d2308827bd843ab1129d6dab.svg",
  navProfileIcon: "http://localhost:3845/assets/37d73412cf9f8d7a5b8b12278d762b805f14d230.svg",
  atlasAvatar: "http://localhost:3845/assets/c5a1529dc3d3f794cf36cf54574bb20dbb09ba78.png",
  apolloAvatar: "http://localhost:3845/assets/1e6a36f4ffc3972ae9db117842f6a9b00f02dfbb.png",
  phoenixAvatar: "http://localhost:3845/assets/3698294e97884779bdc01c81180a07cbc32d53ea.png",
  zenAvatar: "http://localhost:3845/assets/d02d74e13792904b10aea02ecaac3e856c0aa92c.png",
  vortexAvatar: "http://localhost:3845/assets/1a03b4249d747e06214043db23d5b26f5f98814a.png",
  nexusAvatar: "http://localhost:3845/assets/dd5b185d914fa22e0e7dec5bd18a8bd5c3b6f6f6.png",
  voidAvatar: "http://localhost:3845/assets/339b32c23261ca4d6bee3f2fbd560b8fc7ba98a3.png",
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
