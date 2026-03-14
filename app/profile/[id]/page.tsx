"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  ChevronDown,
  Filter,
  Lock,
  Camera,
  Tag,
  MapPin,
  Globe,
  Users,
  Sparkles,
  ArrowLeft,
  Loader2,
  Baby,
  HeartPulse,
  Heart,
  GraduationCap,
  Award,
  Briefcase,
  Cross,
  CalendarDays,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "Facts" | "Hints" | "Gallery" | "LifeStory" | "Explore";

interface ProfileMember {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  dateOfDeath: string | null;
  gender: "MALE" | "FEMALE" | "OTHER";
  photo: string | null;
  bio: string | null;
  familyClan: string | null;
  generation: number | null;
  isAlive: boolean;
  maritalStatus: string;
  bloodGroup: string | null;
  profession: string | null;
}

interface ProfileRelative {
  id: string;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  isAlive: boolean;
  dateOfBirth: string | null;
  dateOfDeath: string | null;
  photo: string | null;
}

interface ProfileLifeEvent {
  id: string;
  type: string;
  date: string;
  description: string | null;
  location: string | null;
  familyMemberId: string;
  createdAt: string;
}

interface SpouseChildGroup {
  spouse: ProfileRelative | null;
  children: ProfileRelative[];
}

interface ProfileData {
  member: ProfileMember;
  parents: ProfileRelative[];
  children: ProfileRelative[];
  spouses: ProfileRelative[];
  siblings: ProfileRelative[];
  spouseChildGroups: SpouseChildGroup[];
  lifeEvents: ProfileLifeEvent[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d: string | null): string {
  if (!d) return "";
  try {
    return format(new Date(d), "d MMM yyyy");
  } catch {
    return "";
  }
}

function yr(d: string | null): number | null {
  if (!d) return null;
  const v = new Date(d);
  return isNaN(v.getTime()) ? null : v.getFullYear();
}

function yrRange(
  dob: string | null,
  dod: string | null,
  alive: boolean
): string {
  const b = yr(dob);
  const d = yr(dod);
  if (b && d) return `${b}–${d}`;
  if (b && !alive) return `${b}–`;
  if (b) return `${b}–`;
  return "";
}

function ini(f: string, l: string) {
  return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase();
}

function age(birth: string | null, event: string): number | null {
  if (!birth) return null;
  const bd = new Date(birth);
  const ed = new Date(event);
  if (isNaN(bd.getTime()) || isNaN(ed.getTime())) return null;
  let a = ed.getFullYear() - bd.getFullYear();
  const m = ed.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && ed.getDate() < bd.getDate())) a--;
  return a >= 0 ? a : null;
}

function evLabel(t: string) {
  const m: Record<string, string> = {
    BIRTH: "Birth",
    MARRIAGE: "Marriage",
    GRADUATION: "Graduation",
    ACHIEVEMENT: "Achievement",
    DEATH: "Death",
    OTHER: "Event",
  };
  return m[t] ?? t;
}

function pronoun(g: string) {
  if (g === "MALE") return { s: "He", p: "his" };
  if (g === "FEMALE") return { s: "She", p: "her" };
  return { s: "They", p: "their" };
}

// ─── Derive timeline events ───────────────────────────────────────────────────
interface TLEvent {
  year: number | null;
  age: number | null;
  type: string;
  date: string | null;
  notes: string | null;
  person: { id: string; name: string; years: string; initials: string } | null;
  childName?: string;
  childYears?: string;
  childId?: string;
  linkedName?: string;
  linkedYears?: string;
  linkedId?: string;
  sortKey: number;
}

function buildTimeline(
  m: ProfileMember,
  evts: ProfileLifeEvent[],
  children: ProfileRelative[],
  spouses: ProfileRelative[]
): TLEvent[] {
  const out: TLEvent[] = [];
  const dob = m.dateOfBirth;

  // Synthesise birth if missing from events
  if (!evts.some((e) => e.type === "BIRTH") && dob) {
    out.push({
      year: yr(dob),
      age: null,
      type: "Birth",
      date: fmtDate(dob),
      notes: null,
      person: null,
      sortKey: new Date(dob).getTime(),
    });
  }

  // Life events
  for (const e of evts) {
    const loc = e.location ? ` • ${e.location}` : "";
    let person: TLEvent["person"] = null;
    if (e.type === "MARRIAGE" && spouses.length > 0) {
      const sp = spouses[0];
      person = {
        id: sp.id,
        name: `${sp.firstName} ${sp.lastName}`,
        years: yrRange(sp.dateOfBirth, sp.dateOfDeath, sp.isAlive),
        initials: ini(sp.firstName, sp.lastName),
      };
    }
    out.push({
      year: yr(e.date),
      age: age(dob, e.date),
      type: evLabel(e.type),
      date: fmtDate(e.date) + loc,
      notes: e.description,
      person,
      sortKey: new Date(e.date).getTime(),
    });
  }

  // Children births
  for (const c of children) {
    if (!c.dateOfBirth) continue;
    const gl = c.gender === "FEMALE" ? "daughter" : "son";
    out.push({
      year: yr(c.dateOfBirth),
      age: age(dob, c.dateOfBirth),
      type: `Birth of ${gl}`,
      date: fmtDate(c.dateOfBirth),
      notes: null,
      person: null,
      childName: `${c.firstName} ${c.lastName}`,
      childYears: `(${yrRange(c.dateOfBirth, c.dateOfDeath, c.isAlive)})`,
      childId: c.id,
      sortKey: new Date(c.dateOfBirth).getTime(),
    });
  }

  // Spouse deaths
  for (const sp of spouses) {
    if (sp.isAlive || !sp.dateOfDeath) continue;
    const gl = sp.gender === "FEMALE" ? "wife" : "husband";
    out.push({
      year: yr(sp.dateOfDeath),
      age: age(dob, sp.dateOfDeath),
      type: `Death of ${gl}`,
      date: fmtDate(sp.dateOfDeath),
      notes: null,
      person: null,
      linkedName: `${sp.firstName} ${sp.lastName}`,
      linkedYears: `(${yrRange(sp.dateOfBirth, sp.dateOfDeath, sp.isAlive)})`,
      linkedId: sp.id,
      sortKey: new Date(sp.dateOfDeath).getTime(),
    });
  }

  // Synthesise death
  if (!evts.some((e) => e.type === "DEATH") && m.dateOfDeath) {
    out.push({
      year: yr(m.dateOfDeath),
      age: age(dob, m.dateOfDeath),
      type: "Death",
      date: fmtDate(m.dateOfDeath),
      notes: null,
      person: null,
      sortKey: new Date(m.dateOfDeath).getTime(),
    });
  }

  // Add profession / marital status as bottom-of-timeline notes
  if (m.profession) {
    out.push({
      year: null,
      age: null,
      type: "Profession",
      date: null,
      notes: m.profession,
      person: null,
      sortKey: Number.MAX_SAFE_INTEGER - 1,
    });
  }

  out.sort((a, b) => a.sortKey - b.sortKey);
  return out;
}

