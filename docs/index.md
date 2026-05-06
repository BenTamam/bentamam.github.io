---
layout: home
hero:
  name: Ben Tamam
  text: Offensive Security Research
  tagline: Offensive security at Check Point. Vulnerability research, reverse engineering, and whatever else catches my attention. This is where I publish it.
  actions:
    - theme: brand
      text: Read the Latest
      link: /advisories/fastgpt-cve-2026-44287
    - theme: alt
      text: About Me
      link: /aboutme
features:
  - title: FastGPT code-sandbox RCE (CVE-2026-44287)
    details: Sandbox escape in FastGPT's JS code-sandbox through 4.14.14. The dynamic-import denylist regex misses block comments between `import` and `(`, so `import/**/("child_process")` slips through and gives arbitrary command execution as uid=100(sandbox). Patched in 4.15.0-beta1.
    link: /advisories/fastgpt-cve-2026-44287
    linkText: Read the Advisory
  - title: TCExam SQL Injection (CVE-2026-39202)
    details: Authenticated SQL injection in TCExam through 16.6.2 via the selectsubject parameter. Error-based EXTRACTVALUE exfiltration plus arbitrary file read via LOAD_FILE. Patched same-day in 16.6.3.
    link: /advisories/tcexam-cve-2026-39202
    linkText: Read the Advisory
  - title: Bypassing Cortex XDR (PAN-SA-2022-0005)
    details: Registry-based tamper-protection bypass I found in Cortex XDR 7.8.0 and disclosed to Palo Alto Networks.
    link: /blog/bypassing-cortex-xdr
    linkText: Read the Advisory
  - title: MSSQL CLR Code Execution
    details: Loading an unsafe CLR assembly into SQL Server to allocate memory, copy shellcode, and spawn a thread inside sqlservr.exe.
    link: /blog/mssql-clr-code-exec
    linkText: Read the Post
---
