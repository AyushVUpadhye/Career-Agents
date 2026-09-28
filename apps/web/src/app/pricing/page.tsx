"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PricingCards from "@/components/ui/pricing-02";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [currency, setCurrency] = useState<"usd" | "inr">("usd");

  const plans = [
    {
      id: "free",
      name: "Community & Local",
      price: { monthly: { usd: 0, inr: 0 }, yearly: { usd: 0, inr: 0 } },
      desc: "Instant career audits without any signup or credentials required.",
      features: [
        "167 open-source agents access",
        "Local SQLite browser database",
        "ATS resume structure parser",
        "Standard latency fallback routing",
        "Community GitHub support",
      ],
    },
    {
      id: "pro",
      name: "Professional Candidate",
      price: { monthly: { usd: 29, inr: 2400 }, yearly: { usd: 19, inr: 1600 } },
      desc: "For active software engineers target-matching senior & staff interview loops.",
      features: [
        "Unlimited resume STAR evaluations",
        "Unlimited GitHub repository audits",
        "Voice STAR mock coach with audio rubric",
        "31 Model Context Protocol (MCP) tools",
        "Claude 3.5 Sonnet & GPT-4o gateways",
        "Priority API execution queue",
      ],
      popular: true,
    },
    {
      id: "team",
      name: "Team & Cohort",
      price: { monthly: { usd: 79, inr: 6500 }, yearly: { usd: 59, inr: 4900 } },
      desc: "Collaborative workspaces for bootcamps, university cohorts, and recruitment firms.",
      features: [
        "Everything in Professional",
        "Shared candidate pipeline workspaces",
        "Collaborative ATS scorecards",
        "Private RAG vector database sync",
        "Dedicated onboarding support",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise SLA",
      price: "Custom",
      desc: "Dedicated model fine-tuning and strict SLA deployments for large teams.",
      features: [
        "Everything in Team plan",
        "Private VPC deployment (AWS, GCP)",
        "SSO, SAML, and custom RBAC policies",
        "99.9% API availability SLA",
        "Zero-retention privacy guarantees",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans py-20 px-4 sm:px-6 lg:px-8 relative overflow-y-auto z-10">
      {/* Ambient Lighting Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-sky-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to landing
        </Link>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Transparent Plans for <span className="text-sky-400">Engineering Careers</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Run open-source agents locally for free or scale with high-throughput cloud LLM gateways and voice mock infrastructure.
          </p>

          {/* Toggle Controls */}
          <div className="flex items-center justify-center gap-4 pt-4 text-xs font-mono">
            <div className="p-1 rounded-lg bg-[#070b14] border border-white/10 flex items-center gap-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  billingCycle === "monthly" ? "bg-sky-500 text-black font-semibold" : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  billingCycle === "yearly" ? "bg-sky-500 text-black font-semibold" : "text-slate-400 hover:text-white"
                }`}
              >
                Yearly (Save 35%)
              </button>
            </div>

            <div className="p-1 rounded-lg bg-[#070b14] border border-white/10 flex items-center gap-1">
              <button
                onClick={() => setCurrency("usd")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  currency === "usd" ? "bg-white/10 text-white font-semibold" : "text-slate-400"
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency("inr")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  currency === "inr" ? "bg-white/10 text-white font-semibold" : "text-slate-400"
                }`}
              >
                INR (₹)
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <PricingCards plans={plans} billingCycle={billingCycle} currency={currency} />

        {/* Security Assurance */}
        <div className="flex justify-start pt-4 pb-8">
          <ul className="flex flex-col gap-3 text-xs sm:text-sm font-mono text-slate-400">
            <li className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0" />
              <span>Local-first architecture guarantee: Your resumes are never sold or trained upon.</span>
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0" />
              <span>Cancel or switch plans anytime with single-click billing management.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
