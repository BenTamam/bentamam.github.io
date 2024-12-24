---
title: "Bypassing Cortex XDR"
description: Broke it, disclosed it, patched it.
categories: [security-research, EDR]
comments: false
tags: [penetration-testing, offensive-security]
date: 2022-12-22
---


## Introduction

As a Red Teamer, I've spent considerable time analyzing EDR solutions. Today, I'm sharing my research on bypassing Cortex XDR's tampering protection - a vulnerability that has since been patched. This analysis was conducted under Palo Alto Networks' responsible disclosure policy and relates to patch PAN-SA-2022-0005.

> **Note**: This vulnerability has been patched. This article is published for educational purposes and to demonstrate the importance of continuous security improvements in EDR solutions.

## Agent’s Version

The version of the software that was tested was 7.80, and all of its protections were enabled, including tampering protection. The testing was performed in both normal and aggressive modes to evaluate the software’s security capabilities thoroughly.

![Cortex-Version](https://miro.medium.com/v2/resize:fit:1374/format:webp/0*PbLOP8kLASxiBntJ.jpg){: width="900" height="400" }


## Disabling the Agent
As mentioned in PAN-SA-2022–0002, we will try to reproduce and alter the ServiceDLL, which directs Cortex XDR to the exact location of the cryptsvc DLL which is one of Cortex XDR’s dependencies and modifying it could potentially disable the XDR.

However, this attempt was unsuccessful, as we anticipated -
![ServiceDLL Attempt](https://miro.medium.com/v2/resize:fit:1400/format:webp/0*ClfiwhwPsa4TuuI8.png){: width="900" height="400" }

## What is tamper protection?
Tamper protection is a security feature that helps prevent unauthorized changes to a system or device. These changes may include attempts to disable services, modify system files or configuration settings, or access sensitive data. In the context of EDRs, tamper protection can protect the EDR sensor from attempts to disrupt its operation or alter its behavior. By implementing tamper protection, organizations can help ensure the integrity and security of their EDR systems.

## Let’s get down to business
As previously mentioned, Cortex XDR relies on the cryptographic services provided by the Windows operating system. This dependency is necessary for the proper functioning and operation of Cortex XDR -

![Cryptographic Services](https://miro.medium.com/v2/resize:fit:750/format:webp/0*fIcRPqDTSZ0-5zav.png){: width="900" height="400" }

To analyze the “cryptsvc.dll” file, we can utilize several tools, such as DUMPBin, a tool included in Visual Studio. The /EXPORT function can be used to display all the definitions exported from the DLL file, providing insight into the functions and data available for use in other programs that import the DLL. Alternatively, DLL Export Viewer can also be used for the same purpose. In this case, we will utilize DLL Export Viewer for our analysis -
![DLL Export Viewer](https://miro.medium.com/v2/resize:fit:786/format:webp/0*umDdKkvre1Il_5IC.png){: width="900" height="400" }


We can see that one of the exported functions of the DLL is “CryptServiceMain”, which we found earlier under the “ServiceMain” key’s value. We will attempt to tamper with it by modifying this registry key.

As mentioned previously, the registry key can be found at `HKLM\SYSTEM\CurrentControlSet\Services\CryptSvc\Parameters\ServiceMain.`

To complete this task, the following registry file can be utilized -

```powershell
Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\CryptSvc\Parameters]
"ServiceDllUnloadOnStop"=dword:1
"ServiceMain"="CryptServiceMain_Disable_Cortex"
```

Or With elevated Command prompt and PowerShell -

This code uses the New-ItemProperty cmdlet to create new registry values in the specified path. The first value (“ServiceDllUnloadOnStop”) is of type DWord, and the second value (“ServiceMain”) is of type String. The values are set to the same values as in the .reg file.

```powershell
$registryPath = "HKLM:\SYSTEM\CurrentControlSet\Services\CryptSvc\Parameters"
New-ItemProperty -Path $registryPath -Name "ServiceDllUnloadOnStop" -PropertyType DWord -Value 1
New-ItemProperty -Path $registryPath -Name "ServiceMain" -PropertyType String -Value "CryptServiceMain_Disable_Cortex"
```

Upon executing the file,
![Regedit](https://miro.medium.com/v2/resize:fit:640/format:webp/0*Aq6u5OQftShhiCIf.png){: width="900" height="400" }

Our analysis reveals that the registry values have been altered, and Cortex XDR has not prevented this activity.
![Image](https://miro.medium.com/v2/resize:fit:786/format:webp/0*dR3uFArY3DJHvZp1.png){: width="900" height="400" }

Upon restarting the machine, Cortex XDR should be completely disabled.
![alt text](https://miro.medium.com/v2/resize:fit:750/format:webp/0*U4Yf2l-ffKkev9_W.png){: width="900" height="400" }

## Responsible Disclosure Timeline

- **September 30, 2022**: Initial email sent to Palo Alto Networks reporting the bypass vulnerability.
- **December 14, 2022**: Palo Alto Networks released a patch addressing the issue.
- **December 14, 2022**: Findings and recommendations published in advisory [PAN-SA-2022-0005](https://security.paloaltonetworks.com/PAN-SA-2022-0005).
