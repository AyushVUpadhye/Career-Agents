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
        
        const priceDisplay =
          typeof plan.price === "string"
            ? plan.price
            : currency === "usd"
            ? `$${plan.price[billingCycle].usd}`
            : `₹${plan.price[billingCycle].inr}`;

        return (
          <motion.div
            key={plan.id}
            variants={pricingCardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={index}
            className={cn(
              "relative flex-1 flex flex-col w-full min-w-[280px]",
              isFeatured && "z-10",
            )}
          >
            {/* GRADIENT BORDER */}
            {isFeatured && (
              <div className="absolute -inset-0.5 rounded-2xl overflow-hidden">
                {/* Animated conic-gradient border */}
                <div className="absolute -inset-full blur-xs animate-spin [animation-duration:3s] bg-[conic-gradient(from_0deg,transparent_0_340deg,#0ea5e9_360deg)]" />
                {/* Inner mask */}
                <div className="absolute inset-0.5 rounded-2xl bg-[#030712]" />
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-white">
                      {plan.name}
                    </CardTitle>
                    {isFeatured && (
                      <Badge className="py-0.5 px-2 text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-400/30 flex items-center gap-1.5 hover:bg-sky-500/20">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs font-normal text-slate-400 max-w-[95%] leading-relaxed">
                    {plan.desc}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col flex-1 gap-4 p-0 mt-1">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-white text-3xl font-black font-mono">
                      {priceDisplay}
                    </span>
                  </div>
                  {typeof plan.price !== "string" && (
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      per user / {billingCycle === "monthly" ? "month" : "year"}
                    </div>
                  )}
                </div>

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
                  <Button
                    className={cn(
                      "w-full text-xs font-semibold h-9 rounded-lg transition-all flex items-center justify-center group",
                      isFeatured
                        ? "bg-sky-500 hover:bg-sky-400 text-black shadow-sm"
                        : "bg-transparent hover:bg-white/[0.04] text-white border border-white/10"
                    )}
                  >
                    <span>{plan.id === "free" ? "Start Free" : "Get Started"}</span>
                    <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
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
