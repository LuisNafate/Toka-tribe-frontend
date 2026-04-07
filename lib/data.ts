import type { LucideIcon } from "lucide-react";
import {
  Award,
  Banknote,
  BarChart3,
  Gamepad2,
  Gem,
  Home,
  Medal,
  ShieldCheck,
  SquareActivity,
  Trophy,
  Users,
} from "lucide-react";

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

export const tribeStats = [
  { label: "Racha", value: "3 días" },
  { label: "Retos activos", value: "2/4" },
  { label: "Posición", value: "#4" },
];

export const leaderboardRows = [
  { rank: 1, name: "Solar Club", score: "2,340", tone: "gold" },
  { rank: 2, name: "Delta Crew", score: "2,280", tone: "silver" },
  { rank: 4, name: "Axo Squad (Tú)", score: "2,140", tone: "highlight", chip: "Zona de ascenso" },
  { rank: 5, name: "Orbit Team", score: "2,080", tone: "muted" },
];

export const challengeCards = [
  {
    title: "Trivia Express",
    description: "Mental agility",
    points: "+40 pts",
    icon: Trophy,
  },
  {
    title: "Reflejos Tribe",
    description: "Action game",
    points: "+25 pts",
    icon: SquareActivity,
  },
  {
    title: "Reto Premium",
    description: "High stakes",
    points: "+80 pts",
    icon: Gem,
    dark: true,
  },
];

export const rewardCards = [
  {
    title: "$50 en saldo Toka",
    description: "Recompensa disponible por racha.",
    status: "Disponible ahora",
  },
  {
    title: "Skin tribal",
    description: "Desbloquea una identidad visual premium para tu equipo.",
    status: "Próxima recompensa",
  },
  {
    title: "Cupón del ecosistema",
    description: "Beneficios reales dentro de Toka y marcas aliadas.",
    status: "Canjeable",
  },
];

export const activityItems = [
  { title: "Racha activa", value: "3 días" },
  { title: "Retos completados", value: "2/4" },
  { title: "Bonus semanal", value: "+85 pts hoy" },
];

export const profileHighlights = [
  { title: "Nivel de Tribe", value: "Plata" },
  { title: "Puntos acumulados", value: "1,480 pts" },
  { title: "Racha personal", value: "3 días" },
];

export const seasonMilestones = [
  { label: "Lun", height: 38 },
  { label: "Mar", height: 58 },
  { label: "Mié", height: 86, active: true },
  { label: "Jue", height: 48 },
  { label: "Vie", height: 68 },
  { label: "Sáb", height: 30 },
  { label: "Dom", height: 78 },
];

export const settingsItems = [
  { title: "Privacidad", description: "Controla el uso de tu perfil, actividad y visibilidad." },
  { title: "Notificaciones", description: "Ajusta avisos de retos, rachas y cierre de temporada." },
  { title: "Soporte", description: "Resuelve dudas de wallet, acceso y recompensa." },
  { title: "Términos", description: "Consulta las reglas del ecosistema y lineamientos del juego." },
];