// ─── Derive life story events ─────────────────────────────────────────────────
interface LSEvent {
  id: string;
  dateLabel: string;
  yearLabel: string;
  ageLabel: string | null;
  title: string;
  body: string | null;
  notes: string | null;
  meta: string | null;
  linked: {
    id: string;
    initials: string;
    name: string;
    years: string;
    meta: string | null;
  } | null;
}

function buildLifeStory(
  m: ProfileMember,
  evts: ProfileLifeEvent[],
  children: ProfileRelative[],
  spouses: ProfileRelative[]
): LSEvent[] {
  const out: LSEvent[] = [];
  const dob = m.dateOfBirth;
  const fn = `${m.firstName} ${m.lastName}`;
  const pr = pronoun(m.gender);

  const dtLabel = (d: Date) => format(d, "d MMM").toUpperCase();

  // Synthesise birth
  if (!evts.some((e) => e.type === "BIRTH") && dob) {
    const d = new Date(dob);
    out.push({
      id: "synth-birth",
      dateLabel: dtLabel(d),
      yearLabel: d.getFullYear().toString(),
      ageLabel: null,
      title: "Birth",
      body: `${fn} was born on ${format(d, "d MMMM yyyy")}.`,
      notes: null,
      meta: fmtDate(dob),
      linked: null,
    });
  }

  for (const e of evts) {
    const d = new Date(e.date);
    const a = age(dob, e.date);
    const loc = e.location ? ` • ${e.location}` : "";
    let linked: LSEvent["linked"] = null;
    let body = e.description;

    if (e.type === "MARRIAGE" && spouses.length > 0) {
      const sp = spouses[0];
      linked = {
        id: sp.id,
        initials: ini(sp.firstName, sp.lastName),
        name: `${sp.firstName} ${sp.lastName}`,
        years: yrRange(sp.dateOfBirth, sp.dateOfDeath, sp.isAlive),
        meta: fmtDate(e.date) + loc,
      };
      if (!body)
        body = `${fn} married ${sp.firstName} ${sp.lastName}${e.location ? ` in ${e.location}` : ""} on ${format(d, "d MMMM yyyy")}${a ? `, at the age of ${a}` : ""}.`;
    }
    if (e.type === "BIRTH" && !body)
      body = `${fn} was born on ${format(d, "d MMMM yyyy")}${e.location ? `, in ${e.location}` : ""}.`;
    if (e.type === "DEATH" && !body)
      body = `${fn} passed away on ${format(d, "d MMMM yyyy")}${a ? ` at the age of ${a}` : ""}.`;

    out.push({
      id: e.id,
      dateLabel: dtLabel(d),
      yearLabel: d.getFullYear().toString(),
      ageLabel: a ? `AGE ${a}` : null,
      title: evLabel(e.type),
      body,
      notes: !["BIRTH", "DEATH", "MARRIAGE"].includes(e.type)
        ? e.description
        : null,
      meta: fmtDate(e.date) + loc,
      linked,
    });
  }

  // Children births
  for (const c of children) {
    if (!c.dateOfBirth) continue;
    const d = new Date(c.dateOfBirth);
    const a = age(dob, c.dateOfBirth);
    const gl = c.gender === "FEMALE" ? "Daughter" : "Son";
    out.push({
      id: `child-${c.id}`,
      dateLabel: dtLabel(d),
      yearLabel: d.getFullYear().toString(),
      ageLabel: a ? `AGE ${a}` : null,
      title: `Birth of ${gl}`,
      body: `${fn} welcomed ${pr.p} ${gl.toLowerCase()} ${c.firstName} ${c.lastName} on ${format(d, "d MMMM yyyy")}.`,
      notes: null,
      meta: fmtDate(c.dateOfBirth),
      linked: {
        id: c.id,
        initials: ini(c.firstName, c.lastName),
        name: `${c.firstName} ${c.lastName}`,
        years: yrRange(c.dateOfBirth, c.dateOfDeath, c.isAlive),
        meta: fmtDate(c.dateOfBirth),
      },
    });
  }

  // Spouse deaths
  for (const sp of spouses) {
    if (sp.isAlive || !sp.dateOfDeath) continue;
    const d = new Date(sp.dateOfDeath);
    const a = age(dob, sp.dateOfDeath);
    const gl = sp.gender === "FEMALE" ? "Wife" : "Husband";
    out.push({
      id: `sp-death-${sp.id}`,
      dateLabel: dtLabel(d),
      yearLabel: d.getFullYear().toString(),
      ageLabel: a ? `AGE ${a}` : null,
      title: `Death of ${gl}`,
      body: `${fn}'s ${gl.toLowerCase()} ${sp.firstName} ${sp.lastName} passed away on ${format(d, "d MMMM yyyy")}.`,
      notes: null,
      meta: fmtDate(sp.dateOfDeath),
      linked: {
        id: sp.id,
        initials: ini(sp.firstName, sp.lastName),
        name: `${sp.firstName} ${sp.lastName}`,
        years: yrRange(sp.dateOfBirth, sp.dateOfDeath, sp.isAlive),
        meta: fmtDate(sp.dateOfDeath),
      },
    });
  }

  // Synthesise death
  if (!evts.some((e) => e.type === "DEATH") && m.dateOfDeath) {
    const d = new Date(m.dateOfDeath);
    const a = age(dob, m.dateOfDeath);
    out.push({
      id: "synth-death",
      dateLabel: dtLabel(d),
      yearLabel: d.getFullYear().toString(),
      ageLabel: a ? `AGE ${a}` : null,
      title: "Death",
      body: `${fn} passed away on ${format(d, "d MMMM yyyy")}${a ? ` at the age of ${a}` : ""}.`,
      notes: null,
      meta: fmtDate(m.dateOfDeath),
      linked: null,
    });
  }

  out.sort((a, b) => {
    const ya = parseInt(a.yearLabel) || 0;
    const yb = parseInt(b.yearLabel) || 0;
    return ya - yb;
  });
  return out;
}

