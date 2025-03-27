---
title: "Certified Red Team Expert (CRTE) – My Review & Takeaways"
description: From CRTP to CRTE – the deep dive into multi-forest AD attacks and modern evasion.
categories: [certifications, red-teaming]
comments: false
tags: [CRTE, Active-Directory, offensive-security, penetration-testing]
date: 2025-03-27
---

## Introduction

After completing CRTP and wanting to take things to the next level, I enrolled in the **Certified Red Team Expert (CRTE)** course by Altered Security. It did not disappoint.

The course dives deep into **Active Directory exploitation, evasion of modern defenses, and hybrid Azure AD attacks**, all within a multi-forest, fully patched lab environment. This post summarizes my experience, including lab highlights, exam format, and practical tips.

> **TL;DR:** CRTE isn’t just a certification—it’s a battlefield simulation for experienced red teamers.

## Bootcamp or Self-Paced?

I opted for the **Bootcamp recordings** version, and I highly recommend it. The structured walkthroughs, doubt-clearing sessions, and extra context made the journey smoother. 

Nikhil’s explanations are practical and experience-driven—this isn’t academic fluff. Expect real-world attack paths and plenty of “ah-ha” moments.

## What You’ll Learn

The course goes far beyond CRTP, covering advanced TTPs like:

- 🧩 **Abusing modern AD features:** LAPS, gMSA, ADCS, RBCD
- ☁️ **Hybrid Azure AD abuse**
- 🔐 **Bypassing security controls:** JEA, CLM, AppLocker, MDI, WDAC
- 🧠 **Cross-domain & cross-forest attacks**
- 💣 **Persistence techniques:** Skeleton Key, Diamond Tickets, Shadow Credentials

All in a **Server 2019** environment with realistic, fully patched setups and trust relationships.

## Lab Experience

Honestly, this is one of the **best labs** I’ve ever worked in:

- Multi-domain, cross-forest, and Azure-connected
- 60+ flags to validate your progress
- No brute-force needed—pure logic and tradecraft
- You’re not left guessing—bootcamp walkthroughs guide you through solid enumeration and abuse chains

Tip: **Enumerate harder**. Manual review of BloodHound nodes saved me multiple times.

## The Exam

- ⏱ 48 hours + 1 bonus hour to complete all objectives
- 🧾 47 additional hours to submit a report
- 🖥 Starts from an assumed breach—access to a foothold VM (`userexam`)
- 💡 5 targets across domains, requiring different privilege escalation and trust abuse chains
- 🧠 Enumeration-heavy: Know your ACLs, delegation paths, and GPOs

> I hit a wall mid-exam. Enumeration saved me. Read every node in BloodHound. Twice.

## Reporting

CRTE emphasizes operational realism, so reporting matters:

- I used **Report Ranger** by Volkis (Markdown-to-PDF)
- Documented as I went, which made the final 44-page report faster to polish
- Include: Screenshots, abuse chains, remediations, and references

## Final Thoughts

If CRTP was the intro to AD abuse, CRTE is the **advanced campaign**. I walked away with:

- Stronger graph-based attack thinking
- Real Azure/AD hybrid knowledge
- Better enumeration discipline
- A deeper understanding of Windows internals

> 🧨 This cert didn’t just sharpen my red team skills—it changed how I approach entire enterprise networks.

---

**Recommendation:**  
Do CRTP first unless you’re already comfortable with AD enumeration and basic delegation abuse. CRTE assumes experience.

**Score:** 9.5/10  
Knocked a few points for a couple lab hiccups, but the support team resolved them fast.

---

**Next?**  
Not sure—maybe CRTO, maybe some malware dev next. What I do know is that CRTE was worth every second.

Until next time 👋  
— Ben
