---
title: "Certified Red Team Expert (CRTE) – 60 Days of Forest Hopping and Ticket Forging"
description: I abused Kerberos, broke into forests, bypassed MDI... and earned another PDF
categories: [certifications, red-teaming]
comments: false
tags: [CRTE, Active-Directory, penetration-testing, certification-review]
date: 2025-03-27
---

## Introduction

After completing CRTP and gaining hands-on red teaming experience, I decided to take the next step and enroll in the **Certified Red Team Expert (CRTE)** course from Altered Security.

I chose the **60-day self-paced version** without the bootcamp. While I was familiar with most of the content, the **structured lab**, **multi-forest scenarios**, and **exam format** still provided valuable hands-on challenges.

![CRTE Certificate](https://api.accredible.com/v1/frontend/credential_website_embed_image/certificate/136944578)
> *Proof I spent 300+ hours abusing Kerberos just to earn this piece of digital paper.*

---

## Course Overview

The CRTE course builds upon CRTP and focuses on modern red team techniques in **fully patched, enterprise-grade environments**.

You’ll work through 62 tasks and over 30 learning objectives including:

- Active Directory Certificate Services (AD CS)
- LAPS / gMSA enumeration and abuse
- Trust key manipulation and sIDHistory attacks
- Azure AD Hybrid Identity misconfigurations
- Ticket-based persistence (Golden, Silver, Diamond)
- MSSQL-linked escalation paths
- Evasion of Microsoft Defender for Identity (MDI) and Microsoft Defender for Endpoint (MDE)

![CRTE Lab Map](https://static.wixstatic.com/media/470c31_9edc22a0a457492dadf4dba6a0ac01c6~mv2.jpg/v1/crop/x_0,y_151,w_1000,h_698/fill/w_910,h_635,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/ads.jpg)
> *The CRTE lab spans multiple domains and forests, simulating real-world enterprise complexity.*

---

## Lab Experience

The lab provided a **realistic playground** where each task felt like a mini engagement. Some highlights:

- Lateral movement via **LSASS**, **gMSA**, **MSSQL abuse**
- Escalation through **RBCD**, **Kerberoasting**, **ADCS**
- Enumeration of **trust keys**, **FSPs**, and **PAM trust**

You’ll learn to think in graphs. And if you rely too much on automation, you’ll likely miss things. 

---

## Key Topics Explored

- **PowerShell Remoting** & WinRM-based movement  
- **Ticket Forgery**: Golden, Silver, Diamond  
- **Kerberos Delegation**: Unconstrained, Constrained, RBCD  
- **AD CS Attacks**: THEFT4 and shadow credentials  
- **Azure AD Integration** abuse from hybrid sync misconfigs  
- **Trust Abuse**: Cross-forest sIDHistory, PAM trust, TrustKey  
- **MDI/MDE Bypass Techniques** using custom tooling

---

## Exam Format

The exam gives you **48 hours** (plus a bonus hour), followed by **47 hours** for report submission. You start from a foothold VM (`userexam`) and compromise multiple targets across domains.

- Enumeration is everything.
- Think in chains — no single exploit will win the exam.
- Use your own tooling where helpful, but most techniques are lab-native.

## Reporting

Reporting matters as much as the exploitation.

- Final report: ~50 pages with detailed attack chains, screenshots, and remediations


---

**TL;DR:**

- 60 days of lab time is perfect if you know your way around AD  
- The exam is more “real engagement” than “CTF”  
- You’ll walk out with new tools, new scars, and probably a hatred of delegation  
- Worth every shekel  