function bioSummary(
  m: ProfileMember,
  children: ProfileRelative[],
  spouses: ProfileRelative[]
): string {
  if (m.bio) return m.bio;
  const fn = `${m.firstName} ${m.lastName}`;
  const pr = pronoun(m.gender);
  let s = "";
  if (m.dateOfBirth) s += `${fn} was born on ${fmtDate(m.dateOfBirth)}.`;
  if (children.length > 0) {
    const sons = children.filter((c) => c.gender === "MALE").length;
    const daughters = children.filter((c) => c.gender === "FEMALE").length;
    const parts: string[] = [];
    if (sons) parts.push(`${sons} son${sons > 1 ? "s" : ""}`);
    if (daughters)
      parts.push(`${daughters} daughter${daughters > 1 ? "s" : ""}`);
    const ct = parts.join(" and ");
    if (spouses.length > 0)
      s += ` ${pr.s} had ${ct} with ${spouses[0].firstName} ${spouses[0].lastName}.`;
    else s += ` ${pr.s} had ${ct}.`;
  }
  if (m.dateOfDeath) {
    const a = age(m.dateOfBirth, m.dateOfDeath);
    s += ` ${pr.s} passed away on ${fmtDate(m.dateOfDeath)}${a ? `, at the age of ${a}` : ""}.`;
  }
  return s || `${fn}'s profile.`;
}

// ─── Shared: PersonAvatar ─────────────────────────────────────────────────────
function PersonAvatar({
  photo,
  name,
  size = 80,
}: {
  photo: string | null;
  name: string;
  size?: number;
}) {
  const ring = size + 8; // outer ring slightly larger
  const inner = size;
  return (
    <div
      className="flex-shrink-0 relative"
      style={{ width: ring, height: ring, minWidth: ring }}
    >
      {/* Gradient ring */}
      <div
        className="absolute inset-0 rounded-full animate-[spin_4s_linear_infinite]"
        style={{
          background:
            "conic-gradient(from 0deg, #f87171, #fb923c, #facc15, #4ade80, #38bdf8, #818cf8, #c084fc, #f472b6, #f87171)",
        }}
      />
      {/* White gap ring */}
      <div
        className="absolute rounded-full bg-[#3a3a3a]"
        style={{
          top: 2,
          left: 2,
          width: ring - 4,
          height: ring - 4,
        }}
      />
      {/* Inner photo / fallback */}
      <div
        className="absolute rounded-full overflow-hidden bg-[#c97b5a]"
        style={{
          top: (ring - inner) / 2,
          left: (ring - inner) / 2,
          width: inner,
          height: inner,
        }}
      >
        {photo ? (
          <img src={photo} alt={name} className="w-full h-full object-cover" />
        ) : (
          <svg viewBox="0 0 80 80" width={inner} height={inner} fill="none">
            <rect width="80" height="80" fill="#c97b5a" />
            <circle cx="40" cy="26" r="13" fill="#a0522d" />
            <ellipse cx="40" cy="68" rx="22" ry="16" fill="#a0522d" />
          </svg>
        )}
      </div>
    </div>
  );
}

