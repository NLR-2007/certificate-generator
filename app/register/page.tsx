"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2, User, Mail, Phone, Building, Code2, Users, Rocket, Trophy, Calendar, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const HACKATHON_EVENTS = [
  {
    id: "sih-2026",
    title: "Smart India Hackathon 2026",
    subtitle: "Internal Round - KLH Bachupally",
    dates: "March 15-16, 2026",
    location: "Campus Auditorium, KLH Bachupally",
    badge: "Official SIH",
  },
  {
    id: "edc-innovate-2026",
    title: "KLH ED Cell Innovation Sprint",
    subtitle: "Startup & Product Prototype Challenge",
    dates: "April 02-03, 2026",
    location: "Incubation Center, KLH",
    badge: "ED Cell",
  },
  {
    id: "ai-robotics-2026",
    title: "AI & Robotics National Hackathon",
    subtitle: "Generative AI & Hardware Automation",
    dates: "May 10-11, 2026",
    location: "R&D Labs, KLH Bachupally",
    badge: "National",
  },
];

export default function HackathonRegisterPage() {
  const [selectedEvent, setSelectedEvent] = useState(HACKATHON_EVENTS[0].id);
  const [name, setName] = useState("");
  const [rollId, setRollId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dept, setDept] = useState("CSE");
  const [teamName, setTeamName] = useState("");
  const [role, setRole] = useState("Leader");
  const [projectTitle, setProjectTitle] = useState("");

  const [loading, setLoading] = useState(false);
  const [submittedPass, setSubmittedPass] = useState<any | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !rollId.trim() || !email.trim() || !phone.trim() || !teamName.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const eventDetails = HACKATHON_EVENTS.find((evt) => evt.id === selectedEvent) || HACKATHON_EVENTS[0];
      const regPassId = `KLH-REG-${Math.floor(100000 + Math.random() * 900000)}`;

      setSubmittedPass({
        passId: regPassId,
        participantName: name.trim().toUpperCase(),
        rollId: rollId.trim().toUpperCase(),
        email: email.trim(),
        phone: phone.trim(),
        dept,
        teamName: teamName.trim(),
        role,
        projectTitle: projectTitle.trim() || "GenAI & Automation Solutions",
        eventTitle: eventDetails.title,
        eventDates: eventDetails.dates,
        eventLocation: eventDetails.location,
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      });

      setLoading(false);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* HEADER HERO */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          <span>KLH Hackathon Registration Portal 2026</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl heading-font tracking-tight">
          Register for KLH Hackathons
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Participate in the upcoming Smart India Hackathon internal rounds and ED Cell innovation sprints at KLH Bachupally.
        </p>
      </div>

      {/* EVENT SELECTOR CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {HACKATHON_EVENTS.map((evt) => {
          const isSelected = selectedEvent === evt.id;
          return (
            <div
              key={evt.id}
              onClick={() => setSelectedEvent(evt.id)}
              className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 space-y-3 ${
                isSelected
                  ? "border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 shadow-lg shadow-blue-500/10"
                  : "border-slate-900/10 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 hover:border-slate-400 dark:hover:border-white/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <Badge variant={isSelected ? "info" : "neutral"} className="text-[10px] uppercase font-bold">
                  {evt.badge}
                </Badge>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base heading-font">{evt.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{evt.subtitle}</p>
              </div>
              <div className="pt-2 text-[11px] text-gray-600 dark:text-gray-400 space-y-1 border-t border-slate-900/5 dark:border-white/5">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1.5 text-blue-500" />
                  <span>{evt.dates}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1.5 text-indigo-500" />
                  <span>{evt.location}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* REGISTRATION FORM OR SUCCESS PASS */}
      {submittedPass ? (
        /* SUCCESS CONFIRMATION PASS */
        <Card className="border-emerald-500/30 bg-slate-900 text-white shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-white mx-auto" />
            <h2 className="text-2xl font-extrabold text-white heading-font">Hackathon Registration Confirmed!</h2>
            <p className="text-emerald-100 text-xs font-mono">Registration Pass ID: {submittedPass.passId}</p>
          </div>

          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-6">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Participant Name</span>
                <p className="font-extrabold text-lg text-white">{submittedPass.participantName}</p>
                <p className="text-xs font-mono text-blue-400">Roll ID: {submittedPass.rollId}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Registered Event</span>
                <p className="font-bold text-base text-white">{submittedPass.eventTitle}</p>
                <p className="text-xs text-slate-400">{submittedPass.eventDates}</p>
              </div>

              <div className="space-y-1 border-t border-slate-800 pt-4">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Team Details</span>
                <p className="font-bold text-white">{submittedPass.teamName} ({submittedPass.role})</p>
                <p className="text-xs text-slate-400">Dept: {submittedPass.dept} | {submittedPass.email}</p>
              </div>

              <div className="space-y-1 border-t border-slate-800 pt-4">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Project Idea Title</span>
                <p className="font-medium text-slate-300">{submittedPass.projectTitle}</p>
                <p className="text-[11px] text-emerald-400 mt-1">Confirmed on {submittedPass.timestamp}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link href="/generate" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full bg-white text-slate-950 font-bold hover:bg-gray-200">
                  <span>Generate Certificate Portal</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setSubmittedPass(null)}
                className="w-full sm:w-auto text-xs text-slate-400 border-slate-700 hover:bg-slate-800"
              >
                Register Another Team Member
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* HACKATHON REGISTRATION FORM */
        <Card className="border-slate-900/10 dark:border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Rocket className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              Participant & Team Registration Form
            </CardTitle>
            <CardDescription>
              Fill out your details to enter the selected hackathon event at KLH Bachupally.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Full Name (As per College Records) *
                  </label>
                  <Input
                    placeholder="e.g. MARRI HRUTHIKA"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Roll Number / Reg ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Roll Number / Reg ID *
                  </label>
                  <Input
                    placeholder="e.g. 2520090002"
                    value={rollId}
                    onChange={(e) => setRollId(e.target.value)}
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Student Email Address *
                  </label>
                  <Input
                    type="email"
                    placeholder="e.g. student@klh.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    WhatsApp Contact Number *
                  </label>
                  <Input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Department / Campus
                  </label>
                  <select
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-black px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-slate-300"
                  >
                    <option value="CSE">Computer Science & Engineering (CSE)</option>
                    <option value="AI&DS">Artificial Intelligence & Data Science (AI&DS)</option>
                    <option value="ECE">Electronics & Communication (ECE)</option>
                    <option value="CS&IT">Computer Science & IT (CS&IT)</option>
                    <option value="MECHANICAL">Mechanical & Robotics</option>
                  </select>
                </div>

                {/* Team Role */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Team Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-black px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-slate-300"
                  >
                    <option value="Leader">Team Leader</option>
                    <option value="Member">Team Member</option>
                    <option value="Solo">Individual Participant</option>
                  </select>
                </div>
              </div>

              {/* Team Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Hackathon Team Name *
                </label>
                <Input
                  placeholder="e.g. Black Panthers / Innovators 2026"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
              </div>

              {/* Project Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Proposed Project Title / Problem Statement
                </label>
                <Input
                  placeholder="e.g. AI-Powered Smart Certificate Verification System"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-semibold">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                isLoading={loading}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-gray-200 font-bold py-3 text-base"
              >
                <span>Submit Hackathon Registration</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
