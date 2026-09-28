"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import CountUp from "@/components/react-bits/CountUp";

export type PricingPlan = {
  id: string;
  name: string;
  price: string | { monthly: { usd: number; inr: number }; yearly: { usd: number; inr: number } };
  desc: string;
  features: string[];
  popular?: boolean;
};

interface PricingProps {
  plans: PricingPlan[];
  billingCycle: "monthly" | "yearly";
  currency: "usd" | "inr";
}

const PricingCards = ({ plans, billingCycle, currency }: PricingProps) => {
  const pricingCardVariants = {
    hidden: {
      opacity: 0,
      x: -60,
    },
    visible: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.15,
        duration: 0.5,
        ease: "easeInOut" as const,
      },
    }),
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch h-full w-full justify-center">
      {plans.map((plan: PricingPlan, index: number) => {
        const isFeatured = plan.popular;
        
        return (
          <motion.div
            key={plan.id}
            variants={pricingCardVariants}
            initial="hidden"
            whileInView="visible"
            whileHover={{ scale: 1.02, y: -4, zIndex: 20 }}
            viewport={{ once: true }}
            custom={index}
            className={cn(
              "relative flex-1 flex flex-col w-full min-w-[280px]",
              isFeatured ? "z-10" : "z-0",
            )}
          >
            {/* GRADIENT BORDER */}
            {isFeatured && (
              <div className="absolute -inset-0.5 rounded-2xl overflow-hidden">
                {/* Animated conic-gradient border */}
                <div className="absolute -inset-full blur-md animate-spin [animation-duration:3s] bg-[conic-gradient(from_0deg,transparent_0_60deg,#0ea5e9_140deg,#38bdf8_180deg,transparent_180deg_240deg,#0ea5e9_320deg,#38bdf8_360deg)]" />
                {/* Inner mask */}
                <div className="absolute inset-0.5 rounded-2xl bg-[#030712]" />
              </div>
            )}

            {/* CORNER RIBBON */}
            {isFeatured && (
              <div className="absolute -top-2.5 -right-2.5 w-[150px] h-[150px] overflow-hidden z-20 pointer-events-none">
                <div className="absolute w-[150%] h-[34px] bg-gradient-to-r from-sky-600 via-sky-400 to-sky-500 flex items-center justify-center text-white font-bold tracking-[0.15em] uppercase text-[10px] shadow-[0_5px_10px_rgba(0,0,0,0.3)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 -translate-y-[34px]" />
                <div className="absolute w-[150%] h-[34px] flex items-center justify-center text-white font-bold tracking-[0.15em] uppercase text-[10px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 -translate-y-[34px]">
                  Popular
                </div>
                {/* Folds */}
                <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-sky-950 -z-10" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-sky-950 -z-10" />
              </div>
            )}

            {/* CARD */}
            <Card
              className={cn(
                "relative flex-1 flex flex-col rounded-2xl p-5 lg:p-6 gap-5 bg-[#070b14] text-slate-100",
                isFeatured ? "border-sky-500/50 shadow-[0_0_30px_rgba(14,165,233,0.15)] ring-0" : "border-white/10 hover:border-white/20",
              )}
            >
              <CardHeader className="p-0">
                <div className="flex flex-col gap-2 self-stretch">
                  <div className="flex items-start justify-between min-h-14">
                    <CardTitle className={cn(
                      "text-[17px] font-bold text-white leading-snug",
                      isFeatured ? "pr-14" : "pr-2"
                    )}>
                      {plan.name}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col flex-1 gap-4 p-0 mt-1">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-white text-3xl font-black font-mono">
                      {typeof plan.price === "string" ? (
                        plan.price
                      ) : (
                        <div className="flex items-baseline">
                          <span>{currency === "usd" ? "$" : "₹"}</span>
                          <CountUp
                            key={currency + billingCycle}
                            from={0}
                            to={currency === "usd" ? plan.price[billingCycle].usd : plan.price[billingCycle].inr}
                            duration={0.4}
                            separator=","
                          />
                        </div>
                      )}
                    </span>
                  </div>
                  {typeof plan.price !== "string" && (
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      per user / {billingCycle === "monthly" ? "month" : "year"}
                    </div>
                  )}
                </div>
                
                <CardDescription className="text-xs font-normal text-slate-400 max-w-[95%] leading-relaxed">
                  {plan.desc}
                </CardDescription>

                <Separator orientation="horizontal" className="bg-white/10" />

                <ul className="flex flex-col gap-2.5 flex-1 mt-1">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs font-normal text-slate-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-[2px]" />
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/dashboard" className="mt-2 block">
                  <button
                    className={cn(
                      "relative block w-full h-[44px] rounded-full p-0 m-0 overflow-hidden cursor-pointer group transition-all duration-400 focus:outline-none",
                      isFeatured ? "bg-sky-500 border-0" : "bg-transparent border border-white/10"
                    )}
                  >
                    {/* The Expanding Circle */}
                    <span 
                      className={cn(
                        "absolute left-[-1px] top-[-1px] bottom-[-1px] block w-[44px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.65,0,0.076,1)] group-hover:w-[102%]",
                        isFeatured ? "bg-white" : "bg-sky-500"
                      )}
                    >
                      {/* The Arrow Icon Container */}
                      <span 
                        className={cn(
                          "absolute left-[13px] top-1/2 -translate-y-1/2 w-[18px] h-[2px] transition-all duration-500 ease-[cubic-bezier(0.65,0,0.076,1)] group-hover:translate-x-4 bg-transparent",
                          isFeatured ? "group-hover:bg-black" : "group-hover:bg-white"
                        )}
                      >
                        {/* Chevron */}
                        <span 
                          className={cn(
                            "absolute top-[-4px] right-[1px] w-[10px] h-[10px] border-t-2 border-r-2 rotate-45",
                            isFeatured ? "border-black" : "border-white"
                          )}
                        />
                      </span>
                    </span>

                    {/* The Text */}
                    <span 
                      className={cn(
                        "absolute inset-0 flex items-center justify-center font-bold text-[11px] uppercase tracking-wider transition-colors duration-500 ease-[cubic-bezier(0.65,0,0.076,1)] pl-4",
                        isFeatured ? "text-slate-900" : "text-white"
                      )}
                    >
                      {plan.id === "free" ? "Start Free" : "Get Started"}
                    </span>
                  </button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PricingCards;