// ─── Shared: TabBar ───────────────────────────────────────────────────────────
function TabBar({
  activeTab,
  onTabChange,
  compact = false,
}: {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  compact?: boolean;
}) {
  const tabs: Tab[] = ["Facts", "Hints", "Gallery", "LifeStory", "Explore"];
  return (
    <nav className="flex">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`${compact ? "px-4 py-4" : "px-5 py-3"} text-sm font-medium transition-colors border-b-2 ${
            activeTab === tab
              ? "text-white border-white"
              : "text-gray-400 hover:text-gray-200 border-transparent"
          }`}
        >
          {tab === "LifeStory" ? "Life Story" : tab}
          {tab === "Explore" && (
            <Lock className="inline-block ml-1 w-3 h-3 text-green-400 mb-0.5" />
          )}
        </button>
      ))}
    </nav>
  );
}

// ─── FactsPanel ───────────────────────────────────────────────────────────────
function FactsPanel({
  timeline,
  member,
  parents,
  spouseChildGroups,
  onNav,
}: {
  timeline: TLEvent[];
  member: ProfileMember;
  parents: ProfileRelative[];
  spouseChildGroups: SpouseChildGroup[];
  onNav: (id: string) => void;
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Timeline */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-5 bg-linear-to-b from-emerald-500 to-teal-400 rounded-full inline-block" />
            Timeline
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1 rounded-full border-gray-300 shadow-sm hover:shadow"
            >
              <Filter className="w-3 h-3" /> Filter{" "}
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Timeline with visible spine */}
        <div className="relative pl-[52px] sm:pl-[72px]">
          {/* Continuous gradient spine */}
          <div
            className="absolute left-[35px] sm:left-[55px] top-3 bottom-3 w-[3px] rounded-full"
            style={{
              background:
                "linear-gradient(to bottom, #10b981, #06b6d4, #6366f1, #a855f7)",
            }}
          />

          <div className="space-y-4">
            {timeline.map((ev, i) => {
              const isLinked =
                ev.type.startsWith("Birth of") ||
                ev.type.startsWith("Death of");
              const isDeath =
                ev.type === "Death" || ev.type.startsWith("Death of");
              const isBirth =
                ev.type === "Birth" || ev.type.startsWith("Birth of");
              const isProfession = ev.type === "Profession";

              // Accent color per type
              const accent = isDeath
                ? "border-l-gray-400"
                : isBirth
                  ? "border-l-emerald-500"
                  : isProfession
                    ? "border-l-amber-500"
                    : "border-l-sky-500";

              // Dot color
              const dotBg = isDeath
                ? "bg-gray-400"
                : isBirth
                  ? "bg-emerald-500"
                  : isProfession
                    ? "bg-amber-500"
                    : "bg-sky-500";

              const dotGlow = isDeath
                ? "shadow-[0_0_8px_rgba(156,163,175,0.5)]"
                : isBirth
                  ? "shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : isProfession
                    ? "shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    : "shadow-[0_0_8px_rgba(14,165,233,0.5)]";

              // Icon per event type (Lucide) — colored & sized
              const iconMap: Record<string, React.ReactNode> = {
                Birth: <Baby className="w-5 h-5 text-emerald-600" />,
                "Birth of son": (
                  <HeartPulse className="w-5 h-5 text-emerald-500" />
                ),
                "Birth of daughter": (
                  <HeartPulse className="w-5 h-5 text-pink-500" />
                ),
                Marriage: <Heart className="w-5 h-5 text-rose-500" />,
                Graduation: <GraduationCap className="w-5 h-5 text-sky-600" />,
                Achievement: <Award className="w-5 h-5 text-purple-600" />,
                Profession: <Briefcase className="w-5 h-5 text-amber-600" />,
                Death: <Cross className="w-5 h-5 text-gray-500" />,
                "Death of husband": <Cross className="w-5 h-5 text-gray-500" />,
                "Death of wife": <Cross className="w-5 h-5 text-gray-500" />,
                Event: <CalendarDays className="w-5 h-5 text-sky-500" />,
              };
              const eventIcon = iconMap[ev.type] ?? (
                <CalendarDays className="w-5 h-5 text-sky-500" />
              );

              return (
                <div
                  key={i}
                  className="relative flex items-stretch gap-5 group"
                >
                  {/* Year / age label — positioned to left of spine */}
                  <div className="absolute -left-[52px] sm:-left-[72px] top-3 w-[36px] sm:w-[44px] text-right">
                    {ev.year && (
                      <>
                        <div className="text-sm font-bold text-gray-800 leading-tight">
                          {ev.year}
                        </div>
                        {ev.age != null && (
                          <div className="text-[10px] font-medium text-gray-400 leading-tight">
                            age {ev.age}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Dot on the spine */}
                  <div className="absolute -left-[19px] sm:-left-[20px] top-[14px] z-10 flex items-center justify-center">
                    <div
                      className={`w-[13px] h-[13px] rounded-full ${dotBg} ${dotGlow} border-[2.5px] border-white ring-1 ring-gray-200 transition-transform group-hover:scale-125`}
                    />
                  </div>

                  {/* Card */}
                  <div
                    className={`flex-1 min-w-0 rounded-xl border-l-[4px] ${accent} bg-white border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5 overflow-hidden`}
                  >
                    <div className="px-5 py-4">
                      {/* Event header */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex items-center justify-center w-6 h-6">
                          {eventIcon}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {ev.childName ? (
                            <>
                              {ev.type}{" "}
                              <span
                                className="text-emerald-600 cursor-pointer hover:underline"
                                onClick={() => ev.childId && onNav(ev.childId)}
                              >
                                {ev.childName}
                              </span>{" "}
                              <span className="text-gray-400 font-normal text-xs">
                                {ev.childYears}
                              </span>
                            </>
                          ) : ev.linkedName ? (
                            <>
                              {ev.type}{" "}
                              <span
                                className="text-emerald-600 cursor-pointer hover:underline"
                                onClick={() =>
                                  ev.linkedId && onNav(ev.linkedId)
                                }
                              >
                                {ev.linkedName}
                              </span>{" "}
                              <span className="text-gray-400 font-normal text-xs">
                                {ev.linkedYears}
                              </span>
                            </>
                          ) : (
                            ev.type
                          )}
                        </span>
                      </div>

                      {/* Date */}
                      {ev.date && (
                        <div className="text-xs text-gray-500 font-medium ml-7">
                          📅 {ev.date}
                        </div>
                      )}

                      {/* Notes */}
                      {ev.notes && (
                        <div className="text-xs text-gray-600 mt-2 ml-7 bg-gray-50 rounded-md px-3 py-2 border border-gray-100">
                          {ev.notes}
                        </div>
                      )}

                      {/* Linked person */}
                      {ev.person && (
                        <div
                          className="flex items-center gap-2.5 mt-3 ml-7 cursor-pointer group/person"
                          onClick={() => ev.person && onNav(ev.person.id)}
                        >
                          <Avatar className="w-8 h-8 ring-2 ring-emerald-200">
                            <AvatarFallback className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold">
                              {ev.person.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-xs text-emerald-700 group-hover/person:underline font-semibold">
                              {ev.person.name}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {ev.person.years}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="w-full lg:w-60 lg:flex-shrink-0">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-800">Details</h2>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
          {[
            {
              label: "Gender",
              value:
                member.gender === "MALE"
                  ? "Male"
                  : member.gender === "FEMALE"
                    ? "Female"
                    : "Other",
            },
            { label: "Status", value: member.isAlive ? "Living" : "Deceased" },
            { label: "Clan", value: member.familyClan },
            {
              label: "Generation",
              value:
                member.generation != null
                  ? `Generation ${member.generation}`
                  : null,
            },
            {
              label: "Marital Status",
              value: member.maritalStatus
                ? member.maritalStatus.charAt(0) +
                  member.maritalStatus.slice(1).toLowerCase()
                : null,
            },
            { label: "Blood Group", value: member.bloodGroup },
            { label: "Profession", value: member.profession },
            {
              label: "Date of Birth",
              value: fmtDate(member.dateOfBirth) || null,
            },
            {
              label: "Date of Death",
              value: fmtDate(member.dateOfDeath) || null,
            },
          ]
            .filter((row) => row.value)
            .map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-4 py-2.5"
              >
                <span className="text-xs text-gray-500 font-medium">
                  {row.label}
                </span>
                <span className="text-xs font-semibold text-gray-800 text-right">
                  {row.label === "Status" && member.isAlive ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {row.value}
                    </span>
                  ) : row.label === "Status" && !member.isAlive ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      {row.value}
                    </span>
                  ) : (
                    row.value
                  )}
                </span>
              </div>
            ))}
        </div>
        {member.bio && (
          <div className="mt-3 bg-white border border-gray-200 rounded-lg px-4 py-3">
            <span className="text-xs text-gray-500 font-medium block mb-1">
              Bio
            </span>
            <p className="text-xs text-gray-700 leading-relaxed">
              {member.bio}
            </p>
          </div>
        )}
      </div>

      {/* Relationships */}
      <div className="w-full lg:w-60 lg:flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">
            Relationships
          </h2>
        </div>
        <p className="text-xs font-semibold text-gray-600 mb-2">Parents</p>
        <div className="space-y-1.5 mb-4">
          {parents.length > 0 ? (
            parents.map((p) => (
              <div
                key={p.id}
                className="w-full border border-gray-200 rounded-md px-3 py-2.5 flex items-center gap-2 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onNav(p.id)}
              >
                <Avatar className="w-7 h-7">
                  {p.photo && <AvatarImage src={p.photo} alt={p.firstName} />}
                  <AvatarFallback className="text-[9px] bg-gray-200">
                    {ini(p.firstName, p.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-xs font-medium text-green-700">
                    {p.firstName} {p.lastName}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {yrRange(p.dateOfBirth, p.dateOfDeath, p.isAlive)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              {["Add father", "Add mother"].map((label) => (
                <button
                  key={label}
                  className="w-full border border-dashed border-gray-300 rounded-md px-3 py-2.5 text-xs text-gray-500 hover:border-green-500 flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-gray-400" /> {label}
                </button>
              ))}
            </>
          )}
        </div>

        <p className="text-xs font-semibold text-gray-600 mb-2">
          Spouse and children
        </p>
        {spouseChildGroups.length > 0 ? (
          spouseChildGroups.map((group, gi) => (
            <div
              key={gi}
              className="border border-gray-200 rounded-md overflow-hidden mb-2"
            >
              {group.spouse && (
                <div
                  className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                  onClick={() => group.spouse && onNav(group.spouse.id)}
                >
                  <Avatar className="w-7 h-7">
                    {group.spouse.photo && (
                      <AvatarImage
                        src={group.spouse.photo}
                        alt={group.spouse.firstName}
                      />
                    )}
                    <AvatarFallback className="text-[9px] bg-gray-200">
                      {ini(group.spouse.firstName, group.spouse.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xs font-medium text-green-700">
                      {group.spouse.firstName} {group.spouse.lastName}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {yrRange(
                        group.spouse.dateOfBirth,
                        group.spouse.dateOfDeath,
                        group.spouse.isAlive
                      )}
                    </div>
                  </div>
                </div>
              )}
              {group.children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center gap-2 px-3 py-2.5 pl-7 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                  onClick={() => onNav(child.id)}
                >
                  <Avatar className="w-7 h-7">
                    {child.photo && (
                      <AvatarImage src={child.photo} alt={child.firstName} />
                    )}
                    <AvatarFallback className="text-[9px] bg-gray-100">
                      {ini(child.firstName, child.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xs font-medium text-green-700">
                      {child.firstName} {child.lastName}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {yrRange(
                        child.dateOfBirth,
                        child.dateOfDeath,
                        child.isAlive
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <button className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-gray-500 hover:text-green-700 hover:bg-gray-50 transition-colors border border-dashed border-gray-300 rounded-md">
            <Plus className="w-3.5 h-3.5" /> Add family
          </button>
        )}
      </div>
    </div>
  );
}

// ─── HintsPanel ───────────────────────────────────────────────────────────────
function HintsPanel() {
  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-sm text-gray-500">
        No record hints available yet. Hints will appear here as matching
        records are discovered.
      </p>
    </div>
  );
}

// ─── GalleryPanel ─────────────────────────────────────────────────────────────
function GalleryPanel({ photo, name }: { photo: string | null; name: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {photo ? "1 photo" : "No photos yet"}
        </p>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
          <Camera className="w-3.5 h-3.5" /> Add photo
        </Button>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {photo && (
          <div className="group cursor-pointer">
            <div className="aspect-square rounded-md overflow-hidden border border-gray-200 group-hover:opacity-80 transition-opacity">
              <img
                src={photo}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-[10px] text-gray-500 mt-1 truncate">
              Profile photo
            </div>
          </div>
        )}
        <div className="group cursor-pointer">
          <div className="aspect-square rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-green-500 transition-colors">
            <Plus className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Add photo</div>
        </div>
      </div>
    </div>
  );
}

// ─── MapEmbed (Tumin, Sikkim) ─────────────────────────────────────────────────
function MapEmbed() {
  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 text-sm font-semibold text-gray-800 flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-gray-500" /> Tumin Dhanbari, Sikkim
      </div>
      <div className="h-[220px] w-full">
        <iframe
          title="Tumin Dhanbari Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14143.535038318257!2d88.51351221715423!3d27.36371720888062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e6a090403cd453%3A0xc3c945ece5f43da2!2sTumin%2C%20Sikkim%20737134!5e0!3m2!1sen!2sin!4v1714561234567!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="px-3 py-1 bg-gray-50 text-[10px] text-gray-400 text-right">
        © Google Maps
      </div>
    </div>
  );
}

// ─── LifeStoryPanel ───────────────────────────────────────────────────────────
function LifeStoryPanel({
  member,
  events,
  parents,
  spouses,
  children,
  summary,
  onNav,
}: {
  member: ProfileMember;
  events: LSEvent[];
  parents: ProfileRelative[];
  spouses: ProfileRelative[];
  children: ProfileRelative[];
  summary: string;
  onNav: (id: string) => void;
}) {
  const fullName = `${member.firstName} ${member.lastName}`;
  const father = parents.find((p) => p.gender === "MALE");
  const mother = parents.find((p) => p.gender === "FEMALE");
  const spouse = spouses[0] ?? null;
  const firstChild = children[0] ?? null;

  return (
    <div className="relative max-w-3xl">
      {/* Continuous vertical spine */}
      <div className="absolute left-[49px] top-0 bottom-0 w-px bg-gray-300 z-0" />

      <div className="relative z-10 space-y-5">
        {/* ── Row 1: Intro (people icon) ── */}
        <div className="flex items-start gap-4">
          <div className="w-[100px] flex-shrink-0 flex justify-center pt-1">
            <div className="w-9 h-9 rounded-full bg-[#5a5a5a] flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-md px-5 py-4">
            <div className="flex items-start justify-between gap-4 mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
            </div>

            {/* Mini family-tree diagram */}
            <div className="overflow-x-auto pb-1">
              <div className="flex items-center gap-0 min-w-max text-xs select-none">
                {/* First child or placeholder */}
                {firstChild ? (
                  <div
                    className="border border-gray-200 rounded px-3 py-2 bg-white flex flex-col gap-0.5 cursor-pointer hover:bg-gray-50"
                    onClick={() => onNav(firstChild.id)}
                  >
                    <div className="flex items-center gap-1.5">
                      <Avatar className="w-5 h-5">
                        <AvatarFallback className="text-[8px] bg-gray-200">
                          {ini(firstChild.firstName, firstChild.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-green-700 font-medium hover:underline">
                        {firstChild.firstName} {firstChild.lastName}
                      </span>
                    </div>
                    {children.length > 1 && (
                      <span className="text-[10px] text-green-700">
                        + {children.length - 1} more
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded px-3 py-1.5 bg-white text-[10px] text-gray-500">
                    No children
                  </div>
                )}

                {/* Horizontal connector to subject */}
                <div className="flex items-center">
                  <div className="w-1 h-px bg-gray-300" />
                  <div className="flex flex-col items-start">
                    <div className="w-4 border-t border-l border-gray-300 h-5 rounded-tl" />
                    <div className="w-4 border-b border-l border-gray-300 h-5 rounded-bl" />
                  </div>
                </div>

                {/* Subject (highlighted dark box) */}
                <div className="bg-[#4a4a4a] text-white rounded px-3 py-2 flex flex-col items-center gap-1">
                  <Avatar className="w-6 h-6">
                    {member.photo ? (
                      <AvatarImage src={member.photo} alt={fullName} />
                    ) : (
                      <AvatarFallback className="text-[8px] bg-[#c97b5a] text-white">
                        {ini(member.firstName, member.lastName)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="font-semibold text-[11px] whitespace-nowrap">
                    {member.firstName} {member.lastName}
                  </span>
                </div>

                {/* Right side: parents */}
                <div className="flex items-center">
                  <div className="flex flex-col items-start">
                    <div className="w-4 border-t border-r border-gray-300 h-5 rounded-tr" />
                    <div className="w-4 border-b border-r border-gray-300 h-5 rounded-br" />
                  </div>
                  <div className="flex flex-col gap-1">
                    {father ? (
                      <div
                        className="border border-gray-200 rounded px-2.5 py-1.5 bg-white text-[10px] text-green-700 whitespace-nowrap cursor-pointer hover:underline"
                        onClick={() => onNav(father.id)}
                      >
                        {father.firstName} {father.lastName}
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded px-2.5 py-1.5 bg-white text-[10px] text-gray-500 whitespace-nowrap">
                        Unknown father
                      </div>
                    )}
                    {mother ? (
                      <div
                        className="border border-gray-200 rounded px-2.5 py-1.5 bg-white text-[10px] text-green-700 whitespace-nowrap cursor-pointer hover:underline"
                        onClick={() => onNav(mother.id)}
                      >
                        {mother.firstName} {mother.lastName}
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded px-2.5 py-1.5 bg-white text-[10px] text-gray-500 whitespace-nowrap">
                        Unknown mother
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Spouse node below */}
              {spouse && (
                <div
                  className="mt-1 flex items-center gap-0 min-w-max text-xs"
                  style={{
                    paddingLeft:
                      "calc(3.5rem + 6px + 1.5rem + 6px + 3rem + 0px)",
                  }}
                >
                  <div
                    className="border border-gray-200 rounded px-3 py-1.5 bg-white flex items-center gap-1.5 cursor-pointer hover:bg-gray-50"
                    onClick={() => onNav(spouse.id)}
                  >
                    <Avatar className="w-5 h-5">
                      {spouse.photo && (
                        <AvatarImage
                          src={spouse.photo}
                          alt={spouse.firstName}
                        />
                      )}
                      <AvatarFallback className="text-[8px] bg-gray-200">
                        {ini(spouse.firstName, spouse.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-green-700 cursor-pointer hover:underline">
                      {spouse.firstName} {spouse.lastName}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Row 2: Map (pin icon) ── */}
        <div className="flex items-start gap-4">
          <div className="w-[100px] flex-shrink-0 flex justify-center pt-1">
            <div className="w-9 h-9 rounded-full bg-[#5a5a5a] flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <MapEmbed />
          </div>
        </div>

        {/* ── Event rows ── */}
        {events.map((ev) => (
          <div key={ev.id} className="flex items-start gap-4">
            <div className="w-[100px] flex-shrink-0 flex justify-center">
              <div className="w-[72px] h-[72px] rounded-full bg-[#4a4a4a] flex flex-col items-center justify-center text-white flex-shrink-0">
                <span className="text-[9px] font-semibold tracking-wide uppercase leading-none">
                  {ev.dateLabel}
                </span>
                <span className="text-xl font-bold leading-tight">
                  {ev.yearLabel}
                </span>
                {ev.ageLabel && (
                  <span className="text-[8px] tracking-widest uppercase leading-none text-gray-300 mt-0.5">
                    {ev.ageLabel}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-md overflow-hidden">
              <div className="flex items-start justify-between px-5 py-4 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-800 mb-1">
                    {ev.title}
                  </div>
                  {ev.body && (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {ev.body}
                    </p>
                  )}
                  {ev.notes && (
                    <p className="text-xs text-gray-500 mt-1">{ev.notes}</p>
                  )}
                  {ev.meta && (
                    <div className="text-xs text-gray-400 font-medium mt-1.5">
                      {ev.meta}
                    </div>
                  )}
                </div>
              </div>

              {/* Linked person */}
              {ev.linked && (
                <div
                  className="px-5 py-3 border-t border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => ev.linked && onNav(ev.linked.id)}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="text-xs bg-gray-200 text-gray-600">
                      {ev.linked.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm text-green-700 font-semibold hover:underline">
                      {ev.linked.name}
                    </div>
                    <div className="text-xs text-green-600">
                      {ev.linked.years}
                    </div>
                    {ev.linked.meta && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        {ev.linked.meta}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ExplorePanel ─────────────────────────────────────────────────────────────
function ExplorePanel() {
  return (
    <div className="max-w-2xl">
      <div className="bg-linear-to-br from-green-50 to-emerald-50 border border-green-200 rounded-md p-6 text-center mb-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6 text-green-700" />
        </div>
        <div className="text-sm font-semibold text-gray-800 mb-1">
          More features coming soon
        </div>
        <div className="text-xs text-gray-500 mb-4">
          Explore additional records, archives, and deeper family connections.
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Historical Archives",
            icon: "📰",
            desc: "Search community records",
          },
          {
            label: "Village Records",
            icon: "🎖️",
            desc: "Village administration records",
          },
          {
            label: "Migration Records",
            icon: "🚢",
            desc: "Family migration history",
          },
          {
            label: "Map Explorer",
            icon: "🗺️",
            desc: "See where ancestors lived",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="border border-gray-200 rounded-md px-4 py-3 hover:border-green-400 hover:bg-green-50 cursor-pointer transition-colors"
          >
            <div className="text-lg mb-1">{item.icon}</div>
            <div className="text-xs font-semibold text-gray-800">
              {item.label}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PersonProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Facts");
  const [scrolled, setScrolled] = useState(false);
  const fullHeaderRef = useRef<HTMLDivElement>(null);

  // Fetch profile data
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetch(`/api/profile/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load profile");
        }
        return res.json();
      })
      .then((json: ProfileData) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // Scroll handling for sticky header
  useEffect(() => {
    const onScroll = () => {
      const threshold = (fullHeaderRef.current?.offsetHeight ?? 130) - 56;
      setScrolled(window.scrollY > threshold);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onNav = (memberId: string) => router.push(`/profile/${memberId}`);

  // Derived data
  const timeline = useMemo(() => {
    if (!data) return [];
    return buildTimeline(
      data.member,
      data.lifeEvents,
      data.children,
      data.spouses
    );
  }, [data]);

  const lifeStoryEvents = useMemo(() => {
    if (!data) return [];
    return buildLifeStory(
      data.member,
      data.lifeEvents,
      data.children,
      data.spouses
    );
  }, [data]);

  const summary = useMemo(() => {
    if (!data) return "";
    return bioSummary(data.member, data.children, data.spouses);
  }, [data]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-green-700" />
          <span className="text-sm text-gray-500">Loading profile…</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">😔</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            {error === "Member not found"
              ? "Member Not Found"
              : "Something went wrong"}
          </h2>
          <p className="text-sm text-gray-500">{error}</p>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { member, parents, spouses, children, spouseChildGroups } = data;
  const fullName = `${member.firstName} ${member.lastName}`;
  const birthStr = member.dateOfBirth ? fmtDate(member.dateOfBirth) : "";
  const deathStr = member.dateOfDeath ? fmtDate(member.dateOfDeath) : "";
  const clanLabel = member.familyClan
    ? `${member.familyClan} clan`
    : member.generation
      ? `Generation ${member.generation}`
      : "";

  return (
    <div className="min-h-screen bg-[#f5f4f0] font-sans">
      {/* ════════════════════════════════════════
          FULL HEADER
          ════════════════════════════════════════ */}
      <div
        ref={fullHeaderRef}
        className={`bg-[#3a3a3a] text-white transition-opacity duration-200 ${scrolled ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-5">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-[#555] flex items-center justify-center hover:bg-[#666] transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <PersonAvatar photo={member.photo} name={fullName} size={64} />
          </div>

          {/* Name, dates, relation */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight">
              {fullName}
            </h1>
            <div className="flex flex-col gap-0.5 mt-1">
              {birthStr && (
                <div className="text-xs text-gray-300 uppercase tracking-wider font-medium">
                  BIRTH&nbsp;&nbsp;{birthStr}
                </div>
              )}
              {deathStr && (
                <div className="text-xs text-gray-300 uppercase tracking-wider font-medium">
                  DEATH&nbsp;&nbsp;{deathStr}
                </div>
              )}
              {!deathStr && member.isAlive && (
                <div className="text-xs text-green-400 uppercase tracking-wider font-medium">
                  Living
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              {clanLabel && (
                <span className="text-xs text-gray-400">{clanLabel}</span>
              )}
              {member.profession && (
                <span className="text-xs text-gray-400">
                  {member.profession}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <TabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            compact={false}
          />
        </div>
      </div>

      {/* ════════════════════════════════════════
          COMPACT STICKY HEADER
          ════════════════════════════════════════ */}
      <div
        className={`
          fixed top-0 left-0 right-0 z-50
          bg-[#3a3a3a] text-white shadow-xl
          transition-transform duration-300 ease-in-out
          ${scrolled ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-stretch gap-0">
          <div className="flex items-center gap-3 py-2 pr-5 mr-1 border-r border-[#555] flex-shrink-0">
            <button
              onClick={() => router.back()}
              className="w-7 h-7 rounded-full bg-[#555] flex items-center justify-center hover:bg-[#666] transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-white" />
            </button>
            <PersonAvatar photo={member.photo} name={fullName} size={38} />
            <div className="leading-tight">
              <div className="text-sm font-bold">{fullName}</div>
              <div className="text-[10px] text-gray-300">
                {birthStr}
                {deathStr ? ` – ${deathStr}` : ""}
              </div>
              {clanLabel && (
                <div className="text-[10px] text-gray-400">{clanLabel}</div>
              )}
            </div>
          </div>
          <TabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            compact={true}
          />
        </div>
      </div>

      {/* ════════════════════════════════════════
          PAGE CONTENT
          ════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {activeTab === "Facts" && (
          <FactsPanel
            timeline={timeline}
            member={member}
            parents={parents}
            spouseChildGroups={spouseChildGroups}
            onNav={onNav}
          />
        )}
        {activeTab === "Hints" && <HintsPanel />}
        {activeTab === "Gallery" && (
          <GalleryPanel photo={member.photo} name={fullName} />
        )}
        {activeTab === "LifeStory" && (
          <LifeStoryPanel
            member={member}
            events={lifeStoryEvents}
            parents={parents}
            spouses={spouses}
            children={children}
            summary={summary}
            onNav={onNav}
          />
        )}
        {activeTab === "Explore" && <ExplorePanel />}
      </div>
    </div>
  );
}
