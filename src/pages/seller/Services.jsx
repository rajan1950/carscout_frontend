import React from "react";
import { motion } from "framer-motion";
import { FaTools, FaFileContract, FaPhoneAlt, FaCalendarCheck, FaShieldAlt, FaClock } from "react-icons/fa";
import { Link } from "react-router-dom";
import UserNavbar from "../../layouts/UserNavbar";

const serviceCards = [
  {
    title: "Periodic Car Servicing",
    description: "Routine checkups with engine diagnostics, oil change, filter replacement, and safety checks.",
    icon: FaTools,
  },
  {
    title: "Policies & Terms Guidance",
    description: "Transparent policy details on booking, cancellation, delivery, test-drives, and buyer-seller responsibilities.",
    icon: FaFileContract,
  },
  {
    title: "Dedicated Contact Support",
    description: "Direct support for listing issues, payment questions, and order or booking assistance.",
    icon: FaPhoneAlt,
  },
];

const policyItems = [
  "All listed vehicles go through basic listing verification before being shown to buyers.",
  "Test-drive slots are subject to seller confirmation and local availability.",
  "Refunds and cancellations are handled as per booking stage and service progress.",
  "Users must provide accurate vehicle and profile information while transacting.",
];

const quickStats = [
  { label: "Service Requests", value: "1.2K+", icon: FaCalendarCheck },
  { label: "Policy Compliance", value: "98%", icon: FaShieldAlt },
  { label: "Avg. Support Response", value: "< 2 Hours", icon: FaClock },
];

const Services = () => {
  const MotionDiv = motion.div;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f5f0e8_0%,_#f8f7f3_35%,_#eff3f4_100%)] text-slate-900">
      <UserNavbar />

      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-amber-300/25 blur-3xl" />
        <div className="absolute -bottom-14 -right-16 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="uppercase tracking-[0.2em] text-xs md:text-sm text-amber-700 font-semibold mb-4"
          >
            Car Scout Services
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight text-slate-900"
          >
            Service Support That Keeps Every Deal Smooth
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 max-w-3xl text-base md:text-lg text-slate-700"
          >
            From car servicing support to policy transparency and direct contact help, this page covers the core assistance your buyers and sellers need.
          </motion.p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#servicing"
              className="inline-flex items-center bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-full text-sm font-semibold"
            >
              Car Servicing
            </a>
            <a
              href="#policies"
              className="inline-flex items-center bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-full text-sm font-semibold"
            >
              Policies & Terms
            </a>
            <a
              href="#contact"
              className="inline-flex items-center border border-slate-300 hover:border-slate-700 px-6 py-3 rounded-full text-sm font-semibold text-slate-800"
            >
              Contact Us
            </a>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-10">
            {quickStats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-xl bg-white/90 border border-slate-200 px-4 py-3">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                    <Icon className="text-slate-500" /> {item.label}
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="servicing" className="max-w-7xl mx-auto px-6 pb-12">
        <h2 className="text-3xl font-black text-slate-900 mb-8">Our Core Services</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {serviceCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <MotionDiv
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm"
              >
                <div className="h-11 w-11 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Icon />
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{card.description}</p>
              </MotionDiv>
            );
          })}
        </div>
      </section>

      <section id="policies" className="max-w-7xl mx-auto px-6 pb-12">
        <div className="rounded-3xl bg-white border border-slate-200 p-7 md:p-9">
          <h2 className="text-3xl font-black text-slate-900">Policies & Terms</h2>
          <p className="mt-3 text-slate-600 text-sm md:text-base">
            Our platform policies are built to keep both buyers and sellers protected, informed, and confident during every step.
          </p>

          <div className="mt-6 grid md:grid-cols-2 gap-3">
            {policyItems.map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="max-w-7xl mx-auto px-6 pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-800 text-white p-7 md:p-9">
          <h2 className="text-3xl font-black">Contact Us</h2>
          <p className="mt-3 text-slate-200 max-w-2xl">
            Need immediate support for car servicing, policy questions, or account issues? Reach out directly and our team will assist quickly.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href="mailto:carscout85@gmail.com" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg text-sm font-semibold">
              Email Support
            </a>
            <a href="tel:+918320169150" className="bg-white text-slate-900 px-6 py-3 rounded-lg text-sm font-semibold">
              Call +91 83201 69150
            </a>
            <Link to="/" className="border border-white/40 hover:border-white text-white px-6 py-3 rounded-lg text-sm font-semibold">
              Back To Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
